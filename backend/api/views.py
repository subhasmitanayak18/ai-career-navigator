from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
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
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        token = create_jwt_token(user)

        return Response({
            "user": serializer.data,
            "token": token
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)

        if user:
            token = create_jwt_token(user)

            return Response({
                "token": token,
                "user": UserSerializer(user).data
            })

        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    analyses = Analysis.objects.filter(user=request.user).order_by('-created_at')
    serializer = PastAnalysisSerializer(analyses, many=True)
    return Response(serializer.data)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def skill_level_view(request):
    serializer = SkillLevelSerializer(data=request.data)
    
    if serializer.is_valid():
        return Response(
            {
                'message': 'Skill levels assessed successfully',
                'skills': serializer.validated_data.get('skills', {})
            },
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def timeline_view(request):
    serializer = TimelineSerializer(data=request.data)
    
    if serializer.is_valid():
        timeline = serializer.validated_data.get('timeline')
        
        if timeline not in VALID_TIMELINES:
            return Response(
                {'detail': f'Invalid timeline. Choose from: {", ".join(VALID_TIMELINES)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {
                'message': f'Timeline set to {timeline}',
                'timeline': timeline
            },
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def roadmap_view(request):
    serializer = RoadmapRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        analysis_id = serializer.validated_data.get('analysis_id')
        timeline = serializer.validated_data.get('timeline')
        
        try:
            analysis = Analysis.objects.get(id=analysis_id, user=request.user)
        except Analysis.DoesNotExist:
            return Response(
                {'detail': 'Analysis not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        roadmap = generate_roadmap(
            missing_skills=analysis.missing_skills,
            timeline=timeline
        )
        
        return Response(
            {
                'roadmap': roadmap,
                'timeline': timeline,
                'analysis_id': analysis_id
            },
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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