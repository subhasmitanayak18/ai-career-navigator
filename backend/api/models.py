"""
Models for the AI Career Navigator API.

Defines:
  - User: Custom user model extending AbstractUser
  - Analysis: Resume analysis result linked to a user
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model that extends Django's AbstractUser.
    Uses email as a unique identifier alongside username.
    """
    email = models.EmailField(unique=True, help_text="User's unique email address")
    created_at = models.DateTimeField(auto_now_add=True, help_text="Timestamp when the user was created")

    class Meta:
        db_table = 'api_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} <{self.email}>"


class Analysis(models.Model):
    """
    Stores the result of a resume-vs-job-description analysis for a user.
    Contains matched/missing skills, similarity scores, and AI-generated roadmaps.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='analyses',
        help_text="The user who performed this analysis"
    )

    job_title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Optional job title extracted or provided for this analysis"
    )

    resume_text = models.TextField(
        help_text="Full text content extracted from the uploaded resume"
    )

    job_description = models.TextField(
        help_text="Full job description text to compare against the resume"
    )

    matching_skills = models.JSONField(
        default=list,
        help_text="List of skills found in both resume and job description"
    )

    missing_skills = models.JSONField(
        default=list,
        help_text="List of skills required by the job but absent in the resume"
    )

    skill_levels = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        help_text="Dictionary mapping skills to proficiency levels (e.g., {'Python': 'advanced'})"
    )

    timeline = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Estimated learning timeline (e.g., '3 months', '6 months')"
    )

    roadmap = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        help_text="AI-generated learning roadmap with phases, resources, and milestones"
    )

    similarity_score = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        help_text="Cosine similarity score between resume and job description (e.g., '0.82')"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when this analysis was created"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when this analysis was last updated"
    )

    class Meta:
        db_table = 'api_analysis'
        verbose_name = 'Analysis'
        verbose_name_plural = 'Analyses'
        ordering = ['-created_at']

    def __str__(self):
        title = self.job_title or "Untitled"
        return f"Analysis [{title}] by {self.user.username} ({self.created_at.date()})"

    @property
    def matched_count(self):
        """Number of skills that matched between resume and job description."""
        return len(self.matching_skills) if self.matching_skills else 0

    @property
    def missing_count(self):
        """Number of skills required by the job but missing from the resume."""
        return len(self.missing_skills) if self.missing_skills else 0
