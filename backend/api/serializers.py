"""
DRF Serializers for the AI Career Navigator API.

Serializers:
  - UserSerializer: Registration/profile serializer
  - LoginSerializer: Login credential validation
  - AnalysisSerializer: Full analysis with computed fields
  - PastAnalysisSerializer: Lightweight list view of analyses
  - SkillLevelSerializer: Update skill levels for an analysis
  - TimelineSerializer: Update learning timeline for an analysis
  - RoadmapRequestSerializer: Request roadmap generation for an analysis
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Analysis

User = get_user_model()


# ==============================================================================
# USER SERIALIZERS
# ==============================================================================

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration and profile display.
    Password is write-only and enforces a minimum length of 6 characters.
    """
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        style={'input_type': 'password'},
        help_text='Password must be at least 6 characters long.',
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'email': {'required': True},
        }

    def create(self, validated_data):
        """
        Override create to use create_user() so the password is properly hashed.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for validating login credentials.
    Both fields are required; password is write-only.
    """
    username = serializers.CharField(
        max_length=150,
        help_text='The user\'s unique username.',
    )
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='The user\'s password.',
    )


# ==============================================================================
# ANALYSIS SERIALIZERS
# ==============================================================================

class AnalysisSerializer(serializers.ModelSerializer):
    """
    Full serializer for an Analysis object.
    Includes computed 'matched_count' and 'missing_count' via SerializerMethodFields.
    """
    matched_count = serializers.SerializerMethodField(
        help_text='Number of skills found in both resume and job description.'
    )
    missing_count = serializers.SerializerMethodField(
        help_text='Number of skills required but absent from the resume.'
    )

    class Meta:
        model = Analysis
        fields = [
            'id',
            'user',
            'job_title',
            'resume_text',
            'job_description',
            'matching_skills',
            'missing_skills',
            'skill_levels',
            'timeline',
            'roadmap',
            'similarity_score',
            'matched_count',
            'missing_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'matched_count', 'missing_count']

    def get_matched_count(self, obj) -> int:
        """Return the number of matched skills."""
        return len(obj.matching_skills) if obj.matching_skills else 0

    def get_missing_count(self, obj) -> int:
        """Return the number of missing skills."""
        return len(obj.missing_skills) if obj.missing_skills else 0


class PastAnalysisSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing past analyses.
    Returns only the fields needed for a summary/history view.
    """
    missing_count = serializers.SerializerMethodField(
        help_text='Number of skills required but absent from the resume.'
    )

    class Meta:
        model = Analysis
        fields = ['id', 'job_title', 'similarity_score', 'missing_count', 'created_at']
        read_only_fields = fields

    def get_missing_count(self, obj) -> int:
        """Return the number of missing skills."""
        return len(obj.missing_skills) if obj.missing_skills else 0


# ==============================================================================
# ACTION SERIALIZERS
# ==============================================================================

class SkillLevelSerializer(serializers.Serializer):
    """
    Serializer for updating skill proficiency levels for a given analysis.

    Expected request body:
      {
        "analysis_id": 42,
        "skill_levels": {"Python": "advanced", "Docker": "beginner"}
      }
    """
    analysis_id = serializers.IntegerField(
        help_text='Primary key of the Analysis to update.'
    )
    skill_levels = serializers.JSONField(
        help_text='Dictionary mapping skill names to proficiency levels.'
    )


class TimelineSerializer(serializers.Serializer):
    """
    Serializer for setting the estimated learning timeline for an analysis.

    Expected request body:
      {
        "analysis_id": 42,
        "timeline": "3 months"
      }
    """
    analysis_id = serializers.IntegerField(
        help_text='Primary key of the Analysis to update.'
    )
    timeline = serializers.CharField(
        max_length=20,
        help_text='Estimated learning timeline (e.g., "3 months", "6 months").'
    )


class RoadmapRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting AI-generated roadmap generation for an analysis.

    Expected request body:
      {
        "analysis_id": 42
      }
    """
    analysis_id = serializers.IntegerField(
        help_text='Primary key of the Analysis for which to generate a roadmap.'
    )
    timeline = serializers.CharField(
        max_length=20,
        required=False,
        help_text='Optional timeline override if one has not already been saved.',
    )
