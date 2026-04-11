from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Analysis
from .serializers import (
    UserSerializer,
    LoginSerializer,
    AnalysisSerializer,
    PastAnalysisSerializer,
    SkillLevelSerializer,
    TimelineSerializer,
    RoadmapRequestSerializer,
)
from .authentication import create_jwt_token
from .analyzer import get_analyzer   # ✅ FIXED
from .utils import extract_text_from_pdf
from .roadmap_generator import generate_roadmap

User = get_user_model()

VALID_TIMELINES = ('1 Month', '3 Months', '6 Months')


# ==============================================================================
# ANALYZE VIEW (FIXED)
# ==============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_view(request):

    job_title = request.data.get('job_title', '').strip()
    job_description = request.data.get('job_description', '').strip()

    resume_text = request.data.get('resume_text', '').strip()
    resume_file = request.FILES.get('resume_file')

    if resume_file:
        resume_text = extract_text_from_pdf(resume_file)
        if not resume_text:
            return Response(
                {'detail': 'Could not extract text from the uploaded PDF.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    if not resume_text:
        return Response(
            {'detail': 'Please provide resume text or upload PDF.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not job_description:
        return Response(
            {'detail': 'Job description is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ✅ LAZY LOADING FIX (THIS IS THE MAIN FIX)
    analyzer = get_analyzer()
    result = analyzer.analyze(resume_text, job_description)

    analysis = Analysis.objects.create(
        user=request.user,
        job_title=job_title or None,
        resume_text=resume_text,
        job_description=job_description,
        matching_skills=result['matching_skills'],
        missing_skills=result['missing_skills'],
        similarity_score=result['similarity_score'],
    )

    return Response(
        {
            'analysis_id': analysis.id,
            'job_title': analysis.job_title,
            'matching_skills': result['matching_skills'],
            'missing_skills': result['missing_skills'],
            'similarity_score': result['similarity_score'],
            'matched_count': result['matched_count'],
            'missing_count': result['missing_count'],
        },
        status=status.HTTP_201_CREATED,
    )


# ==============================================================================
# HEALTH CHECK (FIXED)
# ==============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):

    return Response(
        {
            'status': 'healthy',
            'model': 'Lightweight Analyzer',
            'model_status': 'running',
        },
        status=status.HTTP_200_OK,
    )