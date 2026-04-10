"""
BERT-based Resume Analyzer for the AI Career Navigator.

Uses sentence-transformers (all-MiniLM-L6-v2) to compute semantic embeddings
for resume and job description texts, then performs:
  - Skill extraction via keyword matching against a curated taxonomy
  - Cosine similarity scoring between resume and job description
  - Gap analysis (matched vs. missing skills)

A global singleton (analyzer_instance) is created at module load time
so the model is only loaded once per process.
"""

import re
import numpy as np
from typing import Dict, List, Tuple


# ==============================================================================
# SKILLS TAXONOMY
# ==============================================================================

SKILLS_TAXONOMY: Dict[str, List[str]] = {
    'programming_languages': [
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c',
        'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala',
        'r', 'matlab', 'perl', 'bash', 'shell', 'powershell', 'lua', 'dart',
        'haskell', 'elixir', 'clojure', 'groovy', 'julia',
    ],
    'web_frontend': [
        'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxtjs', 'gatsby',
        'html', 'css', 'sass', 'scss', 'less', 'tailwind', 'bootstrap',
        'material-ui', 'chakra-ui', 'styled-components', 'webpack', 'vite',
        'redux', 'zustand', 'mobx', 'graphql', 'apollo', 'axios', 'jquery',
        'web components', 'storybook', 'figma', 'jest', 'cypress', 'playwright',
    ],
    'web_backend': [
        'django', 'flask', 'fastapi', 'express', 'nestjs', 'spring', 'spring boot',
        'rails', 'laravel', 'node', 'nodejs', 'aspnet', 'asp.net', 'phoenix',
        'gin', 'fiber', 'actix', 'rest', 'restful', 'graphql', 'grpc',
        'microservices', 'celery', 'rabbitmq', 'kafka', 'nginx', 'apache',
        'gunicorn', 'uvicorn', 'websockets',
    ],
    'databases': [
        'postgresql', 'mysql', 'sqlite', 'mongodb', 'redis', 'elasticsearch',
        'cassandra', 'dynamodb', 'firestore', 'supabase', 'neo4j', 'influxdb',
        'mariadb', 'oracle', 'mssql', 'sql server', 'bigquery', 'snowflake',
        'clickhouse', 'couchdb', 'realm', 'prisma', 'sqlalchemy', 'sequelize',
        'typeorm', 'hibernate', 'liquibase', 'flyway',
    ],
    'cloud_devops': [
        'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s',
        'terraform', 'ansible', 'jenkins', 'github actions', 'gitlab ci',
        'circleci', 'travisci', 'helm', 'istio', 'prometheus', 'grafana',
        'datadog', 'cloudwatch', 'ecs', 'eks', 'lambda', 'serverless',
        'cloudformation', 'pulumi', 'vagrant', 'packer', 'argocd', 'flux',
        'nginx', 'load balancer', 'cdn', 'cloudflare', 'vercel', 'netlify',
        'heroku', 'digitalocean', 'linode',
    ],
    'data_ml': [
        'machine learning', 'deep learning', 'neural networks', 'nlp',
        'natural language processing', 'computer vision', 'tensorflow', 'pytorch',
        'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy', 'scipy',
        'matplotlib', 'seaborn', 'plotly', 'hugging face', 'transformers',
        'bert', 'gpt', 'llm', 'langchain', 'llamaindex', 'openai', 'anthropic',
        'stable diffusion', 'xgboost', 'lightgbm', 'catboost', 'random forest',
        'svm', 'regression', 'classification', 'clustering', 'feature engineering',
        'data preprocessing', 'etl', 'data pipeline', 'airflow', 'dbt',
        'spark', 'hadoop', 'hive', 'databricks', 'mlflow', 'kubeflow',
        'mlops', 'model deployment', 'a/b testing', 'statistics',
    ],
    'tools_practices': [
        'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
        'agile', 'scrum', 'kanban', 'tdd', 'bdd', 'ci/cd', 'devops',
        'microservices', 'api design', 'swagger', 'openapi', 'postman',
        'linux', 'unix', 'macos', 'windows', 'vim', 'vscode', 'intellij',
        'debugging', 'profiling', 'code review', 'pair programming',
        'documentation', 'technical writing', 'system design', 'architecture',
        'design patterns', 'solid principles', 'clean code', 'refactoring',
        'unit testing', 'integration testing', 'e2e testing', 'performance testing',
        'security', 'oauth', 'jwt', 'ssl', 'https', 'encryption',
        'accessibility', 'wcag', 'seo', 'web performance', 'pwa',
    ],
}

# Flat list of all skills for fast lookup
ALL_SKILLS: List[str] = [
    skill for skills in SKILLS_TAXONOMY.values() for skill in skills
]


