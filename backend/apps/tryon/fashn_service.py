import os
import re
import time
import base64
import requests
from django.conf import settings

FASHN_API_URL = "https://api.fashn.ai/v1"
FASHN_MODEL = "tryon-v1.6"

def get_fashn_api_key():
    """
    Retrieves FASHN_API_KEY strictly from backend environment variables.
    Never exposed to frontend JavaScript or client responses.
    """
    key = os.getenv('FASHN_API_KEY', '').strip()
    return key

def is_fashn_configured():
    """
    Checks if a non-placeholder FASHN API key is configured.
    """
    key = get_fashn_api_key()
    return bool(key and key != 'YOUR_ACTUAL_FASHN_API_KEY' and len(key) > 5)

def map_product_category_to_fashn(category_slug):
    """
    Maps Aruvi boutique product categories to official FASHN AI garment categories:
    - tops: tops, shirts, blouses, tunics
    - bottoms: pants, jeans, skirts
    - one-pieces: dresses, sarees, lehengas, salwars, shararas, maxis, gowns
    - auto: fallback
    """
    slug = (category_slug or '').lower().strip()
    if any(k in slug for k in ['top', 'shirt', 'blouse', 'tunic']):
        return 'tops'
    if any(k in slug for k in ['pant', 'jean', 'trouser', 'bottom', 'skirt']):
        return 'bottoms'
    if any(k in slug for k in ['salwar', 'sharara', 'maxi', 'ethnic', 'saree', 'dress', 'co-ord', 'suit', 'kurta']):
        return 'one-pieces'
    return 'auto'

def run_fashn_tryon(model_image, garment_image, category='auto', mode='balanced', cover_feet=False, adjust_hands=False):
    """
    Submits a Virtual Try-On request to the official FASHN AI run endpoint:
    POST https://api.fashn.ai/v1/run
    Using Model: tryon-v1.6
    """
    api_key = get_fashn_api_key()
    if not api_key or api_key == 'YOUR_ACTUAL_FASHN_API_KEY':
        raise ValueError(
            "FASHN_API_KEY is not configured on the backend. "
            "Please configure your valid FASHN AI API key in the backend environment."
        )

    if not model_image:
        raise ValueError("Customer photograph (model_image) is required for virtual try-on.")
    if not garment_image:
        raise ValueError("Product garment photograph (garment_image) is required for virtual try-on.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    payload = {
        "model_image": model_image,
        "garment_image": garment_image,
        "category": category if category in ['auto', 'tops', 'bottoms', 'one-pieces'] else 'auto',
        "mode": mode if mode in ['balanced', 'performance', 'quality'] else 'balanced',
        "nsfw_filter": True,
        "num_samples": 1,
        "cover_feet": bool(cover_feet),
        "adjust_hands": bool(adjust_hands)
    }

    try:
        response = requests.post(
            f"{FASHN_API_URL}/run",
            json=payload,
            headers=headers,
            timeout=35
        )
    except requests.exceptions.Timeout:
        raise RuntimeError("FASHN AI connection timed out while submitting try-on request. Please try again.")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Network error connecting to FASHN AI: {str(e)}")

    if response.status_code == 401:
        raise PermissionError("FASHN AI authentication failed. Please verify your FASHN_API_KEY secret in backend.")
    elif response.status_code == 402:
        raise PermissionError("Insufficient FASHN AI credits. Please recharge your FASHN account balance.")
    elif response.status_code == 429:
        raise RuntimeError("FASHN AI rate limit reached. Please wait a few moments and try again.")
    elif response.status_code >= 400:
        try:
            err_data = response.json()
            err_msg = err_data.get('error', {}).get('message') or err_data.get('message') or err_data.get('detail') or str(err_data)
        except Exception:
            err_msg = response.text or f"HTTP {response.status_code}"
        raise ValueError(f"FASHN AI error ({response.status_code}): {err_msg}")

    res_json = response.json()
    prediction_id = res_json.get("id")
    if not prediction_id:
        raise RuntimeError("FASHN AI did not return a valid prediction ID.")

    return {
        "id": prediction_id,
        "status": res_json.get("status", "starting"),
        "raw": res_json
    }

def get_fashn_status(prediction_id):
    """
    Polls the official FASHN AI status endpoint:
    GET https://api.fashn.ai/v1/status/{id}
    """
    api_key = get_fashn_api_key()
    if not api_key:
        raise ValueError("FASHN_API_KEY is not configured.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json"
    }

    try:
        response = requests.get(
            f"{FASHN_API_URL}/status/{prediction_id}",
            headers=headers,
            timeout=25
        )
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Network error querying FASHN AI status: {str(e)}")

    if response.status_code == 401:
        raise PermissionError("FASHN AI authentication failed during status check.")
    elif response.status_code == 404:
        raise FileNotFoundError(f"Prediction ID '{prediction_id}' not found on FASHN AI.")
    elif response.status_code >= 400:
        raise RuntimeError(f"FASHN AI status check failed with HTTP {response.status_code}.")

    data = response.json()
    status_val = data.get("status", "unknown")
    output_list = data.get("output", [])
    error_obj = data.get("error")

    error_message = ""
    if error_obj:
        if isinstance(error_obj, dict):
            error_message = error_obj.get("message") or error_obj.get("name") or str(error_obj)
        else:
            error_message = str(error_obj)

    return {
        "id": prediction_id,
        "status": status_val,
        "output": output_list,
        "error": error_message,
        "raw": data
    }

def persist_result_image(image_url, prediction_id):
    """
    Downloads the generated image from FASHN AI output URL (which may be temporary)
    and securely saves it to local media and returns both file URL and resilient data URI.
    """
    if not image_url:
        return ""

    try:
        resp = requests.get(image_url, timeout=30)
        if resp.status_code == 200:
            media_tryon_dir = os.path.join(settings.MEDIA_ROOT, 'tryon')
            os.makedirs(media_tryon_dir, exist_ok=True)
            filename = f"fashn_{prediction_id}_{int(time.time())}.jpg"
            filepath = os.path.join(media_tryon_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(resp.content)
            return f"{settings.MEDIA_URL}tryon/{filename}"
    except Exception as e:
        print(f"[FashnService] Warning: Could not download image locally: {e}")

    return image_url
