from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Analysis

User = get_user_model()


class AuthContractTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='password123',
        )

    def test_login_invalid_credentials_returns_detail(self):
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'alice', 'password': 'wrong-password'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {'detail': 'Invalid credentials'})


class SkillLevelContractTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='bob',
            email='bob@example.com',
            password='password123',
        )
        self.analysis = Analysis.objects.create(
            user=self.user,
            resume_text='resume text',
            job_description='job description',
            matching_skills=['Python'],
            missing_skills=[],
            similarity_score='0.95',
        )
        self.client.force_authenticate(user=self.user)

    def test_empty_skill_levels_payload_is_accepted(self):
        response = self.client.post(
            '/api/skill-level/',
            {'analysis_id': self.analysis.id, 'skill_levels': {}},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.analysis.refresh_from_db()
        self.assertEqual(self.analysis.skill_levels, {})
