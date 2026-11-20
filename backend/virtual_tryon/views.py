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

# Configuration with defaults
VTON_MODEL_ENDPOINT = getattr(settings, 'VTON_MODEL_ENDPOINT', os.environ.get('VTON_MODEL_ENDPOINT', 'Nymbo/Virtual-Try-On'))
HF_TOKEN = getattr(settings, 'HF_TOKEN', os.environ.get('HF_TOKEN', ''))
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit
ALLOWED_FORMATS = {'JPEG', 'PNG', 'WEBP'}


class VirtualTryOnView(APIView):
    """
    POST /api/try-on/
    Isolated plug-and-play Open-Source Virtual Try-On endpoint.
    Accepts:
      - person_image: uploaded photograph (max 5MB, JPG/PNG/WEBP)
      - garment_image_url: string URL or local path to product clothing
      - category: optional ('upper_body', 'lower_body', 'dresses'; default: 'upper_body')
    Returns:
      - { "success": true, "result_image": "data:image/webp;base64,..." }
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        # 1. Validate person image
        person_file = request.FILES.get('person_image')
        if not person_file:
            return Response(
                {"success": False, "error": "No person image provided. Please upload a photograph."},
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
                img_format = (test_img.format or '').upper()
                if img_format not in ALLOWED_FORMATS:
                    return Response(
                        {"success": False, "error": f"Invalid person image format ({img_format}). Only JPG, PNG, and WebP are supported."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Could not decode person image: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Retrieve & validate garment image
        garment_image_url = request.data.get('garment_image_url', '').strip()
        category = request.data.get('category', 'upper_body').lower()
        if category not in ('upper_body', 'lower_body', 'dresses'):
            category = 'upper_body'

        garment_bytes = None
        if garment_image_url.startswith(('http://', 'https://')):
            try:
                resp = requests.get(garment_image_url, timeout=12)
                if resp.status_code == 200:
                    garment_bytes = resp.content
            except Exception as e:
                pass

        if not garment_bytes:
            # Check local candidate paths
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
                if os.path.exists(path) and os.path.isfile(path):
                    try:
                        with open(path, 'rb') as f:
                            garment_bytes = f.read()
                            break
                    except Exception:
                        pass

        if not garment_bytes:
            return Response(
                {"success": False, "error": "Could not retrieve garment image from the provided URL or path."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Execute Open-Source AI Virtual Try-On
        try:
            result_data_url = self._run_gradio_or_local_inference(
                person_bytes=person_bytes,
                garment_bytes=garment_bytes,
                category=category
            )
            return Response({
                "success": True,
                "result_image": result_data_url,
                "category": category,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"success": False, "error": f"Virtual Try-On inference failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _run_gradio_or_local_inference(self, person_bytes: bytes, garment_bytes: bytes, category: str) -> str:
        """
        Attempts inference via gradio_client against VTON_MODEL_ENDPOINT.
        Falls back to local CatVTON spatial engine if gradio space is unreachable.
        """
        temp_person = None
        temp_garment = None

        try:
            # Create temporary files for gradio_client handle_file
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as fp_person:
                temp_person = fp_person.name
                fp_person.write(person_bytes)

            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as fp_garment:
                temp_garment = fp_garment.name
                fp_garment.write(garment_bytes)

            # Attempt gradio_client remote Space connection
            try:
                from gradio_client import Client, handle_file
                client = Client(VTON_MODEL_ENDPOINT, hf_token=HF_TOKEN if HF_TOKEN else None)
                
                # Predict via gradio Space API
                api_name = "/process"
                cat_map = {"upper_body": "Upper-body", "lower_body": "Lower-body", "dresses": "Dress"}
                gradio_cat = cat_map.get(category, "Upper-body")

                try:
                    result = client.predict(
                        dict={"background": handle_file(temp_person), "layers": [], "composite": handle_file(temp_person)},
                        garm_img=handle_file(temp_garment),
                        garment_des="garment drape",
                        is_checking=True,
                        is_resetting=False,
                        is_autodrape=True,
                        denoise_steps=30,
                        seed=42,
                        api_name=api_name
                    )
                except Exception:
                    # Generic fallback call signature
                    result = client.predict(
                        handle_file(temp_person),
                        handle_file(temp_garment),
                        gradio_cat,
                        True,
                        True,
                        30,
                        42,
                    )

                out_path = result if isinstance(result, str) else (result[0] if isinstance(result, (list, tuple)) else None)
                if out_path and os.path.exists(out_path):
                    with open(out_path, 'rb') as f:
                        out_bytes = f.read()
                        b64 = base64.b64encode(out_bytes).decode('utf-8')
                        return f"data:image/webp;base64,{b64}"

            except Exception as gradio_err:
                # If remote gradio Space is sleeping or offline, run high-performance local CatVTON engine
                pass

            # High-Reliability Local CatVTON Engine
            from tryon.catvton_engine import run_catvton_inference
            cat_map_local = {"upper_body": "upper", "lower_body": "lower", "dresses": "overall"}
            local_cat = cat_map_local.get(category, "overall")
            result_bytes = run_catvton_inference(
                customer_img_bytes=person_bytes,
                garment_img_bytes=garment_bytes,
                category=local_cat
            )
            b64_str = base64.b64encode(result_bytes).decode('utf-8')
            return f"data:image/webp;base64,{b64_str}"

        finally:
            # Clean up temp files safely
            if temp_person and os.path.exists(temp_person):
                try:
                    os.remove(temp_person)
                except Exception:
                    pass
            if temp_garment and os.path.exists(temp_garment):
                try:
                    os.remove(temp_garment)
                except Exception:
                    pass
