import React, { useState } from 'react';
import { PlayCircle, Clock, BarChart } from 'lucide-react';

const mockCourses = [
  {
    id: 101,
    title: "Elements of AI",
    category: "AI",
    duration: "20h 00m",
    level: "Beginner",
    img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 102,
    title: "HarvardX CS50: Intro to Computer Science",
    category: "Programming",
    duration: "120h 00m",
    level: "Beginner",
    img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 103,
    title: "AI for Everyone (DeepLearning.AI)",
    category: "AI",
    duration: "6h 00m",
    level: "Beginner",
    img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 104,
    title: "Practical Deep Learning for Coders",
    category: "AI",
    duration: "70h 00m",
    level: "Intermediate",
    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 105,
    title: "Hugging Face Course",
    category: "NLP",
    duration: "35h 00m",
    level: "Intermediate",
    img: "https://images.unsplash.com/photo-1593349480506-8433634cdcbe?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 106,
    title: "Prompt Engineering for ChatGPT",
    category: "AI Tools",
    duration: "18h 00m",
    level: "Beginner",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 107,
    title: "Introduction to Generative AI",
    category: "AI Tools",
    duration: "8h 00m",
    level: "Beginner",
    img: "https://images.unsplash.com/photo-1673891465225-862d85b191b2?auto=format&fit=crop&w=400&q=80"
  }
];

const CoursesPage = () => {
  const [filter, setFilter] = useState('All');
  
  const categories = ['All', ...new Set(mockCourses.map(c => c.category))];
  
  const filteredCourses = filter === 'All' 
    ? mockCourses 
    : mockCourses.filter(c => c.category === filter);

  return (
    <div className="section-container">
      <h1 className="page-title">Available Courses</h1>
      
      <div className="filter-bar">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid-cards">
        {filteredCourses.map(course => (
          <div key={course.id} className="card glass-panel course-card">
            <div className="course-thumb">
              <img src={course.img} alt={course.title} />
              <div className="course-level">{course.level}</div>
            </div>
            
            <div className="course-body">
              <span className="course-cat">{course.category}</span>
              <h3 className="course-title">{course.title}</h3>
              
              <div className="course-meta">
                <span className="meta-item"><Clock size={16} /> {course.duration}</span>
                <span className="meta-item"><BarChart size={16} /> {course.level}</span>
              </div>
              
              <button className="btn btn-outline btn-full course-btn">
                <PlayCircle size={18} /> Start Learning
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        .filter-bar { display: flex; gap: 12px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 8px; }
        .filter-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 20px; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .filter-btn:hover { background: rgba(99, 102, 241, 0.1); color: var(--primary-500); }
        .filter-btn.active { background: var(--primary-500); color: #fff; border-color: var(--primary-500); }
        
        .course-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
        .course-thumb { height: 160px; position: relative; }
        .course-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .course-level { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
        
        .course-body { padding: 20px; display: flex; flex-direction: column; flex: 1; gap: 12px; }
        .course-cat { font-size: 0.8rem; color: var(--primary-500); font-weight: 600; text-transform: uppercase; }
        .course-title { font-size: 1.1rem; color: var(--text-primary); margin: 0; line-height: 1.4; }
        .course-meta { display: flex; gap: 16px; color: var(--text-muted); font-size: 0.85rem; margin-top: auto; }
        .meta-item { display: flex; align-items: center; gap: 6px; }
        .course-btn { margin-top: 8px; }
      `}</style>
    </div>
  );
};

export default CoursesPage;
