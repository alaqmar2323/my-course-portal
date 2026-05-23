"""
views.py  —  Course Registration Portal
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Course, Registration
from .serializers import (
    UserSerializer, RegisterSerializer,
    CourseSerializer, RegistrationSerializer, RegistrationStatusSerializer,
)


# ─── Permissions ──────────────────────────────────────────────────────────────

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


# ─── Auth ─────────────────────────────────────────────────────────────────────

class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ─── Courses ──────────────────────────────────────────────────────────────────

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all().order_by("-created_at")
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [IsAdminRole()]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [IsAdminRole()]


# ─── Registrations ────────────────────────────────────────────────────────────

class RegistrationListCreateView(generics.ListCreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            qs = Registration.objects.select_related("user", "course").all()
            course_id = self.request.query_params.get("course")
            if course_id:
                qs = qs.filter(course_id=course_id)
            return qs
        return Registration.objects.filter(user=user).select_related("course")


class RegistrationStatusView(generics.UpdateAPIView):
    """Admin endpoint to accept/reject a registration."""
    queryset = Registration.objects.all()
    serializer_class = RegistrationStatusSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ["patch"]


class MyRegistrationsView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user).select_related("course")


# ─── urls.py ──────────────────────────────────────────────────────────────────
"""
Add to your project's urls.py:

from django.urls import path, include
urlpatterns = [
    path("api/", include("courses.urls")),
]
"""
# courses/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth
    path("auth/login/",   LoginView.as_view(),   name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/me/",      MeView.as_view(),      name="me"),

    # Courses  (admin: POST/PUT/PATCH/DELETE  |  users: GET)
    path("courses/",      CourseListCreateView.as_view(), name="courses"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course_detail"),

    # Registrations
    path("registrations/",           RegistrationListCreateView.as_view(), name="registrations"),
    path("registrations/<int:pk>/status/", RegistrationStatusView.as_view(), name="reg_status"),
    path("registrations/mine/",      MyRegistrationsView.as_view(), name="my_registrations"),
]
