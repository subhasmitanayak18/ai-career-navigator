# 🧭 AI Career Navigator

> An AI-powered full-stack web app that analyzes your resume against a job description, identifies skill gaps, and generates a personalized week-by-week learning roadmap using BERT embeddings.

---

## 🏗 Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Backend  | Django 4+, Django REST Framework, PyJWT       |
| AI Model | sentence-transformers `all-MiniLM-L6-v2`      |
| Auth     | Custom JWT (Bearer token)                     |
| Frontend | React 18, React Router v6                     |
| Database | SQLite (dev) — swap to PostgreSQL for prod    |

---

## 📁 Project Structure

```
ai-career-navigator/
├── backend/
│   ├── .env                     # Secrets (never commit!)
│   ├── requirements.txt
│   ├── manage.py
│   ├── career_navigator/
│   │   ├── settings.py
│   │   └── urls.py
│   └── api/
│       ├── models.py            # User, Analysis
│       ├── views.py             # All API endpoints
│       ├── serializers.py       # DRF serializers
│       ├── authentication.py    # JWT auth
│       ├── analyzer.py          # BERT skill analyzer
│       ├── roadmap_generator.py # Roadmap engine
│       ├── utils.py             # PDF extractor, error handler
│       ├── urls.py              # API routes
│       └── admin.py             # Admin panel
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── api/client.js        # Axios-like fetch client
        ├── context/AppContext.js# Global state
        ├── components/
        │   ├── ProgressBar.jsx
        │   ├── ProtectedRoute.jsx
        │   └── RoadmapPhase.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── UploadPage.jsx
        │   ├── SkillGapPage.jsx
        │   ├── TimelinePage.jsx
        │   └── RoadmapPage.jsx
        ├── styles/global.css
        ├── App.jsx
        └── index.js
```

---

## 🚀 Setup & Running

### Backend (Terminal 1)

```powershell
# Navigate to backend
cd c:\OLIVIA\ai-career-navigator\backend

# Activate the virtual environment
.\venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt

# Create and apply database migrations
python manage.py makemigrations api
python manage.py migrate

# Create a superuser (for /admin panel)
python manage.py createsuperuser

# Start the Django development server
python manage.py runserver
# → API available at: http://localhost:8000
```

### Frontend (Terminal 2)

```powershell
# Navigate to frontend
cd c:\OLIVIA\ai-career-navigator\frontend

# Initialize Create React App (first time only)
npx create-react-app . --template cra-template
# OR if the folder already has package.json:
npm install

# Install React Router
npm install react-router-dom

# Start the development server
npm start
# → App available at: http://localhost:3000
```

---

## 🧪 Testing the App

### 1. Access the App
Open your browser and go to: **http://localhost:3000**

### 2. Sign Up
- Click **Sign Up** tab
- Enter a username, email, and password (6+ chars)
- You'll be redirected to your dashboard

### 3. Run a Full Analysis
1. **Dashboard** → Click **"Start New Analysis"**
2. **Upload** (Step 1): Paste your resume text or upload a PDF, then paste a job description → Click Analyze
3. **Skill Gap** (Step 2): Rate your proficiency for each missing skill (Beginner / Intermediate / Advanced)
4. **Timeline** (Step 3): Pick your learning timeline (1, 3, or 6 months)
5. **Roadmap** (Step 4): View your personalized week-by-week roadmap with tasks and resources

### 4. Admin Panel
Visit **http://localhost:8000/admin** and login with your superuser credentials to view all Users and Analyses.

---

## 🔑 API Endpoints

| Method | Endpoint              | Auth     | Description                        |
|--------|----------------------|----------|------------------------------------|
| POST   | `/api/auth/signup/`  | Public   | Register a new user                |
| POST   | `/api/auth/login/`   | Public   | Get JWT token                      |
| GET    | `/api/dashboard/`    | Required | List last 10 analyses              |
| POST   | `/api/analyze/`      | Required | Analyze resume vs job description  |
| POST   | `/api/skill-level/`  | Required | Save skill proficiency levels      |
| POST   | `/api/timeline/`     | Required | Save chosen learning timeline      |
| POST   | `/api/roadmap/`      | Required | Generate AI learning roadmap       |
| GET    | `/api/health/`       | Public   | Server + model health check        |

---

## 🛠 Common Troubleshooting

### ❌ CORS Errors (Browser blocks API calls)
**Symptom**: `Access-Control-Allow-Origin` error in the browser console.

**Fix**: Ensure `django-cors-headers` is installed and `CORS_ALLOWED_ORIGINS` in `settings.py` includes `http://localhost:3000`.

```bash
pip install django-cors-headers
```

Make sure `corsheaders.middleware.CorsMiddleware` is **before** `CommonMiddleware` in `MIDDLEWARE`.

---

### ❌ JWT Token Issues (`401 Unauthorized`)
**Symptom**: API calls return 401 after login.

**Fixes**:
- Check the token is stored in `localStorage` (DevTools → Application → Local Storage)
- Tokens expire after 1 hour; log out and log back in
- Ensure `JWT_SECRET_KEY` in `.env` matches what Django uses

---

### ⏳ BERT Model Loading Time (First Request is Slow)
**Symptom**: First `/api/analyze/` call takes 30–60 seconds.

**Why**: `sentence-transformers` downloads the `all-MiniLM-L6-v2` model (~90MB) on first use and caches it locally.

**What to expect**:
- First startup: model is downloaded (requires internet)
- Subsequent startups: model loads from cache (~5–10 seconds)
- The health endpoint `/api/health/` shows `"model_status": "loaded"` when ready

---

### ❌ PDF Upload Errors
**Symptom**: "Could not extract text from the uploaded PDF"

**Possible causes & fixes**:
- **Scanned PDF (image-based)**: Use paste-text mode instead. PyPDF2 cannot OCR images.
- **Password-protected PDF**: Remove protection before uploading.
- **Corrupted file**: Try a different PDF reader to verify the file opens correctly.
- **PyPDF2 not installed**: Run `pip install PyPDF2`

---

### ❌ `No module named 'sentence_transformers'`
```bash
pip install sentence-transformers
```
If you can't install torch/transformers (large packages), the app automatically falls back to **TF-IDF similarity** which works without them.

---

### ❌ `django.db.utils.OperationalError: no such table`
Run migrations:
```powershell
python manage.py makemigrations api
python manage.py migrate
```

---

## ⚙ Environment Variables (`.env`)

```env
SECRET_KEY=your-django-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

> ⚠️ **Never commit `.env` to version control**. Add it to `.gitignore`.

---

## 🔒 Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Change `SECRET_KEY` and `JWT_SECRET_KEY` to strong random values
- [ ] Switch `DATABASES` to PostgreSQL
- [ ] Configure `ALLOWED_HOSTS` with your actual domain
- [ ] Serve media files with Nginx/S3, not Django
- [ ] Add HTTPS (SSL certificate)
- [ ] Set `CORS_ALLOWED_ORIGINS` to your production frontend URL only
