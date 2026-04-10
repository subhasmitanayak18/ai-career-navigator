"""
URL routing for the AI Career Navigator API.
All endpoints are prefixed with /api/ in career_navigator/urls.py.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/signup/', views.signup_view, name='signup'),
    path('auth/login/',  views.login_view,  name='login'),

    # Dashboard
    path('dashboard/', views.dashboard_view, name='dashboard'),

    # Analysis flow
    path('analyze/',     views.analyze_view,     name='analyze'),
    path('skill-level/', views.skill_level_view, name='skill-level'),
    path('timeline/',    views.timeline_view,     name='timeline'),
    path('roadmap/',     views.roadmap_view,      name='roadmap'),

    # Utilities
    path('health/', views.health_check, name='health'),
]
