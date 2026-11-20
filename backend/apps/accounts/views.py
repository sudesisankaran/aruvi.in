from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import AdminProfile
from .serializers import UserSerializer, AdminLoginSerializer
from .permissions import IsStrictAdminUser, AUTHORIZED_ADMIN_EMAIL

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        password = serializer.validated_data['password']

        # 1. Admin login route
        if email == AUTHORIZED_ADMIN_EMAIL:
            admin_user = User.objects.filter(email__iexact=email).first()
            if not admin_user:
                admin_user = User.objects.filter(username__iexact=email).first()

            if not admin_user or not admin_user.check_password(password):
                return Response(
                    {"error": "Invalid administrator password."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Ensure admin flags are set
            if not admin_user.is_staff or not admin_user.is_superuser:
                admin_user.is_staff = True
                admin_user.is_superuser = True
                admin_user.save()

            token, _ = Token.objects.get_or_create(user=admin_user)
            user_data = UserSerializer(admin_user).data
            user_data['is_admin'] = True

            return Response({
                "token": token.key,
                "user": user_data,
                "is_admin": True,
                "redirect_to": "/admin/dashboard",
                "message": "Admin authorization successful."
            }, status=status.HTTP_200_OK)

        # 2. Customer login route (any other email)
        customer_user = User.objects.filter(email__iexact=email).first()
        if not customer_user:
            customer_user = User.objects.filter(username__iexact=email).first()

        if customer_user:
            if not customer_user.check_password(password):
                return Response(
                    {"error": "Invalid password for customer account."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            # Auto-register new customer account
            username = email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            customer_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_staff=False,
                is_superuser=False
            )

        # Strictly enforce non-admin permissions for customer
        if customer_user.is_staff or customer_user.is_superuser:
            customer_user.is_staff = False
            customer_user.is_superuser = False
            customer_user.save()

        token, _ = Token.objects.get_or_create(user=customer_user)
        user_data = UserSerializer(customer_user).data
        user_data['is_admin'] = False

        return Response({
            "token": token.key,
            "user": user_data,
            "is_admin": False,
            "redirect_to": "/",
            "message": "Customer login successful."
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)

class VerifyAdminView(APIView):
    permission_classes = [IsStrictAdminUser]

    def get(self, request):
        return Response({
            "is_authorized": True,
            "email": request.user.email,
            "role": "super_admin"
        }, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        data['is_admin'] = (
            request.user.email.strip().lower() == AUTHORIZED_ADMIN_EMAIL and
            (request.user.is_staff or request.user.is_superuser)
        )
        return Response(data, status=status.HTTP_200_OK)
