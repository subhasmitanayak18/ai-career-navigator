"""
Django admin configuration for the AI Career Navigator API.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Analysis


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin panel configuration for the custom User model."""
    list_display = ('username', 'email', 'is_staff', 'is_active', 'created_at')
    list_filter = ('is_staff', 'is_active', 'created_at')
    search_fields = ('username', 'email')
    ordering = ('-created_at',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Career Navigator', {'fields': ('created_at',)}),
    )
    readonly_fields = ('created_at',)


@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    """Admin panel configuration for the Analysis model."""
    list_display = ('user', 'job_title', 'similarity_score', 'timeline', 'created_at')
    list_filter = ('created_at', 'timeline')
    search_fields = ('user__username', 'job_title')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

    fieldsets = (
        ('Overview', {
            'fields': ('user', 'job_title', 'similarity_score', 'timeline'),
        }),
        ('Analysis Content', {
            'fields': ('resume_text', 'job_description'),
            'classes': ('collapse',),
        }),
        ('Skills', {
            'fields': ('matching_skills', 'missing_skills', 'skill_levels'),
        }),
        ('Roadmap', {
            'fields': ('roadmap',),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
