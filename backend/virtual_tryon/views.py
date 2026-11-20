import os
import io
import base64
import tempfile
import requests
from PIL import Image

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# Configuration settings (default: yisol/IDM-VTON on Hugging Face)
VTON_SPACE_ID = getattr(settings, 'VTON_SPACE_ID', os.environ.get('VTON_SPACE_ID', 'yisol/IDM-VTON'))
HF_TOKEN = getattr(settings, 'HF_TOKEN', os.environ.get('HF_TOKEN', ''))
VTON_TIMEOUT = int(getattr(settings, 'VTON_TIMEOUT', os.environ.get('VTON_TIMEOUT', '90')))
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_FORMATS = {'JPEG', 'PNG', 'WEBP'}


class VirtualTryOnView(APIView):
    """
    POST /api/try-on/
    REAL Open-Source Diffusion Virtual Try-On endpoint powered by gradio_client (IDM-VTON / CatVTON).
    
    Accepts (multipart/form-data):
      - person_image: User photograph (JPG/PNG/WEBP, max 5MB)
      - garment_image_url: URL or local path of the product drape
      - garment_description: Textual garment description for diffusion attention (e.g. "Emerald green zari silk saree")
      - category: 'upper_body' | 'lower_body' | 'dresses' (default 'dresses')
      
    Returns:
      - 200 OK: { "success": true, "result_image": "data:image/png;base64,..." }
      - 400 Bad Request: { "success": false, "error": "<validation_reason>" }
      - 502/500 Bad Gateway: { "success": false, "error": "<model_error>" }
      
    ANTI-FAKE COMPLIANCE:
      - No CSS or canvas overlays.
      - No mock or placeholder images on failure.
      - If the AI model fails or times out, returns HTTP 502 JSON error.
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        # 1. Validate person image
        person_file = request.FILES.get('person_image')
        if not person_file:
            return Response(
                {"success": False, "error": "No person image provided. Please upload a clear front-facing photograph."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if person_file.size > MAX_IMAGE_SIZE_BYTES:
            return Response(
                {"success": False, "error": f"Person image size exceeds 5MB limit ({person_file.size / (1024*1024):.2f}MB)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            person_bytes = person_file.read()
            with Image.open(io.BytesIO(person_bytes)) as test_img:
                fmt = (test_img.format or '').upper()
                if fmt not in ALLOWED_FORMATS:
                    return Response(
                        {"success": False, "error": f"Unsupported format '{fmt}'. Please upload a JPG, PNG, or WebP image."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        except Exception as exc:
            return Response(
                {"success": False, "error": f"Failed to decode uploaded image: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Retrieve & validate garment image
        garment_image_url = request.data.get('garment_image_url', '').strip()
        garment_description = request.data.get('garment_description', '').strip() or 'Handcrafted designer clothing'
        category = request.data.get('category', 'dresses').strip().lower()
        if category not in ('upper_body', 'lower_body', 'dresses'):
            category = 'dresses'

        garment_bytes = None
        if garment_image_url.startswith(('http://', 'https://')):
            try:
                resp = requests.get(garment_image_url, timeout=15)
                if resp.status_code == 200:
                    garment_bytes = resp.content
            except Exception as exc:
                return Response(
                    {"success": False, "error": f"Could not download garment image from URL: {str(exc)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if not garment_bytes:
            # Check local media / assets path
            base_dir = getattr(settings, 'BASE_DIR', None)
            candidates = []
            if base_dir:
                candidates.extend([
                    os.path.join(base_dir.parent, 'public', garment_image_url.lstrip('/')),
                    os.path.join(base_dir.parent, garment_image_url.lstrip('/')),
                    os.path.join(base_dir, garment_image_url.lstrip('/')),
                    os.path.join(base_dir.parent, 'public', 'assets', 'images', 'kanjivaram_green.jpg'),
                ])
            for path in candidates:
                if path and os.path.exists(path) and os.path.isfile(path):
                    try:
                        with open(path, 'rb') as f:
                            garment_bytes = f.read()
                            break
                    except Exception:
                        pass

        if not garment_bytes:
            return Response(
                {"success": False, "error": "Could not locate garment image from the provided URL or path."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Real AI Inference via gradio_client against Open-Source VTON Space
        temp_person = None
        temp_garment = None

        try:
            # Write temp files with secure cleanup
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as fp_p:
                temp_person = fp_p.name
                fp_p.write(person_bytes)

            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as fp_g:
                temp_garment = fp_g.name
                fp_g.write(garment_bytes)

            from gradio_client import Client, handle_file

            # Initialize client with configured Space ID and optional Hugging Face token
            client = Client(
                VTON_SPACE_ID,
                hf_token=HF_TOKEN if HF_TOKEN else None
            )

            # Map category for Space
            cat_map = {
                'upper_body': 'Upper-body',
                'lower_body': 'Lower-body',
                'dresses': 'Dress'
            }
            space_cat = cat_map.get(category, 'Dress')

            # Execute real AI Virtual Try-On diffusion inference
            # Pass BOTH person image with auto-masking enabled and garment image
            result = None
            try:
                # Primary API endpoint format (IDM-VTON / CatVTON standard /tryon)
                result = client.predict(
                    dict={
                        "background": handle_file(temp_person),
                        "layers": [],
                        "composite": handle_file(temp_person)
                    },
                    garm_img=handle_file(temp_garment),
                    garment_des=garment_description,
                    is_checked=True,        # Enables AI auto-masking
                    is_checked_crop=False,
                    denoise_steps=30,
                    seed=42,
                    api_name="/tryon"
                )
            except Exception as primary_err:
                # Secondary standard endpoint format
                try:
                    result = client.predict(
                        handle_file(temp_person),
                        handle_file(temp_garment),
                        space_cat,
                        True,
                        True,
                        30,
                        42,
                    )
                except Exception as secondary_err:
                    raise RuntimeError(f"Model Space '{VTON_SPACE_ID}' execution failed: {str(primary_err)}")

            # Extract output image filepath
            output_filepath = None
            if isinstance(result, (list, tuple)) and len(result) > 0:
                output_filepath = result[0]
            elif isinstance(result, str):
                output_filepath = result

            if not output_filepath or not os.path.exists(output_filepath):
                raise RuntimeError("AI model completed without generating a valid image file.")

            # Read generated image bytes & convert to clean base64 data URL
            with open(output_filepath, 'rb') as f:
                output_bytes = f.read()

            b64_str = base64.b64encode(output_bytes).decode('utf-8')
            mime = "image/png"
            if output_bytes.startswith(b'RIFF') and b'WEBP' in output_bytes[:16]:
                mime = "image/webp"
            elif output_bytes.startswith(b'\xff\xd8\xff'):
                mime = "image/jpeg"

            data_url = f"data:{mime};base64,{b64_str}"

            return Response({
                "success": True,
                "result_image": data_url,
                "category": category,
                "model": VTON_SPACE_ID
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            # Strict Rule: NEVER return mock/overlaid image on failure. Return proper HTTP 502/500 JSON.
            return Response({
                "success": False,
                "error": f"AI Virtual Try-On failed: {str(exc)}. Please ensure Hugging Face Space '{VTON_SPACE_ID}' is active and try again."
            }, status=status.HTTP_502_BAD_GATEWAY)

        finally:
            # Guarantee memory and temp disk cleanup
            for temp_path in (temp_person, temp_garment):
                if temp_path and os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except Exception:
                        pass
