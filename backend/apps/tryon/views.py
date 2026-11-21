import os
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from apps.products.models import Product
from apps.accounts.permissions import IsStrictAdminUser
from .models import TryOnSession
from .serializers import (
    TryOnGenerateSerializer,
    TryOnSessionSerializer,
    TryOnSaveSerializer
)
from .fashn_service import (
    run_fashn_tryon,
    get_fashn_status,
    map_product_category_to_fashn,
    is_fashn_configured,
    persist_result_image,
    FASHN_MODEL
)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class GenerateTryOnView(APIView):
    """
    POST /api/virtual-tryon/generate/
    Initiates real AI virtual try-on using official FASHN AI API (Model: tryon-v1.6).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TryOnGenerateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        product_id = data['product_id']
        model_image = data['model_image']
        chosen_category = data.get('category', 'auto')
        mode = data.get('mode', 'balanced')
        cover_feet = data.get('cover_feet', False)
        adjust_hands = data.get('adjust_hands', False)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Resolve genuine garment image from product
        garment_image = product.image
        if not garment_image or 'kanjivaram_green.jpg' in garment_image:
            primary_img = product.images.filter(is_primary=True).first() or product.images.first()
            if primary_img:
                garment_image = primary_img.image_url or primary_img.storage_path

        if not garment_image:
            return Response(
                {"error": f"No high-resolution product image found for '{product.title}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Normalize garment image URL if relative
        if garment_image.startswith('/media/') or garment_image.startswith('media/'):
            clean_media = garment_image if garment_image.startswith('/') else f'/{garment_image}'
            garment_image = request.build_absolute_uri(clean_media)
            if request.is_secure() or request.META.get('HTTP_X_FORWARDED_PROTO') == 'https' or 'onrender.com' in garment_image:
                garment_image = garment_image.replace('http://', 'https://')

        # 3. Auto-detect category from product if set to auto
        final_category = chosen_category
        if final_category == 'auto' and product.category:
            final_category = map_product_category_to_fashn(product.category.slug)

        # 4. Submit to FASHN AI run endpoint
        try:
            run_result = run_fashn_tryon(
                model_image=model_image,
                garment_image=garment_image,
                category=final_category,
                mode=mode,
                cover_feet=cover_feet,
                adjust_hands=adjust_hands
            )
        except (ValueError, PermissionError, RuntimeError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"Internal error initiating FASHN AI try-on: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        prediction_id = run_result['id']
        pred_status = run_result.get('status', 'starting')

        # 5. Persist Session in Database
        user = request.user if request.user and request.user.is_authenticated else None
        session = TryOnSession.objects.create(
            user=user,
            product=product,
            prediction_id=prediction_id,
            status=pred_status,
            category=final_category,
            mode=mode,
            model_image_url=model_image if not model_image.startswith('data:') else f"[Data-URI {len(model_image)} bytes]",
            garment_image_url=garment_image,
            consent_given=True,
            ip_address=get_client_ip(request)
        )

        return Response({
            "message": "FASHN AI Virtual Try-On job queued successfully.",
            "prediction_id": prediction_id,
            "status": pred_status,
            "session_id": session.id,
            "product": {
                "id": product.id,
                "title": product.title,
                "price": str(product.price),
                "image": garment_image
            }
        }, status=status.HTTP_201_CREATED)

class TryOnStatusView(APIView):
    """
    GET /api/virtual-tryon/status/<prediction_id>/
    Polls status of FASHN AI prediction and returns generated output when ready.
    """
    permission_classes = [AllowAny]

    def get(self, request, prediction_id):
        if not prediction_id:
            return Response({"error": "Prediction ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            status_data = get_fashn_status(prediction_id)
        except FileNotFoundError:
            return Response({"error": "Prediction ID not found on FASHN AI."}, status=status.HTTP_404_NOT_FOUND)
        except (PermissionError, ValueError, RuntimeError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"Failed to check FASHN status: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        pred_status = status_data.get('status', 'unknown')
        output = status_data.get('output', [])
        err_msg = status_data.get('error', '')

        # Sync local DB record if exists
        session = TryOnSession.objects.filter(prediction_id=prediction_id).first()
        if session:
            session.status = pred_status
            if pred_status == 'completed' and output:
                session.result_image_url = output[0]
            elif pred_status == 'failed' and err_msg:
                session.error_message = err_msg
            session.save(update_fields=['status', 'result_image_url', 'error_message', 'updated_at'])

        return Response({
            "prediction_id": prediction_id,
            "status": pred_status,
            "output": output,
            "error": err_msg,
            "is_completed": pred_status == 'completed',
            "is_failed": pred_status == 'failed'
        }, status=status.HTTP_200_OK)

class SaveTryOnView(APIView):
    """
    POST /api/virtual-tryon/save/
    Permanently saves a generated try-on result for the customer.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TryOnSaveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prediction_id = serializer.validated_data['prediction_id']
        session = TryOnSession.objects.filter(prediction_id=prediction_id).first()
        if not session:
            return Response({"error": "Try-on session not found."}, status=status.HTTP_404_NOT_FOUND)

        if not session.result_image_url:
            return Response({"error": "Try-on result has not completed yet."}, status=status.HTTP_400_BAD_REQUEST)

        # Download and store permanently to prevent temporary link expiration
        if not session.permanent_result_url:
            permanent_url = persist_result_image(session.result_image_url, session.prediction_id)
            session.permanent_result_url = permanent_url

        session.is_saved = True
        if request.user and request.user.is_authenticated and not session.user:
            session.user = request.user

        session.save()

        return Response({
            "message": "Virtual try-on look saved permanently.",
            "session": TryOnSessionSerializer(session).data
        }, status=status.HTTP_200_OK)

