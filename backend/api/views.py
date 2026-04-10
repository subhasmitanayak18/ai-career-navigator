"""
API Views for the AI Career Navigator.

All views return JSON. Authentication is handled via JWT Bearer tokens
(see api/authentication.py). Each view is decorated with @api_view and
uses explicit permission classes.
"""

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
from .analyzer import analyzer_instance
from .utils import extract_text_from_pdf
from .roadmap_generator import generate_roadmap

User = get_user_model()

VALID_TIMELINES = ('1 Month', '3 Months', '6 Months')


# ==============================================================================
# AUTH VIEWS
# ==============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """
    Register a new user account.

    Request body: { username, email, password }
    Response: { access_token, token_type, username }
    """
    serializer = UserSerializer(data=request.data)
    if not serializer.is_valid():
        first_error = next(iter(serializer.errors.values()))
        msg = first_error[0] if isinstance(first_error, list) else str(first_error)
        return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    token = create_jwt_token(user)

    return Response(
        {
            'access_token': token,
            'token_type': 'Bearer',
            'username': user.username,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticate a user and return a JWT token.

    Request body: { username, password }
    Response: { access_token, token_type, username }
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'detail': 'Invalid request data.'}, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {'detail': 'Invalid username or password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {'detail': 'This account has been deactivated.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    token = create_jwt_token(user)

    return Response(
        {
            'access_token': token,
            'token_type': 'Bearer',
            'username': user.username,
        },
        status=status.HTTP_200_OK,
    )


# ==============================================================================
# DASHBOARD VIEW
# ==============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """
    Return the authenticated user's last 10 analyses (summary view).

    Response: [ { id, job_title, similarity_score, missing_count, created_at }, ... ]
    """
    analyses = Analysis.objects.filter(user=request.user).order_by('-created_at')[:10]
    serializer = PastAnalysisSerializer(analyses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ==============================================================================
# ANALYZE VIEW
# ==============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_view(request):
    """
    Perform a BERT-powered resume vs. job description analysis.

    Accepts:
      - job_title (optional)
      - job_description (required)
      - resume_text (text) OR resume_file (PDF upload)

    Response: full analysis result including matching/missing skills and similarity score.
    """
    job_title = request.data.get('job_title', '').strip()
    job_description = request.data.get('job_description', '').strip()

    # Determine resume text source
    resume_text = request.data.get('resume_text', '').strip()
    resume_file = request.FILES.get('resume_file')

    if resume_file:
        resume_text = extract_text_from_pdf(resume_file)
        if not resume_text:
            return Response(
                {'detail': 'Could not extract text from the uploaded PDF. Please try pasting your resume text instead.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    if not resume_text:
        return Response(
            {'detail': 'Please provide your resume text or upload a PDF file.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not job_description:
        return Response(
            {'detail': 'Job description is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Run BERT analysis
    if analyzer_instance is None:
        return Response(
            {'detail': 'Analyzer service is unavailable. Please try again shortly.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    result = analyzer_instance.analyze(resume_text, job_description)

    # Persist the analysis
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
# SKILL LEVEL VIEW
# ==============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def skill_level_view(request):
    """
    Save proficiency levels for missing skills of an analysis.

    Request body: { analysis_id, skill_levels: { "Python": "Beginner", ... } }
    Response: { message: "Skill levels saved." }
    """
    serializer = SkillLevelSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'detail': 'Invalid data.'}, status=status.HTTP_400_BAD_REQUEST)

    analysis_id = serializer.validated_data['analysis_id']
    skill_levels = serializer.validated_data['skill_levels']

    try:
        analysis = Analysis.objects.get(id=analysis_id, user=request.user)
    except Analysis.DoesNotExist:
        return Response({'detail': 'Analysis not found.'}, status=status.HTTP_404_NOT_FOUND)

    analysis.skill_levels = skill_levels
    analysis.save(update_fields=['skill_levels', 'updated_at'])

    return Response({'message': 'Skill levels saved successfully.'}, status=status.HTTP_200_OK)


# ==============================================================================
# TIMELINE VIEW
# ==============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def timeline_view(request):
    """
    Set the learning timeline for an analysis.

    Request body: { analysis_id, timeline: "1 Month" | "3 Months" | "6 Months" }
    Response: { message: "Timeline saved." }
    """
    serializer = TimelineSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'detail': 'Invalid data.'}, status=status.HTTP_400_BAD_REQUEST)

    analysis_id = serializer.validated_data['analysis_id']
    timeline = serializer.validated_data['timeline']

    if timeline not in VALID_TIMELINES:
        return Response(
            {'detail': f'Invalid timeline. Choose from: {", ".join(VALID_TIMELINES)}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        analysis = Analysis.objects.get(id=analysis_id, user=request.user)
    except Analysis.DoesNotExist:
        return Response({'detail': 'Analysis not found.'}, status=status.HTTP_404_NOT_FOUND)

    analysis.timeline = timeline
    analysis.save(update_fields=['timeline', 'updated_at'])

    return Response({'message': 'Timeline saved successfully.'}, status=status.HTTP_200_OK)


# ==============================================================================
# ROADMAP VIEW
# ==============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def roadmap_view(request):
    """
    Generate an AI-powered learning roadmap for an analysis.

    Requires skill_levels and timeline to already be set on the analysis.

    Request body: { analysis_id }
    Response: Full roadmap dict with phases, resources, and metrics.
    """
    serializer = RoadmapRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'detail': 'Invalid data.'}, status=status.HTTP_400_BAD_REQUEST)

    analysis_id = serializer.validated_data['analysis_id']

    try:
        analysis = Analysis.objects.get(id=analysis_id, user=request.user)
    except Analysis.DoesNotExist:
        return Response({'detail': 'Analysis not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not analysis.skill_levels:
        return Response(
            {'detail': 'Please rate all missing skills before generating a roadmap.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not analysis.timeline:
        return Response(
            {'detail': 'Please select a learning timeline before generating a roadmap.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    roadmap = generate_roadmap(
        missing_skills=analysis.missing_skills,
        skill_levels=analysis.skill_levels,
        timeline=analysis.timeline,
        job_title=analysis.job_title,
        similarity_score=analysis.similarity_score,
    )

    analysis.roadmap = roadmap
    analysis.save(update_fields=['roadmap', 'updated_at'])

    return Response(roadmap, status=status.HTTP_200_OK)


# ==============================================================================
# HEALTH CHECK
# ==============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Simple health check endpoint.

    Response: { status: "healthy", model: "BERT" }
    """
    model_status = 'loaded' if (analyzer_instance and analyzer_instance._available) else 'fallback (TF-IDF)'
    return Response(
        {
            'status': 'healthy',
            'model': 'BERT',
            'model_status': model_status,
        },
        status=status.HTTP_200_OK,
    )
