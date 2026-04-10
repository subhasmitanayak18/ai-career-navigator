"""
Root URL configuration for career_navigator project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root(request):
    """Friendly landing page at / so users don't see a blank 404."""
    return JsonResponse({
        "message": "🧭 AI Career Navigator API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health":    "/api/health/",
            "signup":    "/api/auth/signup/",
            "login":     "/api/auth/login/",
            "dashboard": "/api/dashboard/",
            "analyze":   "/api/analyze/",
            "roadmap":   "/api/roadmap/",
            "admin":     "/admin/",
        },
        "frontend": "http://localhost:3000",
        "note": "Open http://localhost:3000 in your browser to use the app.",
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Serve uploaded media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