class DeleteTryOnView(APIView):
    """
    DELETE /api/virtual-tryon/<id>/
    Deletes a saved try-on look.
    """
    permission_classes = [AllowAny]

    def delete(self, request, pk=None, prediction_id=None):
        target_id = pk or prediction_id
        session = None
        if str(target_id).isdigit():
            session = TryOnSession.objects.filter(id=int(target_id)).first()
        if not session:
            session = TryOnSession.objects.filter(prediction_id=str(target_id)).first()

        if not session:
            return Response({"error": "Try-on look not found."}, status=status.HTTP_404_NOT_FOUND)

        session.delete()
        return Response({"message": "Try-on look removed successfully."}, status=status.HTTP_200_OK)

class TryOnHistoryView(APIView):
    """
    GET /api/virtual-tryon/history/
    Returns saved looks for the customer.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user if request.user and request.user.is_authenticated else None
        if user:
            sessions = TryOnSession.objects.filter(user=user, is_saved=True)
        else:
            ip = get_client_ip(request)
            sessions = TryOnSession.objects.filter(ip_address=ip, is_saved=True)[:10]

        serializer = TryOnSessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminTryOnStatsView(APIView):
    """
    GET /api/virtual-tryon/admin-stats/
    Provides live FASHN AI Virtual Try-On metrics for the Admin Dashboard.
    Strictly restricted to authorized admin (aruvicollections.25@gmail.com).
    """
    permission_classes = [IsStrictAdminUser]

    def get(self, request):
        total_requests = TryOnSession.objects.count()
        successful = TryOnSession.objects.filter(status='completed').count()
        failed = TryOnSession.objects.filter(status='failed').count()
        in_progress = TryOnSession.objects.filter(status__in=['starting', 'in_progress']).count()

        recent = TryOnSession.objects.all().select_related('product')[:20]
        recent_serialized = TryOnSessionSerializer(recent, many=True).data

        api_configured = is_fashn_configured()

        return Response({
            "provider": "FASHN AI",
            "model": FASHN_MODEL,
            "api_configured": api_configured,
            "status": "Online & Ready" if api_configured else "API Key Required",
            "total_requests": total_requests,
            "successful": successful,
            "failed": failed,
            "in_progress": in_progress,
            "recent_sessions": recent_serialized
        }, status=status.HTTP_200_OK)
