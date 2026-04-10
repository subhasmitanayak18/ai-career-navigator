"""
AI Roadmap Generator for the AI Career Navigator.

Generates personalized, week-by-week learning roadmaps based on:
  - Missing skills identified from resume analysis
  - Self-assessed skill levels (Beginner / Intermediate / Advanced)
  - Chosen learning timeline (1 / 3 / 6 months)

Key exports:
  - RESOURCE_DB: curated learning resources per skill
  - generate_roadmap(): produces a structured roadmap dict
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


# ==============================================================================
# DATA STRUCTURES
# ==============================================================================

@dataclass
class CourseResource:
    title: str
    platform: str
    url: str
    duration: str
    type: str  # "Video" | "Article" | "Practice"


# ==============================================================================
# RESOURCE DATABASE
# ==============================================================================

RESOURCE_DB: Dict[str, List[CourseResource]] = {
    'python': [
        CourseResource('Python for Everybody', 'Coursera', 'https://www.coursera.org/specializations/python', '4 weeks', 'Video'),
        CourseResource('Automate the Boring Stuff with Python', 'automatetheboringstuff.com', 'https://automatetheboringstuff.com', '3 weeks', 'Article'),
        CourseResource('Python Practice Problems', 'LeetCode', 'https://leetcode.com/problemset/?topicSlugs=python', 'Ongoing', 'Practice'),
        CourseResource('Real Python Tutorials', 'realpython.com', 'https://realpython.com', '2 weeks', 'Article'),
    ],
    'javascript': [
        CourseResource('The Modern JavaScript Tutorial', 'javascript.info', 'https://javascript.info', '5 weeks', 'Article'),
        CourseResource('JavaScript Algorithms and Data Structures', 'freeCodeCamp', 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', '4 weeks', 'Practice'),
        CourseResource('JavaScript: Understanding the Weird Parts', 'Udemy', 'https://www.udemy.com/course/understand-javascript/', '4 weeks', 'Video'),
        CourseResource('Eloquent JavaScript', 'eloquentjavascript.net', 'https://eloquentjavascript.net', '3 weeks', 'Article'),
    ],
    'react': [
        CourseResource('React Official Documentation', 'react.dev', 'https://react.dev/learn', '2 weeks', 'Article'),
        CourseResource('Epic React by Kent C. Dodds', 'epicreact.dev', 'https://epicreact.dev', '6 weeks', 'Video'),
        CourseResource('Build 25+ React Projects', 'Udemy', 'https://www.udemy.com/course/react-tutorial-and-projects-course/', '5 weeks', 'Practice'),
        CourseResource('React Hooks Deep Dive', 'YouTube', 'https://www.youtube.com/watch?v=O6P86uwfdR0', '1 week', 'Video'),
    ],
    'typescript': [
        CourseResource('TypeScript Handbook', 'typescriptlang.org', 'https://www.typescriptlang.org/docs/handbook/', '2 weeks', 'Article'),
        CourseResource('Understanding TypeScript - Udemy', 'Udemy', 'https://www.udemy.com/course/understanding-typescript/', '4 weeks', 'Video'),
        CourseResource('TypeScript Exercises', 'typescript-exercises.github.io', 'https://typescript-exercises.github.io', '2 weeks', 'Practice'),
    ],
    'docker': [
        CourseResource('Docker Getting Started', 'Docker Docs', 'https://docs.docker.com/get-started/', '1 week', 'Article'),
        CourseResource('Docker & Kubernetes: The Practical Guide', 'Udemy', 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', '5 weeks', 'Video'),
        CourseResource('Play with Docker Labs', 'Play with Docker', 'https://labs.play-with-docker.com', 'Ongoing', 'Practice'),
        CourseResource('Docker Curriculum', 'docker-curriculum.com', 'https://docker-curriculum.com', '1 week', 'Article'),
    ],
    'kubernetes': [
        CourseResource('Kubernetes Documentation', 'kubernetes.io', 'https://kubernetes.io/docs/tutorials/', '2 weeks', 'Article'),
        CourseResource('Kubernetes for the Absolute Beginners', 'Udemy', 'https://www.udemy.com/course/learn-kubernetes/', '4 weeks', 'Video'),
        CourseResource('Katacoda Kubernetes Scenarios', 'Katacoda', 'https://www.katacoda.com/courses/kubernetes', '3 weeks', 'Practice'),
        CourseResource('Kubernetes the Hard Way', 'GitHub', 'https://github.com/kelseyhightower/kubernetes-the-hard-way', '4 weeks', 'Practice'),
    ],
    'aws': [
        CourseResource('AWS Cloud Practitioner Essentials', 'AWS Training', 'https://aws.amazon.com/training/learn-about/cloud-practitioner/', '1 week', 'Video'),
        CourseResource('AWS Solutions Architect - Associate', 'A Cloud Guru', 'https://acloudguru.com/course/aws-certified-solutions-architect-associate', '6 weeks', 'Video'),
        CourseResource('AWS Free Tier Practice Labs', 'AWS', 'https://aws.amazon.com/free/', 'Ongoing', 'Practice'),
        CourseResource('AWS Documentation', 'AWS Docs', 'https://docs.aws.amazon.com', 'Ongoing', 'Article'),
    ],
    'sql': [
        CourseResource('SQLZoo Interactive Tutorial', 'SQLZoo', 'https://sqlzoo.net', '2 weeks', 'Practice'),
        CourseResource('Mode Analytics SQL Tutorial', 'Mode', 'https://mode.com/sql-tutorial/', '2 weeks', 'Article'),
        CourseResource('The Complete SQL Bootcamp', 'Udemy', 'https://www.udemy.com/course/the-complete-sql-bootcamp/', '3 weeks', 'Video'),
        CourseResource('LeetCode SQL Problems', 'LeetCode', 'https://leetcode.com/problemset/database/', 'Ongoing', 'Practice'),
    ],
    'machine learning': [
        CourseResource('Machine Learning by Andrew Ng', 'Coursera', 'https://www.coursera.org/specializations/machine-learning-introduction', '9 weeks', 'Video'),
        CourseResource('Hands-On Machine Learning (Book)', "O'Reilly", 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/', '8 weeks', 'Article'),
        CourseResource('Fast.ai Practical DL for Coders', 'fast.ai', 'https://www.fast.ai', '6 weeks', 'Video'),
        CourseResource('Kaggle Learn ML', 'Kaggle', 'https://www.kaggle.com/learn/intro-to-machine-learning', '1 week', 'Practice'),
    ],
    'django': [
        CourseResource('Django Official Tutorial', 'djangoproject.com', 'https://docs.djangoproject.com/en/stable/intro/tutorial01/', '1 week', 'Article'),
        CourseResource('Django for Beginners (Book)', 'wsvincent.com', 'https://djangoforbeginners.com', '3 weeks', 'Article'),
        CourseResource('Django REST Framework Tutorial', 'django-rest-framework.org', 'https://www.django-rest-framework.org/tutorial/quickstart/', '1 week', 'Article'),
        CourseResource('Build a Django REST API', 'YouTube', 'https://www.youtube.com/watch?v=i5JykvxUk_A', '2 weeks', 'Video'),
    ],
    'postgresql': [
        CourseResource('PostgreSQL Tutorial', 'postgresqltutorial.com', 'https://www.postgresqltutorial.com', '2 weeks', 'Article'),
        CourseResource('Learn PostgreSQL - Full Course', 'freeCodeCamp YouTube', 'https://www.youtube.com/watch?v=qw--VYLpxG4', '1 week', 'Video'),
        CourseResource('Postgres Exercises', 'pgexercises.com', 'https://pgexercises.com', 'Ongoing', 'Practice'),
    ],
    'git': [
        CourseResource('Pro Git Book (Free)', 'git-scm.com', 'https://git-scm.com/book/en/v2', '1 week', 'Article'),
        CourseResource('Learn Git Branching', 'learngitbranching.js.org', 'https://learngitbranching.js.org', '1 week', 'Practice'),
        CourseResource('Git & GitHub Crash Course', 'YouTube', 'https://www.youtube.com/watch?v=RGOj5yH7evk', '3 hours', 'Video'),
    ],
    'tensorflow': [
        CourseResource('TensorFlow Developer Certificate', 'Coursera', 'https://www.coursera.org/professional-certificates/tensorflow-in-practice', '8 weeks', 'Video'),
        CourseResource('TensorFlow Guide', 'tensorflow.org', 'https://www.tensorflow.org/guide', '2 weeks', 'Article'),
        CourseResource('TensorFlow Playground', 'playground.tensorflow.org', 'https://playground.tensorflow.org', 'Ongoing', 'Practice'),
    ],
    'pytorch': [
        CourseResource('PyTorch Official Tutorials', 'pytorch.org', 'https://pytorch.org/tutorials/', '3 weeks', 'Article'),
        CourseResource('Deep Learning with PyTorch: Zero to GANs', 'Jovian', 'https://jovian.ai/learn/deep-learning-with-pytorch-zero-to-gans', '6 weeks', 'Video'),
        CourseResource('Fast.ai PyTorch Course', 'fast.ai', 'https://course.fast.ai', '6 weeks', 'Video'),
    ],
    'scikit-learn': [
        CourseResource('Scikit-Learn User Guide', 'scikit-learn.org', 'https://scikit-learn.org/stable/user_guide.html', '2 weeks', 'Article'),
        CourseResource('ML with Scikit-Learn - Kaggle', 'Kaggle', 'https://www.kaggle.com/learn/intro-to-machine-learning', '1 week', 'Practice'),
        CourseResource('Scikit-learn Crash Course', 'YouTube', 'https://www.youtube.com/watch?v=0B5eIE_1vpU', '3 hours', 'Video'),
    ],
    'nodejs': [
        CourseResource('Node.js Official Guide', 'nodejs.dev', 'https://nodejs.dev/en/learn/', '2 weeks', 'Article'),
        CourseResource('Node.js, Express, MongoDB Bootcamp', 'Udemy', 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/', '6 weeks', 'Video'),
        CourseResource('NodeSchool', 'nodeschool.io', 'https://nodeschool.io', 'Ongoing', 'Practice'),
    ],
}

# ==============================================================================
# CONFIGURATION CONSTANTS
# ==============================================================================

TIMELINE_TO_WEEKS: Dict[str, int] = {
    '1 Month': 4,
    '3 Months': 12,
    '6 Months': 24,
}

WEEKS_PER_SKILL: Dict[str, int] = {
    'Beginner': 3,
    'Intermediate': 2,
    'Advanced': 1,
}

TASKS_BY_LEVEL: Dict[str, List[str]] = {
    'Beginner': [
        'Complete the introductory tutorial for this skill',
        'Read the official documentation overview',
        'Follow a beginner project walkthrough',
        'Practice with at least 5 small exercises',
        'Build a minimal working example from scratch',
        'Join a community forum or Discord for this topic',
    ],
    'Intermediate': [
        'Study advanced patterns and best practices',
        'Build a medium-complexity project integrating this skill',
        'Review and refactor existing code using new knowledge',
        'Explore edge cases and performance considerations',
        'Write unit tests for your implementation',
    ],
    'Advanced': [
        'Deep-dive into production-level usage',
        'Contribute to or study an open-source project using this skill',
        'Benchmark and optimize your implementation',
        'Prepare a technical demo or write a blog post',
    ],
}

LEVEL_ORDER = {'Beginner': 0, 'Intermediate': 1, 'Advanced': 2}


# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def prioritize_skills(
    missing_skills: List[str],
    skill_levels: Dict[str, str],
) -> List[str]:
    """
    Sort missing skills so Beginners come first (most weeks needed),
    then Intermediate, then Advanced.

    Skills not present in skill_levels default to 'Intermediate'.

    Args:
        missing_skills: Skills absent from the resume.
        skill_levels: Dict mapping skill → level string.

    Returns:
        Sorted list of skill names.
    """
    def sort_key(skill: str) -> int:
        level = skill_levels.get(skill, 'Intermediate')
        return LEVEL_ORDER.get(level, 1)

    return sorted(missing_skills, key=sort_key)


def get_resources_for_skill(skill: str) -> List[CourseResource]:
    """
    Return up to 3 curated CourseResource objects for a given skill.

    Falls back to a generic search result if the skill has no entry in RESOURCE_DB.

    Args:
        skill: Skill name (case-insensitive).

    Returns:
        List of up to 3 CourseResource objects.
    """
    key = skill.lower()
    resources = RESOURCE_DB.get(key, [])

    if not resources:
        # Generic fallback resources for unlisted skills
        resources = [
            CourseResource(
                title=f'Search "{skill}" on YouTube',
                platform='YouTube',
                url=f'https://www.youtube.com/results?search_query={skill.replace(" ", "+")}+tutorial',
                duration='Variable',
                type='Video',
            ),
            CourseResource(
                title=f'Official Documentation for {skill}',
                platform='Official Docs',
                url=f'https://www.google.com/search?q={skill.replace(" ", "+")}+official+documentation',
                duration='Variable',
                type='Article',
            ),
            CourseResource(
                title=f'Practice {skill} on Exercism',
                platform='Exercism',
                url='https://exercism.org',
                duration='Ongoing',
                type='Practice',
            ),
        ]

    return resources[:3]


def _resource_to_dict(r: CourseResource) -> Dict:
    return {
        'title': r.title,
        'platform': r.platform,
        'url': r.url,
        'duration': r.duration,
        'type': r.type,
    }


# ==============================================================================
# MAIN GENERATOR
# ==============================================================================

def generate_roadmap(
    missing_skills: List[str],
    skill_levels: Dict[str, str],
    timeline: str,
    job_title: Optional[str] = None,
    similarity_score: Optional[str] = None,
) -> Dict:
    """
    Generate a personalized, week-by-week learning roadmap.

    Algorithm:
      1. Map timeline string to total available weeks.
      2. Prioritize skills (Beginner → Intermediate → Advanced).
      3. Allocate weeks per skill based on WEEKS_PER_SKILL.
      4. Build a phase for each skill, assigning week numbers.
      5. Compute coverage and confidence metrics.

    Args:
        missing_skills: Skills absent from the candidate's resume.
        skill_levels: Dict mapping skill name → level string.
        timeline: One of '1 Month', '3 Months', '6 Months'.
        job_title: Optional job title for display purposes.
        similarity_score: Optional resume similarity score (e.g. "0.72").

    Returns:
        A dict with:
          - job_title, timeline, phases, priority_skills
          - skill_coverage (float %): # skills covered / total
          - confidence_score (float %): based on similarity + coverage
    """
    total_weeks = TIMELINE_TO_WEEKS.get(timeline, 12)
    ordered_skills = prioritize_skills(missing_skills, skill_levels)

    phases = []
    current_week = 1
    skills_covered = 0

    for skill in ordered_skills:
        if current_week > total_weeks:
            break  # No more time left in the timeline

        level = skill_levels.get(skill, 'Intermediate')
        weeks_needed = WEEKS_PER_SKILL.get(level, 2)

        # Don't overflow past the last week
        weeks_allocated = min(weeks_needed, total_weeks - current_week + 1)

        # Determine phase label based on which third of the timeline we're in
        progress_ratio = current_week / total_weeks
        if progress_ratio < 0.34:
            phase_label = 'Foundation'
        elif progress_ratio < 0.67:
            phase_label = 'Building'
        else:
            phase_label = 'Specialization'

        resources = [_resource_to_dict(r) for r in get_resources_for_skill(skill)]
        tasks = TASKS_BY_LEVEL.get(level, TASKS_BY_LEVEL['Intermediate'])

        phases.append({
            'week_start': current_week,
            'week_end': current_week + weeks_allocated - 1,
            'skill': skill,
            'level': level,
            'phase': phase_label,
            'tasks': tasks,
            'resources': resources,
        })

        current_week += weeks_allocated
        skills_covered += 1

    # Metrics
    total_skills = len(missing_skills)
    skill_coverage = round((skills_covered / total_skills * 100), 1) if total_skills else 0.0

    sim = 0.0
    try:
        sim = float(similarity_score) if similarity_score else 0.0
    except (ValueError, TypeError):
        sim = 0.0

    # Confidence: weighted blend of similarity and coverage
    confidence_score = round(min(100.0, (sim * 60) + (skill_coverage * 0.4)), 1)

    priority_skills = ordered_skills[:5]  # Top 5 most important skills

    return {
        'job_title': job_title or 'Target Role',
        'timeline': timeline,
        'total_weeks': total_weeks,
        'skill_coverage': skill_coverage,
        'confidence_score': confidence_score,
        'priority_skills': priority_skills,
        'phases': phases,
    }
