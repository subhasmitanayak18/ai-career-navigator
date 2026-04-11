"""
Lightweight Resume Analyzer for the AI Career Navigator.

This version avoids heavy ML libraries (sentence-transformers, sklearn, scipy)
to ensure compatibility with low-memory environments like Render free tier.

It performs:
  - Skill extraction via keyword matching
  - Simple similarity using Jaccard similarity (word overlap)
"""

import re
from typing import Dict, List


# ==============================================================================
# SKILLS TAXONOMY
# ==============================================================================

SKILLS_TAXONOMY: Dict[str, List[str]] = {
    'programming_languages': [
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c',
        'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin'
    ],
    'web_frontend': [
        'react', 'vue', 'angular', 'html', 'css', 'tailwind',
        'bootstrap', 'redux', 'vite'
    ],
    'web_backend': [
        'django', 'flask', 'fastapi', 'express', 'node', 'nodejs',
        'spring', 'rest', 'graphql'
    ],
    'databases': [
        'postgresql', 'mysql', 'sqlite', 'mongodb', 'redis'
    ],
    'cloud_devops': [
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'nginx'
    ],
    'data_ml': [
        'machine learning', 'nlp', 'pandas', 'numpy'
    ],
    'tools_practices': [
        'git', 'github', 'linux', 'api', 'debugging'
    ],
}

ALL_SKILLS: List[str] = [
    skill for skills in SKILLS_TAXONOMY.values() for skill in skills
]


# ==============================================================================
# ANALYZER CLASS
# ==============================================================================

class SimpleAnalyzer:

    def extract_skills_from_text(self, text: str) -> List[str]:
        text_lower = text.lower()
        found_skills = set()

        for skill in ALL_SKILLS:
            if len(skill) <= 2:
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.add(skill)
            else:
                if skill in text_lower:
                    found_skills.add(skill)

        return sorted(found_skills)

    def _simple_similarity(self, text1: str, text2: str) -> float:
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())

        if not words1 or not words2:
            return 0.0

        intersection = words1 & words2
        union = words1 | words2

        return len(intersection) / len(union)

    def analyze(self, resume_text: str, job_description: str) -> Dict:
        resume_skills = set(self.extract_skills_from_text(resume_text))
        jd_skills = set(self.extract_skills_from_text(job_description))

        matching = sorted(resume_skills & jd_skills)
        missing = sorted(jd_skills - resume_skills)

        similarity = self._simple_similarity(resume_text, job_description)

        return {
            'matching_skills': matching,
            'missing_skills': missing,
            'similarity_score': f'{similarity:.2f}',
            'matched_count': len(matching),
            'missing_count': len(missing),
        }


# ==============================================================================
# LAZY LOADING (IMPORTANT)
# ==============================================================================

analyzer_instance = None

def get_analyzer():
    global analyzer_instance
    if analyzer_instance is None:
        analyzer_instance = SimpleAnalyzer()
    return analyzer_instance