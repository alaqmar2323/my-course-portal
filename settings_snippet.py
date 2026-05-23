"""
Add / merge these into your Django settings.py
"""
from datetime import timedelta

INSTALLED_APPS = [
    # ... default apps ...
    "rest_framework",
    "corsheaders",
    "courses",          # your app
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",   # must be first
    # ... rest of middleware ...
]

# Use custom User model
AUTH_USER_MODEL = "courses.User"

# CORS — allow React dev server
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

# JWT Authentication
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":  timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}
