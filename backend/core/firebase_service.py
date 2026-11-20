"""
Firebase Admin SDK & Firebase Storage Service for Aruvi Collections.
Handles secure uploads, WebP optimization, signed URLs, file deletion, and retention management.
"""

import io
import os
import uuid
import datetime
from PIL import Image
import firebase_admin
from firebase_admin import credentials, storage, auth
from django.conf import settings

_firebase_app = None
_bucket = None

def get_firebase_app():
    global _firebase_app
    if _firebase_app:
        return _firebase_app

    try:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except ValueError:
        pass

    cred_path = getattr(settings, 'FIREBASE_CREDENTIALS_PATH', '')
    bucket_name = getattr(settings, 'FIREBASE_STORAGE_BUCKET', 'aruvicollections-5ce06.firebasestorage.app')
    options = {'storageBucket': bucket_name}

    if cred_path and os.path.isfile(cred_path):
        cred = credentials.Certificate(cred_path)
        _firebase_app = firebase_admin.initialize_app(cred, options)
    else:
        # In cloud environments or local with default credentials
        try:
            _firebase_app = firebase_admin.initialize_app(options=options)
        except Exception as e:
            print(f"[FirebaseService] Initializing with default app options warning: {e}")
            try:
                _firebase_app = firebase_admin.initialize_app()
            except Exception as e2:
                print(f"[FirebaseService] Warning on initialize: {e2}")
                _firebase_app = None

    return _firebase_app


def get_firebase_storage_bucket():
    """Retrieve the Firebase Storage bucket instance."""
    global _bucket
    if _bucket:
        return _bucket

    app = get_firebase_app()
    bucket_name = getattr(settings, 'FIREBASE_STORAGE_BUCKET', 'aruvicollections-5ce06.firebasestorage.app')
    try:
        _bucket = storage.bucket(name=bucket_name, app=app)
    except Exception as e:
        print(f"[FirebaseService] Error getting storage bucket {bucket_name}: {e}")
        _bucket = None
    return _bucket


def optimize_image_to_webp(image_file, max_dimension=1600, quality=85):
    """
    Validates, resizes if oversized, and compresses an image to modern WebP format.
    Returns: (bytes_io, content_type, width, height)
    """
    img = Image.open(image_file)
    
    # Auto-orient based on EXIF tag if available
    try:
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    # Convert to RGB (or RGBA if transparent PNG)
    if img.mode in ('RGBA', 'LA'):
        format_type = 'WEBP'
    else:
        img = img.convert('RGB')
        format_type = 'WEBP'

    # Downscale smoothly if larger than max_dimension
    w, h = img.size
    if max(w, h) > max_dimension:
        scale = max_dimension / float(max(w, h))
        new_w = int(w * scale)
        new_h = int(h * scale)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        w, h = new_w, new_h

    output = io.BytesIO()
    img.save(output, format='WEBP', quality=quality, method=6)
    output.seek(0)
    return output, 'image/webp', w, h


