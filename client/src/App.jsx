import React, { useState, useEffect, useRef } from 'react';
import AdminComponent from './admin';

export default function App() {
  const [view, setView] = useState('home');

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Teacher Login States
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherLoginError, setTeacherLoginError] = useState('');
  const [teacherData, setTeacherData] = useState(null);

  const [mediaStage, setMediaStage] = useState('puzzle');
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  const [isNewsDropdownOpen, setIsNewsDropdownOpen] = useState(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // ---> [ADDED HERE: Download Modal State] <---
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [documentsList, setDocumentsList] = useState([]);

  // ---> [ADDED HERE: Document View State] <---
  const [selectedDocumentForView, setSelectedDocumentForView] = useState(null);

  // ---> [ADDED HERE: Department Detail View State] <---
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [currentAlbumPage, setCurrentAlbumPage] = useState(0);
  const [flipDirection, setFlipDirection] = useState(null);

  // Dynamic States initialized for Database Sync
  const [stats, setStats] = useState({ students: '', staff: '', experience: '' });
  const [principalInfo, setPrincipalInfo] = useState({ name: '', designation: '', photo: '', message: '' });
  const [aboutUsText, setAboutUsText] = useState('');
  const [missionText, setMissionText] = useState('');
  const [visionText, setVisionText] = useState('');
  const [departmentsList, setDepartmentsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [contactInfo, setContactInfo] = useState({ address: '', phone: '', email: '' });
  const [invitationsList, setInvitationsList] = useState([]);
  const [newsGalleryList, setNewsGalleryList] = useState([]);
  const [photoAlbumList, setPhotoAlbumList] = useState([]);
  const [achieversList, setAchieversList] = useState([]);
  const [siteConfig, setSiteConfig] = useState({ logo: '', bgVideo: '' });

  // Fetch all stored data from MongoDB backend API
  useEffect(() => {
    const API_URL = import.meta.env.MODE === 'development' 
      ? 'http://localhost:5000' 
      : 'https://gac-udt.onrender.com';

    fetch(`${API_URL}/api/data`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.invitations) setInvitationsList(data.invitations);
          if (data.news) setNewsGalleryList(data.news.map(item => item.text || item));
          if (data.photos) setPhotoAlbumList(data.photos);
          if (data.departments) setDepartmentsList(data.departments);
          if (data.services) setServicesList(data.services);
          if (data.achievers) setAchieversList(data.achievers);
          // Documents fetching support (if available in backend data or default empty array)
          if (data.resources) {
            setDocumentsList(data.resources);
          } else {
            // Mock sample documents for testing descending order if backend doesn't have it yet
            setDocumentsList([
              { _id: '1', title: 'Academic Calendar 2026', date: '2026-09-15', fileUrl: '#' },
              { _id: '2', title: 'Semester Exam Guidelines', date: '2026-09-28', fileUrl: '#' },
              { _id: '3', title: 'Sports Meet Circular', date: '2026-08-10', fileUrl: '#' }
            ]);
          }
          if (data.config) {
            if (data.config.stats) setStats(data.config.stats);
            if (data.config.aboutUsText) setAboutUsText(data.config.aboutUsText);
            if (data.config.missionText) setMissionText(data.config.missionText);
            if (data.config.visionText) setVisionText(data.config.visionText);
            if (data.config.contactInfo) setContactInfo(data.config.contactInfo);
            if (data.config.principalInfo) setPrincipalInfo(data.config.principalInfo);
            if (data.config.siteConfig) setSiteConfig(data.config.siteConfig);
          }
        }
      })
      .catch(err => console.error("Error fetching data from MongoDB backend:", err));
  }, []);

  useEffect(() => {
    if (view === 'home') {
      setMediaStage('puzzle');
      const timer = setTimeout(() => {
        setMediaStage('video');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [view]);

  useEffect(() => {
    if (view === 'home') {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer) return;

      let animationFrameId;
      let scrollSpeed = 1.2;

      const scroll = () => {
        if (!isPaused && scrollContainer) {
          scrollContainer.scrollLeft += scrollSpeed;
          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
            scrollContainer.scrollLeft = 0;
          }
        }
        animationFrameId = requestAnimationFrame(scroll);
      };

      animationFrameId = requestAnimationFrame(scroll);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [isPaused, view]);

  // Database Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.MODE === 'development' 
        ? 'http://localhost:5000' 
        : 'https://gac-udt.onrender.com';

      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setLoginError('');
        setLoginUsername('');
        setLoginPassword('');
        setView('admin');
      } else {
        setLoginError(data.message || 'Invalid Username or Password!');
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setLoginError('Server error during login. Please try again.');
    }
  };

  // Database Teacher Login Handler
  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.MODE === 'development' 
        ? 'http://localhost:5000' 
        : 'https://gac-udt.onrender.com';

      const response = await fetch(`${API_URL}/api/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: teacherUsername, password: teacherPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTeacherLoginError('');
        setTeacherUsername('');
        setTeacherPassword('');
        setTeacherData(data.teacher);
        setView('teacher-dashboard');
      } else {
        setTeacherLoginError(data.message || 'Invalid Teacher Credentials!');
      }
    } catch (err) {
      console.error("Teacher login error:", err);
      setTeacherLoginError('Server error during teacher login. Please try again.');
    }
  };

  const photosPerPage = 4;
  const totalAlbumPages = Math.ceil(photoAlbumList.length / photosPerPage) || 1;
  const currentPhotosSlice = photoAlbumList.slice(
    currentAlbumPage * photosPerPage,
    (currentAlbumPage + 1) * photosPerPage
  );

  const handleNextPage = () => {
    if (currentAlbumPage < totalAlbumPages - 1) {
      setFlipDirection('next');
      setTimeout(() => {
        setCurrentAlbumPage(prev => prev + 1);
        setFlipDirection(null);
      }, 300);
    }
  };

  const handlePrevPage = () => {
    if (currentAlbumPage > 0) {
      setFlipDirection('prev');
      setTimeout(() => {
        setCurrentAlbumPage(prev => prev - 1);
        setFlipDirection(null);
      }, 300);
    }
  };

  // Sorting documents in descending date order (Newest first)
  const sortedDocuments = [...documentsList].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

  return (
    <div style={{ backgroundColor: '#F7EBE8', color: '#551A38', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      <style>{`
        @keyframes puzzleSlide1 { 0% { transform: translate(-150px, -150px) rotate(-20deg); opacity: 0; } 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; } }
        @keyframes puzzleSlide2 { 0% { transform: translate(0, -180px) rotate(15deg); opacity: 0; } 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; } }
        @keyframes puzzleSlide3 { 0% { transform: translate(150px, -150px) rotate(-15deg); opacity: 0; } 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; } }
        @keyframes puzzleSlide4 { 0% { transform: translate(-180px, 0) rotate(10deg); opacity: 0; } 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; } }
        @keyframes puzzleSlide5 { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes puzzleSlide6 { 0% { transform: translate(180px, 0) rotate(-10deg); opacity: 0; } 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; } }
        @keyframes puzzleSlide7 { 0% { transform: translate(-150px, 150px) rotate(20deg); opacity: 0; } 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; } }
        @keyframes puzzleSlide8 { 0% { transform: translate(0, 180px) rotate(-15deg); opacity: 0; } 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; } }
        @keyframes puzzleSlide9 { 0% { transform: translate(150px, 150px) rotate(25deg); opacity: 0; } 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; } }

        @keyframes newsScrollUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }

        @keyframes pageTurnNext {
          0% { transform: rotateY(0deg); opacity: 1; }
          50% { transform: rotateY(-90deg); opacity: 0.5; }
          100% { transform: rotateY(0deg); opacity: 1; }
        }

        @keyframes pageTurnPrev {
          0% { transform: rotateY(0deg); opacity: 1; }
          50% { transform: rotateY(90deg); opacity: 0.5; }
          100% { transform: rotateY(0deg); opacity: 1; }
        }

        .book-page-anim-next { animation: pageTurnNext 0.4s ease-in-out; transform-origin: left; }
        .book-page-anim-prev { animation: pageTurnPrev 0.4s ease-in-out; transform-origin: right; }
      `}</style>

      {/* Navigation Header */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#551A38', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={siteConfig.logo || "/logo.png"} alt="College Logo" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F3C3C7' }} />
          <h2 style={{ color: '#F7EBE8', margin: 0, cursor: 'pointer', fontSize: '20px', letterSpacing: '0.5px', fontFamily: 'serif' }} onClick={() => { setView('home'); setSelectedDepartment(null); }}>
            Government Arts College <span style={{ fontSize: '11px', display: 'block', color: '#F3C3C7', letterSpacing: '2px', fontWeight: 'normal' }}>UDUMALPET</span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#F3C3C7', alignItems: 'center' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => { setView('home'); setSelectedDepartment(null); setTimeout(() => window.scrollTo({top: 650, behavior: 'smooth'}), 100); }}>Home</span>
            
            {/* ---> [ADDED HERE: Download Menu Item right next to Home] <--- */}
            <span 
              style={{ cursor: 'pointer', fontWeight: 'bold', backgroundColor: '', padding: '6px 12px', borderRadius: '0px',  }} 
              onClick={() => setIsDownloadModalOpen(true)}
            >
               Download Center
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setIsNewsDropdownOpen(!isNewsDropdownOpen); setIsPhotoGalleryOpen(false); }}
              style={{ backgroundColor: '#9B516F', color: '#FFFFFF', border: '1px solid #F3C3C7', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              📰 News Gallery ▾
            </button>

            {isNewsDropdownOpen && (
              <div style={{ position: 'absolute', top: '42px', right: 0, width: '340px', height: '320px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '2px solid #551A38', boxShadow: '0 15px 35px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 3000 }}>
                <div style={{ backgroundColor: '#551A38', color: '#FFFFFF', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontFamily: 'serif', color: '#F3C3C7' }}>Live News Ticker</h4>
                  <button onClick={() => setIsNewsDropdownOpen(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>
                <div style={{ flex: 1, padding: '15px', overflow: 'hidden', position: 'relative', backgroundColor: '#F9F1F0' }}>
                  <div 
                    style={{ position: 'absolute', width: 'calc(100% - 30px)', animation: 'newsScrollUp 12s linear infinite', display: 'flex', flexDirection: 'column', gap: '15px' }}
                    onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
                    onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
                  >
                    {newsGalleryList.map((newsItem, index) => (
                      <div key={index} style={{ backgroundColor: '#FFFFFF', padding: '12px 15px', borderRadius: '6px', border: '1px solid #E8D4D6', borderLeft: '4px solid #551A38', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#551A38', fontSize: '13px', margin: 0, lineHeight: '1.4', fontWeight: 'bold' }}>{newsItem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => { setIsPhotoGalleryOpen(true); setIsNewsDropdownOpen(false); setCurrentAlbumPage(0); }}
            style={{ backgroundColor: '#D9822B', color: '#FFFFFF', border: '1px solid #FFE3A8', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(217,130,43,0.3)' }}
          >
            🖼️ Photo Album
          </button>

          <button onClick={() => setView('teacher-login')} style={{ backgroundColor: '#9B516F', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 15px rgba(155, 81, 111, 0.2)' }}>Teacher</button>

          <button onClick={() => setView('admin-login')} style={{ backgroundColor: '#F3C3C7', color: '#551A38', border: 'none', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 15px rgba(243, 195, 199, 0.2)' }}>Admin</button>
        </div>
      </nav>

      {/* HOME VIEW (WITH CLICKABLE DEPARTMENT CARDS & IMAGES) */}
      {view === 'home' && (
        <div>
          {/* HERO & DYNAMIC BACKGROUND VIDEO SECTION */}
          <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 85px)', minHeight: '550px', background: '#551A38', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {mediaStage === 'puzzle' && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, background: '#551A38', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 130px)', gridTemplateRows: 'repeat(3, 130px)', gap: '3px', padding: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '18px', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)' }}>
                  {[...Array(9)].map((_, i) => (
                    <div key={i} style={{ width: '130px', height: '130px', backgroundImage: `url(${siteConfig.logo || '/logo.png'})`, backgroundSize: '390px 390px', backgroundPosition: `${-(i % 3) * 130}px ${-Math.floor(i / 3) * 130}px`, animation: `puzzleSlide${i + 1} 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`, border: '1px solid rgba(255,255,255,0.4)' }}></div>
                  ))}
                </div>
              </div>
            )}

            {mediaStage === 'video' && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
                <video src={siteConfig.bgVideo || "/college.mp4"} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '0 20px', opacity: mediaStage === 'puzzle' ? 0 : 1, transition: 'opacity 0.8s ease-in-out' }}>
              <span style={{ border: '1px solid #F3C3C7', padding: '8px 20px', borderRadius: '30px', fontSize: '12px', color: '#F3C3C7', letterSpacing: '1.5px', background: 'rgba(85, 26, 56, 0.85)', display: 'inline-block', marginBottom: '20px', fontWeight: 'bold' }}>
                ✦ ESTABLISHED 1971 • GOVERNMENT INSTITUTION
              </span>
              <h1 style={{ fontSize: '56px', color: '#FFFFFF', margin: '10px 0 10px 0', fontWeight: 'normal', fontFamily: 'serif' }}>Government Arts College</h1>
              <h2 style={{ fontSize: '42px', color: '#F3C3C7', margin: '0 0 15px 0', fontWeight: '300', letterSpacing: '1px' }}>Udumalpet - Tamilnadu</h2>
              <p style={{ fontSize: '18px', color: '#E8D4D6', maxWidth: '800px', margin: '0 auto 30px auto', lineHeight: '1.6', fontWeight: '300' }}>
                (Affiliated to Bharathiar University – Coimbatore) | Accredited “A” (Cycle II) by NAAC
              </p>
              <button onClick={() => window.scrollTo({top: 1400, behavior: 'smooth'})} style={{ backgroundColor: '#F3C3C7', color: '#551A38', border: 'none', padding: '14px 30px', borderRadius: '30px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(243, 195, 199, 0.3)' }}>
                Explore Programs ↓
              </button>
            </div>
          </div>

          {/* PRINCIPAL MESSAGE SECTION */}
          <div style={{ padding: '70px 10%', background: '#FFFFFF', borderBottom: '1px solid #E8D4D6' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <img src={principalInfo.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'} alt={principalInfo.name} style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover', border: '5px solid #551A38', boxShadow: '0 10px 25px rgba(85,26,56,0.2)' }} />
                <h3 style={{ margin: '15px 0 5px 0', fontSize: '20px', color: '#551A38', fontFamily: 'serif' }}>{principalInfo.name}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#9B516F', fontWeight: 'bold' }}>{principalInfo.designation}</p>
              </div>
              <div style={{ backgroundColor: '#F9F1F0', padding: '40px', borderRadius: '12px', border: '1px solid #E8D4D6', borderLeft: '6px solid #551A38' }}>
                <span style={{ fontSize: '12px', color: '#9B516F', fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Principal's Desk</span>
                <h3 style={{ fontSize: '28px', color: '#551A38', margin: '10px 0 15px 0', fontFamily: 'serif' }}>Message from the Principal</h3>
                <p style={{ fontSize: '17px', color: '#554148', lineHeight: '1.8', margin: 0, fontStyle: 'italic' }}>
                  "{principalInfo.message}"
                </p>
              </div>
            </div>
          </div>

          {/* STATS BLOCK */}
          <div style={{ background: '#551A38', padding: '60px 5%', borderTop: '1px solid #6E3050', borderBottom: '1px solid #6E3050', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', textAlign: 'center' }}>
              <div>
                <h3 style={{ fontSize: '46px', color: '#F3C3C7', margin: '0 0 8px 0', fontFamily: 'serif' }}>{stats.students}</h3>
                <p style={{ color: '#E8D4D6', fontSize: '14px', margin: 0, textTransform: 'uppercase' }}>Students</p>
              </div>
              <div>
                <h3 style={{ fontSize: '46px', color: '#F3C3C7', margin: '0 0 8px 0', fontFamily: 'serif' }}>{stats.staff}</h3>
                <p style={{ color: '#E8D4D6', fontSize: '14px', margin: 0, textTransform: 'uppercase' }}>Teaching & Support Staff</p>
              </div>
              <div>
                <h3 style={{ fontSize: '46px', color: '#F3C3C7', margin: '0 0 8px 0', fontFamily: 'serif' }}>{departmentsList.length}</h3>
                <p style={{ color: '#E8D4D6', fontSize: '14px', margin: 0, textTransform: 'uppercase' }}>Departments</p>
              </div>
              <div>
                <h3 style={{ fontSize: '46px', color: '#F3C3C7', margin: '0 0 8px 0', fontFamily: 'serif' }}>{stats.experience}</h3>
                <p style={{ color: '#E8D4D6', fontSize: '14px', margin: 0, textTransform: 'uppercase' }}>Years of Service</p>
              </div>
            </div>
          </div>

          {/* ABOUT US BLOCK */}
          <div style={{ padding: '80px 5%', background: '#FFFFFF', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
              <div style={{ borderLeft: '6px solid #551A38', paddingLeft: '25px' }}>
                <span style={{ color: '#9B516F', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>About Us</span>
                <h2 style={{ fontSize: '48px', color: '#551A38', margin: '15px 0 25px 0', lineHeight: '1.3', fontFamily: 'serif' }}>
                  A public institution built on access, discipline and academic rigour.
                </h2>
              </div>
              <div>
                <p style={{ color: '#554148', lineHeight: '1.8', fontSize: '18px', marginBottom: '20px' }}>{aboutUsText}</p>
              </div>
            </div>
          </div>

          {/* DEPARTMENTS BLOCK (UPDATED: CLICKABLE CARDS WITH IMAGES) */}
          <div style={{ padding: '80px 5%', background: '#551A38', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ borderLeft: '6px solid #F3C3C7', paddingLeft: '25px', width: '100%', margin: '0 auto 60px auto' }}>
              <span style={{ color: '#F3C3C7', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Departments</span>
              <h2 style={{ fontSize: '50px', color: '#FFFFFF', margin: '15px 0 0 0', fontFamily: 'serif' }}>Our departments, one shared standard of excellence</h2>
              <p style={{ color: '#E8D4D6', fontSize: '14px', marginTop: '10px' }}>Click any department card below to view full course info, lab details, and facilities.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', width: '100%', margin: '0 auto' }}>
              {departmentsList.map((dept, index) => (
                <div 
                  key={dept._id || index} 
                  onClick={() => { setSelectedDepartment(dept); setView('department-detail'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  style={{ backgroundColor: '#632545', border: '1px solid #824263', borderLeft: '5px solid #F3C3C7', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)'; }}
                >
                  {/* Department Image Display */}
                  <div style={{ width: '100%', height: '160px', overflow: 'hidden', backgroundColor: '#551A38' }}>
                    <img 
                      src={dept.image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=500&auto=format&fit=crop&q=80'} 
                      alt={dept.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '20px' }}>📖</span>
                      <span style={{ fontSize: '11px', background: '#551A38', color: '#F3C3C7', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{dept.tag}</span>
                    </div>
                    <h3 style={{ color: '#FFFFFF', fontSize: '22px', margin: '0 0 10px 0' }}>{dept.name}</h3>
                    <p style={{ color: '#E8D4D6', fontSize: '14px', margin: 0, lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{dept.desc}</p>
                    <span style={{ display: 'inline-block', marginTop: '15px', color: '#F3C3C7', fontSize: '13px', fontWeight: 'bold' }}>View Details & Labs →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INVITATIONS & NOTICES */}
          <div style={{ padding: '80px 5%', background: '#F9F1F0', width: '100%', boxSizing: 'border-box', borderTop: '1px solid #E8D4D6' }}>
            <div style={{ borderLeft: '6px solid #551A38', paddingLeft: '25px', marginBottom: '40px' }}>
              <span style={{ color: '#9B516F', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Admin Updates</span>
              <h2 style={{ fontSize: '48px', color: '#551A38', margin: '15px 0 0 0', fontFamily: 'serif' }}>Information & Invitations</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', width: '100%' }}>
              {invitationsList.map((item, index) => (
                <div key={item._id || index} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8D4D6', borderLeft: '6px solid #551A38', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(85,26,56,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', backgroundColor: '#F7EBE8', color: '#551A38', padding: '4px 12px', borderRadius: '6px', fontWeight: 'bold' }}>📢 Notice</span>
                    <span style={{ fontSize: '13px', color: '#9B516F', fontWeight: 'bold' }}>📅 {item.date}</span>
                  </div>
                  <h3 style={{ color: '#551A38', fontSize: '22px', margin: '10px 0 12px 0', fontFamily: 'serif' }}>{item.title}</h3>
                  <p style={{ color: '#554148', fontSize: '16px', lineHeight: '1.7', margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MISSION & VISION */}
          <div style={{ padding: '80px 5%', background: '#FFFFFF', borderTop: '1px solid #eee', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div style={{ backgroundColor: '#F9F1F0', padding: '45px', borderRadius: '12px', border: '1px solid #E8D4D6', borderLeft: '6px solid #551A38' }}>
                <span style={{ color: '#9B516F', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Our Mission</span>
                <h3 style={{ fontSize: '34px', color: '#551A38', margin: '15px 0 15px 0', fontFamily: 'serif' }}>Empowering rural youth through quality education</h3>
                <p style={{ color: '#554148', lineHeight: '1.8', fontSize: '17px', margin: 0 }}>{missionText}</p>
              </div>
              <div style={{ backgroundColor: '#F9F1F0', padding: '45px', borderRadius: '12px', border: '1px solid #E8D4D6', borderLeft: '6px solid #551A38' }}>
                <span style={{ color: '#9B516F', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Our Vision</span>
                <h3 style={{ fontSize: '34px', color: '#551A38', margin: '15px 0 15px 0', fontFamily: 'serif' }}>A center of academic excellence and social equity</h3>
                <p style={{ color: '#554148', lineHeight: '1.8', fontSize: '17px', margin: 0 }}>{visionText}</p>
              </div>
            </div>
          </div>

          {/* ACHIEVERS MARQUEE */}
          <div 
            style={{ padding: '80px 0', background: 'linear-gradient(135deg, #F9F1F0 0%, #F3E5E3 100%)', width: '100%', overflow: 'hidden', boxSizing: 'border-box', borderTop: '1px solid #E8D4D6', borderBottom: '1px solid #E8D4D6' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div style={{ paddingLeft: '5%', marginBottom: '40px' }}>
              <div style={{ borderLeft: '6px solid #551A38', paddingLeft: '25px' }}>
                <span style={{ color: '#9B516F', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Student Achievements</span>
                <h2 style={{ fontSize: '48px', color: '#551A38', margin: '15px 0 0 0', fontFamily: 'serif' }}>Academic & Sports Excellence</h2>
              </div>
            </div>
            <div ref={scrollRef} style={{ display: 'flex', gap: '30px', overflowX: 'hidden', whiteSpace: 'nowrap', width: '100%', padding: '15px 0', scrollbarWidth: 'none' }}>
              {achieversList.map((achiever, index) => (
                <div key={achiever._id || index} style={{ flex: '0 0 320px', backgroundColor: '#FFFFFF', backgroundImage: 'linear-gradient(to bottom, #FFFFFF, #FCF8F7)', border: '1px solid #E8D4D6', borderTop: '5px solid #551A38', borderRadius: '16px', padding: '30px 20px', boxShadow: '0 10px 30px rgba(85,26,56,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', whiteSpace: 'normal', transition: 'transform 0.3s ease, boxShadow 0.3s ease' }}>
                  <div style={{ position: 'relative', marginBottom: '18px' }}>
                    <img src={achiever.photo || achiever.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'} alt={achiever.name} style={{ width: '95px', height: '95px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #F3C3C7', boxShadow: '0 6px 15px rgba(85,26,56,0.2)' }} />
                    <span style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: '#D9822B', color: '#FFFFFF', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>🏆</span>
                  </div>
                  <span style={{ fontSize: '11px', backgroundColor: '#F7EBE8', color: '#551A38', border: '1px solid #E8D4D6', padding: '4px 14px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{achiever.dept || achiever.category || 'Achiever'}</span>
                  <h3 style={{ color: '#551A38', fontSize: '20px', margin: '5px 0 10px 0', fontFamily: 'serif' }}>{achiever.name}</h3>
                  <p style={{ color: '#554148', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{achiever.desc || achiever.achievement}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SERVICES BLOCK */}
          <div style={{ padding: '80px 5%', background: '#551A38', color: '#FFFFFF', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ borderLeft: '6px solid #F3C3C7', paddingLeft: '25px', width: '100%', margin: '0 auto 60px auto' }}>
              <span style={{ color: '#F3C3C7', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Our Services</span>
              <h2 style={{ fontSize: '50px', color: '#FFFFFF', margin: '15px 0 0 0', fontFamily: 'serif' }}>Supporting student welfare and institutional growth</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', width: '100%', margin: '0 auto' }}>
              {servicesList.map((service, index) => (
                <div key={service._id || index} style={{ backgroundColor: '#6E3050', padding: '35px', borderRadius: '10px', border: '1px solid #824263', borderLeft: '5px solid #F3C3C7', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                  <h3 style={{ color: '#F3C3C7', fontSize: '24px', margin: '0 0 15px 0', fontFamily: 'serif' }}>{service.title}</h3>
                  <p style={{ color: '#E8D4D6', fontSize: '16px', lineHeight: '1.7', margin: 0 }}>{service.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CONTACTS BLOCK */}
          <div style={{ padding: '80px 5%', background: '#551A38', color: '#FFFFFF', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
              <div style={{ borderLeft: '6px solid #F3C3C7', paddingLeft: '25px' }}>
                <span style={{ color: '#F3C3C7', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Get in Touch</span>
                <h2 style={{ fontSize: '48px', color: '#FFFFFF', margin: '15px 0 25px 0', fontFamily: 'serif' }}>Contacts & Location</h2>
                <div style={{ fontSize: '16px', color: '#E8D4D6', lineHeight: '2.2' }}>
                  <p style={{ margin: '0' }}>📍 <strong>Address:</strong> {contactInfo.address}</p>
                  <p style={{ margin: '0' }}>📞 <strong>Phone:</strong> {contactInfo.phone}</p>
                  <p style={{ margin: '0' }}>✉️ <strong>Email:</strong> {contactInfo.email}</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#6E3050', padding: '45px', borderRadius: '12px', border: '1px solid #824263', borderLeft: '6px solid #F3C3C7' }}>
                <h3 style={{ color: '#F3C3C7', marginTop: 0, fontSize: '26px', fontFamily: 'serif' }}>Send a Quick Inquiry</h3>
                <form onSubmit={(e) => { e.preventDefault(); alert('Inquiry sent successfully!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
                  <input type="text" placeholder="Your Name" required style={{ padding: '14px', background: '#551A38', color: '#fff', border: '1px solid #824263', borderRadius: '6px', fontSize: '15px' }} />
                  <input type="email" placeholder="Your Email" required style={{ padding: '14px', background: '#551A38', color: '#fff', border: '1px solid #824263', borderRadius: '6px', fontSize: '15px' }} />
                  <textarea placeholder="Your Message" rows="4" required style={{ padding: '14px', background: '#551A38', color: '#fff', border: '1px solid #824263', borderRadius: '6px', fontSize: '15px' }}></textarea>
                  <button type="submit" style={{ backgroundColor: '#F3C3C7', color: '#551A38', border: 'none', padding: '14px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}>Submit Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---> [ADDED HERE: DEPARTMENT DETAIL VIEW SECTION] <--- */}
      {view === 'department-detail' && selectedDepartment && (
        <div style={{ padding: '60px 10%', backgroundColor: '#F7EBE8', minHeight: 'calc(100vh - 85px)', boxSizing: 'border-box' }}>
          <button 
            onClick={() => { setView('home'); setSelectedDepartment(null); }}
            style={{ backgroundColor: '#551A38', color: '#F3C3C7', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginBottom: '25px', boxShadow: '0 4px 10px rgba(85,26,56,0.15)' }}
          >
            ← Back to Home
          </button>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8D4D6', borderLeft: '8px solid #551A38', overflow: 'hidden', boxShadow: '0 15px 35px rgba(85,26,56,0.08)' }}>
            {/* Header Banner with Department Image */}
            <div style={{ position: 'relative', width: '100%', height: '300px', backgroundColor: '#551A38' }}>
              <img 
                src={selectedDepartment.image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=1000&auto=format&fit=crop&q=80'} 
                alt={selectedDepartment.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.85' }} 
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(85,26,56,0.95), transparent)', padding: '30px 40px', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '12px', background: '#F3C3C7', color: '#551A38', padding: '5px 14px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {selectedDepartment.tag || 'Academic Department'}
                </span>
                <h1 style={{ color: '#FFFFFF', fontSize: '38px', margin: '15px 0 5px 0', fontFamily: 'serif' }}>{selectedDepartment.name}</h1>
              </div>
            </div>

            {/* Department Detailed Content Sections */}
            <div style={{ padding: '45px' }}>
              {/* Description about course */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ color: '#551A38', fontSize: '24px', fontFamily: 'serif', borderBottom: '2px solid #F3C3C7', paddingBottom: '10px', marginBottom: '15px' }}>About Course & Curriculum</h3>
                <p style={{ color: '#554148', fontSize: '17px', lineHeight: '1.8', margin: 0 }}>
                  {selectedDepartment.desc || selectedDepartment.courseDetails || 'Comprehensive undergraduate and postgraduate programs designed to build robust theoretical fundamentals and practical problem-solving skills under expert faculty mentorship.'}
                </p>
              </div>

              {/* Grid for Lab Availabilities & Class Rooms */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div style={{ backgroundColor: '#F9F1F0', padding: '30px', borderRadius: '12px', border: '1px solid #E8D4D6', borderLeft: '5px solid #551A38' }}>
                  <h4 style={{ color: '#551A38', fontSize: '20px', margin: '0 0 12px 0', fontFamily: 'serif' }}>🔬 Availabilities & Equipment</h4>
                  <p style={{ color: '#554148', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                    {selectedDepartment.labAvailabilities || 'Fully equipped modern laboratories with high-speed computational systems, advanced apparatus, and dedicated working hours for practical sessions and research projects.'}
                  </p>
                </div>
                <div style={{ backgroundColor: '#F9F1F0', padding: '30px', borderRadius: '12px', border: '1px solid #E8D4D6', borderLeft: '5px solid #9B516F' }}>
                  <h4 style={{ color: '#551A38', fontSize: '20px', margin: '0 0 12px 0', fontFamily: 'serif' }}>🏫 Class Rooms & Infrastructure</h4>
                  <p style={{ color: '#554148', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                    {selectedDepartment.classRooms || 'Spacious, well-ventilated smart lecture halls equipped with audio-visual presentation aids and ergonomic seating arrangements to foster interactive learning.'}
                  </p>
                </div>
              </div>

              {/* Lab Photos Gallery Section */}
              <div>
                <h3 style={{ color: '#551A38', fontSize: '24px', fontFamily: 'serif', borderBottom: '2px solid #F3C3C7', paddingBottom: '10px', marginBottom: '20px' }}>Department Photo Gallery</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {(selectedDepartment.galleryImages && selectedDepartment.galleryImages.length > 0 ? selectedDepartment.galleryImages : [
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80'
                  ]).map((photoUrl, pIndex) => (
                    <div key={pIndex} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #E8D4D6', height: '200px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                      <img src={typeof photoUrl === 'string' ? photoUrl : photoUrl.image} alt="Lab facility" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN VIEW */}
      {view === 'admin-login' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 85px)', backgroundColor: '#F7EBE8', padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '45px', borderRadius: '14px', border: '1px solid #E8D4D6', borderLeft: '6px solid #551A38', boxShadow: '0 10px 30px rgba(85,26,56,0.1)', width: '100%', maxWidth: '420px', boxSizing: 'border-box' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#F3C3C7', color: '#551A38', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '22px', fontFamily: 'serif', marginBottom: '10px' }}>G</div>
              <h2 style={{ color: '#551A38', margin: '0 0 5px 0', fontFamily: 'serif', fontSize: '26px' }}>Admin Portal Login</h2>
            </div>
            {loginError && <div style={{ backgroundColor: '#FDF2F2', border: '1px solid #F5C6CB', color: '#721C24', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>{loginError}</div>}
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#551A38', marginBottom: '6px' }}>Username</label>
                <input type="text" placeholder="Enter Username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #E8D4D6', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#551A38', marginBottom: '6px' }}>Password</label>
                <input type="password" placeholder="Enter Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #E8D4D6', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }} />
              </div>
              <button type="submit" style={{ backgroundColor: '#551A38', color: '#F3C3C7', border: 'none', padding: '14px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', marginTop: '5px' }}>Login to Portal</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => setView('home')} style={{ background: 'transparent', border: 'none', color: '#9B516F', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>← Back to Home Page</button>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER LOGIN VIEW */}
      {view === 'teacher-login' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 85px)', backgroundColor: '#F7EBE8', padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '45px', borderRadius: '14px', border: '1px solid #E8D4D6', borderLeft: '6px solid #9B516F', boxShadow: '0 10px 30px rgba(155,81,111,0.1)', width: '100%', maxWidth: '420px', boxSizing: 'border-box' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#F9F1F0', color: '#9B516F', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '22px', fontFamily: 'serif', marginBottom: '10px', border: '1px solid #E8D4D6' }}>T</div>
              <h2 style={{ color: '#551A38', margin: '0 0 5px 0', fontFamily: 'serif', fontSize: '26px' }}>Teacher Portal Login</h2>
            </div>
            {teacherLoginError && <div style={{ backgroundColor: '#FDF2F2', border: '1px solid #F5C6CB', color: '#721C24', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>{teacherLoginError}</div>}
            <form onSubmit={handleTeacherLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#551A38', marginBottom: '6px' }}>Teacher Username / Email</label>
                <input type="text" placeholder="Enter Teacher Username" value={teacherUsername} onChange={(e) => setTeacherUsername(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #E8D4D6', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#551A38', marginBottom: '6px' }}>Password</label>
                <input type="password" placeholder="Enter Password" value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #E8D4D6', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }} />
              </div>
              <button type="submit" style={{ backgroundColor: '#9B516F', color: '#FFFFFF', border: 'none', padding: '14px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', marginTop: '5px' }}>Login as Teacher</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => setView('home')} style={{ background: 'transparent', border: 'none', color: '#9B516F', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>← Back to Home Page</button>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER DASHBOARD VIEW */}
      {view === 'teacher-dashboard' && (
        <div style={{ padding: '50px 10%', backgroundColor: '#F7EBE8', minHeight: 'calc(100vh - 85px)', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', border: '1px solid #E8D4D6', borderLeft: '6px solid #9B516F', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#9B516F', fontWeight: 'bold', textTransform: 'uppercase' }}>Teacher Portal</span>
                <h2 style={{ color: '#551A38', margin: '5px 0 0 0', fontFamily: 'serif', fontSize: '30px' }}>Welcome, {teacherData?.name || 'Faculty Member'}!</h2>
              </div>
              <button onClick={() => { setTeacherData(null); setView('home'); }} style={{ backgroundColor: '#551A38', color: '#F3C3C7', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Logout</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#F9F1F0', padding: '25px', borderRadius: '8px', border: '1px solid #E8D4D6' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#551A38', fontSize: '18px' }}>Department</h4>
                <p style={{ margin: 0, color: '#554148', fontSize: '16px', fontWeight: 'bold' }}>{teacherData?.department || 'N/A'}</p>
              </div>
              <div style={{ backgroundColor: '#F9F1F0', padding: '25px', borderRadius: '8px', border: '1px solid #E8D4D6' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#551A38', fontSize: '18px' }}>Designation</h4>
                <p style={{ margin: 0, color: '#554148', fontSize: '16px', fontWeight: 'bold' }}>{teacherData?.designation || 'Faculty'}</p>
              </div>
              <div style={{ backgroundColor: '#F9F1F0', padding: '25px', borderRadius: '8px', border: '1px solid #E8D4D6' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#551A38', fontSize: '18px' }}>Email</h4>
                <p style={{ margin: 0, color: '#554148', fontSize: '16px', fontWeight: 'bold' }}>{teacherData?.email || 'N/A'}</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#F7EBE8', padding: '30px', borderRadius: '8px', border: '1px solid #E8D4D6' }}>
              <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>Faculty Announcements & Actions</h3>
              <p style={{ color: '#554148', lineHeight: '1.6', margin: 0 }}>
                You are successfully logged into the teacher portal. Here you can manage your course assignments, view student circulars, and submit internal assessment records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN COMPONENT */}
      {view === 'admin' && (
        <AdminComponent 
          onBack={() => setView('home')}
          invitationsList={invitationsList} setInvitationsList={setInvitationsList}
          newsGalleryList={newsGalleryList} setNewsGalleryList={setNewsGalleryList}
          photoAlbumList={photoAlbumList} setPhotoAlbumList={setPhotoAlbumList}
          stats={stats} setStats={setStats}
          departmentsList={departmentsList} setDepartmentsList={setDepartmentsList}
          servicesList={servicesList} setServicesList={setServicesList}
          aboutUsText={aboutUsText} setAboutUsText={setAboutUsText}
          missionText={missionText} setMissionText={setMissionText}
          visionText={visionText} setVisionText={setVisionText}
          contactInfo={contactInfo} setContactInfo={setContactInfo}
          principalInfo={principalInfo} setPrincipalInfo={setPrincipalInfo}
        />
      )}

     {/* ---> [DOWNLOADS MODAL WINDOW & VIEW MODAL] <--- */}
      {isDownloadModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 3500, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ width: '75vw', height: '75vh', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '3px solid #551A38', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#551A38', color: '#F7EBE8', padding: '16px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontFamily: 'serif', color: '#F3C3C7' }}>📥 Download Center</h3>
              <button onClick={() => setIsDownloadModalOpen(false)} style={{ background: '#F3C3C7', border: 'none', color: '#551A38', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto', backgroundColor: '#F9F1F0' }}>
              {sortedDocuments.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#554148', fontSize: '16px', marginTop: '50px' }}>No documents uploaded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {sortedDocuments.map((doc, index) => (
                    <div key={doc._id || index} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E8D4D6', borderLeft: '6px solid #551A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(85,26,56,0.05)' }}>
                      <div>
                        <span style={{ fontSize: '11px', backgroundColor: '#F7EBE8', color: '#551A38', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                          📅 {doc.date || doc.createdAt ? new Date(doc.date || doc.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                        <h4 style={{ margin: '8px 0 0 0', color: '#551A38', fontSize: '18px', fontFamily: 'serif' }}>{doc.title || doc.name || 'Untitled Document'}</h4>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <a 
                          href={doc.fileUrl || doc.url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          download 
                          style={{ backgroundColor: '#551A38', color: '#F3C3C7', padding: '10px 20px', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 10px rgba(85,26,56,0.2)' }}
                        >
                          Download ↓
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---> [DOCUMENT PREVIEW MODAL POPUP] <--- */}
      {selectedDocumentForView && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 4000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ width: '85vw', height: '85vh', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '3px solid #551A38', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#551A38', color: '#F7EBE8', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'serif', color: '#F3C3C7' }}>
                📄 Preview: {selectedDocumentForView.title || selectedDocumentForView.name || 'Document'}
              </h3>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <a 
                  href={selectedDocumentForView.fileUrl || selectedDocumentForView.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  download 
                  style={{ backgroundColor: '#F3C3C7', color: '#551A38', padding: '6px 14px', borderRadius: '15px', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px' }}
                >
                  Download ↓
                </a>
                <button onClick={() => setSelectedDocumentForView(null)} style={{ background: '#F3C3C7', border: 'none', color: '#551A38', width: '30px', height: '30px', borderRadius: '50%', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#F9F1F0', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <iframe 
                src={selectedDocumentForView.fileUrl || selectedDocumentForView.url} 
                title={selectedDocumentForView.title} 
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* PHOTO GALLERY MODAL */}
      {isPhotoGalleryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ width: '950px', height: '620px', backgroundColor: '#EAD7BD', borderRadius: '12px', border: '10px solid #5C3A21', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#5C3A21', color: '#FDF8F2', padding: '12px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'serif', color: '#F3E5D8' }}>📖 Vintage Photo Album Book (Page {currentAlbumPage + 1} of {totalAlbumPages})</h3>
              <button onClick={() => setIsPhotoGalleryOpen(false)} style={{ background: '#C8A271', border: 'none', color: '#5C3A21', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
            <div style={{ flex: 1, display: 'flex', background: 'radial-gradient(circle, #F6EAD8 0%, #E3CCA8 100%)', position: 'relative' }}>
              <div className={flipDirection === 'next' ? 'book-page-anim-next' : flipDirection === 'prev' ? 'book-page-anim-prev' : ''} style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: '400px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {currentPhotosSlice.map((photo, index) => (
                    <div key={photo._id || index} onClick={() => setSelectedPhoto(photo)} style={{ backgroundColor: '#FFFDF9', padding: '10px 10px 25px 10px', borderRadius: '3px', border: '1px solid #D4B595', boxShadow: '0 6px 15px rgba(92,58,33,0.2)', cursor: 'pointer', transform: index % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)' }}>
                      <img src={photo.image} alt={photo.title} style={{ width: '100%', height: '110px', objectFit: 'cover', border: '1px solid #E3CCA8' }} />
                      <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: 'bold', color: '#5C3A21', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{photo.title}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px dashed #C8A271' }}>
                <div style={{ backgroundColor: 'rgba(255, 253, 249, 0.7)', padding: '30px', borderRadius: '8px', border: '1px solid #D4B595', minHeight: '260px' }}>
                  <h3 style={{ fontSize: '22px', color: '#5C3A21', margin: '15px 0 10px 0', fontFamily: 'serif' }}>{currentPhotosSlice[0]?.title || 'Campus Moments'}</h3>
                  <p style={{ fontSize: '15px', color: '#4A3B32', lineHeight: '1.7', margin: 0 }}>{currentPhotosSlice[0]?.desc || 'Browse through the vintage album frames to explore moments captured across departments.'}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <button onClick={handlePrevPage} disabled={currentAlbumPage === 0} style={{ backgroundColor: currentAlbumPage === 0 ? '#D5C2A5' : '#5C3A21', color: '#FDF8F2', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: currentAlbumPage === 0 ? 'not-allowed' : 'pointer' }}>← Previous</button>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#5C3A21' }}>Page {currentAlbumPage + 1} of {totalAlbumPages}</span>
                  <button onClick={handleNextPage} disabled={currentAlbumPage >= totalAlbumPages - 1} style={{ backgroundColor: currentAlbumPage >= totalAlbumPages - 1 ? '#D5C2A5' : '#5C3A21', color: '#FDF8F2', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: currentAlbumPage >= totalAlbumPages - 1 ? 'not-allowed' : 'pointer' }}>Next →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 4000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px' }}>
          <div style={{ backgroundColor: '#FFFDF9', maxWidth: '850px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '4px solid #5C3A21', display: 'flex', position: 'relative' }}>
            <button onClick={() => setSelectedPhoto(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: '#5C3A21', border: 'none', color: '#FFFFFF', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', zIndex: '10' }}>✕</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', width: '100%' }}>
              <div style={{ backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <img src={selectedPhoto.image} alt={selectedPhoto.title} style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '500px' }} />
              </div>
              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#F9F3EA' }}>
                <h2 style={{ fontSize: '26px', color: '#5C3A21', margin: '0 0 15px 0', fontFamily: 'serif' }}>{selectedPhoto.title}</h2>
                <p style={{ fontSize: '16px', color: '#554148', lineHeight: '1.8', margin: 0 }}>{selectedPhoto.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}