# ==============================================================================
# BERT ANALYZER CLASS
# ==============================================================================

class BERTAnalyzer:
    """
    Resume vs. Job Description analyzer using sentence-transformers.

    Uses the 'sentence-transformers/all-MiniLM-L6-v2' model to encode texts
    into 384-dimensional normalized embeddings, then computes cosine similarity.

    Skills are extracted via case-insensitive keyword matching against SKILLS_TAXONOMY.
    """

    MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'

    def __init__(self):
        """
        Load the tokenizer and model from HuggingFace.
        The model weights are cached locally after the first download.
        """
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.MODEL_NAME)
            self._available = True
        except ImportError:
            # Fallback: sentence-transformers not installed; use TF-IDF similarity
            self.model = None
            self._available = False

    def get_embedding(self, text: str) -> np.ndarray:
        """
        Convert text into a 384-dimensional normalized sentence embedding.

        Args:
            text: Input text (resume or job description).

        Returns:
            A numpy array of shape (384,) representing the normalized embedding.
        """
        if not self._available or not text.strip():
            # Return a zero vector as fallback
            return np.zeros(384)

        embedding = self.model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
        return embedding

    def extract_skills_from_text(self, text: str) -> List[str]:
        """
        Extract skills from text using keyword matching against SKILLS_TAXONOMY.

        The matching is case-insensitive and uses word-boundary checks to avoid
        partial matches (e.g., 'C' in 'CI/CD' won't match 'c' language).

        Args:
            text: Resume or job description text.

        Returns:
            A sorted list of unique matched skill names (lowercase).
        """
        text_lower = text.lower()
        found_skills = set()

        for skill in ALL_SKILLS:
            # Use word boundary for single-character skills; substring for longer ones
            if len(skill) <= 2:
                # Exact word match for short skills like 'r', 'c', 'go'
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.add(skill)
            else:
                if skill in text_lower:
                    found_skills.add(skill)

        return sorted(found_skills)

    def compute_similarity(self, text1: str, text2: str) -> float:
        """
        Compute the cosine similarity between two texts' embeddings.

        Since embeddings are L2-normalized, cosine similarity equals dot product.

        Args:
            text1: First text (e.g., resume).
            text2: Second text (e.g., job description).

        Returns:
            A float in [0.0, 1.0] representing semantic similarity.
        """
        if not self._available:
            return self._tfidf_similarity(text1, text2)

        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)

        # Dot product of unit vectors = cosine similarity
        similarity = float(np.dot(emb1, emb2))

        # Clamp to [0, 1] in case of floating-point drift
        return max(0.0, min(1.0, similarity))

    def _tfidf_similarity(self, text1: str, text2: str) -> float:
        """
        Fallback TF-IDF cosine similarity when sentence-transformers is unavailable.

        Args:
            text1, text2: Texts to compare.

        Returns:
            Float similarity in [0.0, 1.0].
        """
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity as sk_cosine

            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([text1, text2])
            score = sk_cosine(tfidf_matrix[0], tfidf_matrix[1])[0][0]
            return float(max(0.0, min(1.0, score)))
        except Exception:
            return 0.0

    def analyze(self, resume_text: str, job_description: str) -> Dict:
        """
        Perform a full resume vs. job description analysis.

        Steps:
          1. Extract skills from resume and job description.
          2. Compute matching (intersection) and missing (difference) skills.
          3. Compute semantic similarity score.

        Args:
            resume_text: Text extracted from the candidate's resume.
            job_description: Full job description text.

        Returns:
            A dict with keys:
              - matching_skills (list): Skills in both resume and JD.
              - missing_skills (list): Skills in JD but not in resume.
              - similarity_score (str): Rounded float as string (e.g., "0.82").
              - matched_count (int): Number of matching skills.
              - missing_count (int): Number of missing skills.
        """
        resume_skills = set(self.extract_skills_from_text(resume_text))
        jd_skills = set(self.extract_skills_from_text(job_description))

        matching = sorted(resume_skills & jd_skills)
        missing = sorted(jd_skills - resume_skills)

        similarity = self.compute_similarity(resume_text, job_description)

        return {
            'matching_skills': matching,
            'missing_skills': missing,
            'similarity_score': f'{similarity:.2f}',
            'matched_count': len(matching),
            'missing_count': len(missing),
        }


# ==============================================================================
# GLOBAL SINGLETON
# ==============================================================================

# Initialized once at import time; reused across all requests in the process.
# This avoids reloading the ~90MB model on every API call.
try:
    analyzer_instance = BERTAnalyzer()
except Exception:
    analyzer_instance = None