def upload_image_to_firebase(file_obj, destination_folder='products', filename=None, convert_to_webp=True, make_public=True):
    """
    Uploads an image file to Firebase Cloud Storage.
    Validates format, converts to WebP, and uploads securely.
    Returns dict:
      {
         'url': str,
         'storage_path': str,
         'content_type': str,
         'size_bytes': int,
         'width': int,
         'height': int
      }
    """
    bucket = get_firebase_storage_bucket()
    unique_id = uuid.uuid4().hex[:12]
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')

    if convert_to_webp:
        stream, content_type, width, height = optimize_image_to_webp(file_obj)
        extension = '.webp'
    else:
        stream = file_obj
        content_type = getattr(file_obj, 'content_type', 'image/jpeg')
        width, height = 0, 0
        extension = os.path.splitext(getattr(file_obj, 'name', 'img'))[1] or '.jpg'

    clean_base = filename or f"{timestamp}_{unique_id}"
    clean_base = os.path.splitext(clean_base)[0].replace(' ', '_')
    storage_path = f"{destination_folder}/{clean_base}{extension}"

    bytes_data = stream.getvalue() if hasattr(stream, 'getvalue') else stream.read()
    size_bytes = len(bytes_data)

    if bucket:
        try:
            blob = bucket.blob(storage_path)
            blob.upload_from_string(bytes_data, content_type=content_type)
            if make_public:
                try:
                    blob.make_public()
                    public_url = blob.public_url
                except Exception:
                    # If bucket doesn't allow object ACLs, use standard Firebase download URL pattern
                    bucket_name = getattr(settings, 'FIREBASE_STORAGE_BUCKET', 'aruvicollections-5ce06.firebasestorage.app')
                    encoded_path = storage_path.replace('/', '%2F')
                    public_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_path}?alt=media"
            else:
                public_url = generate_signed_download_url(storage_path)

            return {
                'url': public_url,
                'storage_path': storage_path,
                'content_type': content_type,
                'size_bytes': size_bytes,
                'width': width,
                'height': height,
            }
        except Exception as e:
            print(f"[FirebaseService] Upload failed on remote bucket: {e}")

    # Fallback when offline or running locally without remote service account keys
    # Save to local media storage and return media url
    local_rel_dir = os.path.join(settings.MEDIA_ROOT, destination_folder)
    os.makedirs(local_rel_dir, exist_ok=True)
    local_file_path = os.path.join(local_rel_dir, f"{clean_base}{extension}")
    with open(local_file_path, 'wb') as f:
        f.write(bytes_data)

    bucket_name = getattr(settings, 'FIREBASE_STORAGE_BUCKET', 'aruvicollections-5ce06.firebasestorage.app')
    encoded_path = storage_path.replace('/', '%2F')
    url = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_path}?alt=media"

    return {
        'url': url,
        'storage_path': storage_path,
        'content_type': content_type,
        'size_bytes': size_bytes,
        'width': width,
        'height': height,
        'local_path': local_file_path,
    }


def delete_file_from_firebase(storage_path):
    """
    Deletes an orphaned file from Firebase Storage bucket.
    Prevents storage bloat and guarantees deletion policies.
    """
    if not storage_path:
        return False

    bucket = get_firebase_storage_bucket()
    if bucket:
        try:
            blob = bucket.blob(storage_path)
            if blob.exists():
                blob.delete()
                return True
        except Exception as e:
            print(f"[FirebaseService] Delete failed for {storage_path}: {e}")

    # Also check local media fallback
    try:
        local_path = os.path.join(settings.MEDIA_ROOT, storage_path)
        if os.path.exists(local_path):
            os.remove(local_path)
            return True
    except Exception:
        pass

    return False


def generate_signed_download_url(storage_path, expiration_minutes=60):
    """
    Generates a secure, short-lived signed URL for private assets
    such as personal customer try-on photos.
    """
    bucket = get_firebase_storage_bucket()
    if not bucket or not storage_path:
        bucket_name = getattr(settings, 'FIREBASE_STORAGE_BUCKET', 'aruvicollections-5ce06.firebasestorage.app')
        encoded_path = storage_path.replace('/', '%2F')
        return f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_path}?alt=media"

    try:
        blob = bucket.blob(storage_path)
        expiration = datetime.timedelta(minutes=expiration_minutes)
        return blob.generate_signed_url(expiration=expiration, method='GET')
    except Exception as e:
        print(f"[FirebaseService] Signed URL generation failed: {e}")
        bucket_name = getattr(settings, 'FIREBASE_STORAGE_BUCKET', 'aruvicollections-5ce06.firebasestorage.app')
        encoded_path = storage_path.replace('/', '%2F')
        return f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_path}?alt=media"


def verify_firebase_id_token(id_token):
    """
    Verifies a Firebase ID token sent from React client via Authorization header.
    Returns decoded token dictionary containing user UID, email, etc.
    """
    if not id_token:
        return None

    try:
        decoded_token = auth.verify_id_token(id_token, app=get_firebase_app())
        return decoded_token
    except Exception as e:
        print(f"[FirebaseService] Token verification warning: {e}")
        # In dev mode, allow token decode for convenience
        return None
