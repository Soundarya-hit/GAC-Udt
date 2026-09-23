import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminComponent({ onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [invitationsList, setInvitationsList] = useState([]);
  const [newsGalleryList, setNewsGalleryList] = useState([]);
  const [photoAlbumList, setPhotoAlbumList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [achieversList, setAchieversList] = useState([]);
  
  const [stats, setStats] = useState({ students: '', staff: '', experience: '' });
  const [aboutUsText, setAboutUsText] = useState('');
  const [missionText, setMissionText] = useState('');
  const [visionText, setVisionText] = useState('');
  const [contactInfo, setContactInfo] = useState({ address: '', phone: '', email: '' });
  const [principalInfo, setPrincipalInfo] = useState({ name: '', designation: '', photo: '', message: '' });
  const [siteConfig, setSiteConfig] = useState({ logo: '', bgVideo: '' });
  
  // Admin Credentials State
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });

  // Form / Edit States
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/data`)
      .then(res => res.json())
      .then(data => {
        if (data.invitations) setInvitationsList(data.invitations);
        if (data.news) setNewsGalleryList(data.news);
        if (data.photos) setPhotoAlbumList(data.photos);
        if (data.departments) setDepartmentsList(data.departments);
        if (data.services) setServicesList(data.services);
        if (data.achievers) setAchieversList(data.achievers);
        if (data.config) {
          setStats(data.config.stats || { students: '', staff: '', experience: '' });
          setAboutUsText(data.config.aboutUsText || '');
          setMissionText(data.config.missionText || '');
          setVisionText(data.config.visionText || '');
          setContactInfo(data.config.contactInfo || { address: '', phone: '', email: '' });
          setPrincipalInfo(data.config.principalInfo || { name: '', designation: '', photo: '', message: '' });
          setSiteConfig(data.config.siteConfig || { logo: '', bgVideo: '' });
          setAdminCredentials({ 
            username: data.config.adminUsername || 'GAC@udt', 
            password: data.config.adminPassword || 'GAC@2026' 
          });
        }
      })
      .catch(err => console.error('Error fetching data from MongoDB:', err));
  }, []);

  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const updateConfigInDB = async (updatedFields) => {
    try {
      const payload = {
        stats, aboutUsText, missionText, visionText, contactInfo, principalInfo, siteConfig,
        adminUsername: adminCredentials.username,
        adminPassword: adminCredentials.password,
        ...updatedFields
      };
      const res = await fetch(`${API_BASE_URL}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(data.stats) setStats(data.stats);
      if(data.aboutUsText !== undefined) setAboutUsText(data.aboutUsText);
      if(data.missionText !== undefined) setMissionText(data.missionText);
      if(data.visionText !== undefined) setVisionText(data.visionText);
      if(data.contactInfo) setContactInfo(data.contactInfo);
      if(data.principalInfo) setPrincipalInfo(data.principalInfo);
      if(data.siteConfig) setSiteConfig(data.siteConfig);
      if(data.adminUsername) setAdminCredentials(prev => ({ ...prev, username: data.adminUsername }));
      if(data.adminPassword) setAdminCredentials(prev => ({ ...prev, password: data.adminPassword }));
    } catch (err) {
      console.error('Error updating config in MongoDB:', err);
    }
  };

  // Generic Save / Add / Update Handler for Collections
  const handleSaveItem = async (e, endpoint, list, setList, resetForm) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await fetch(`${API_BASE_URL}/${endpoint}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const updated = await res.json();
        setList(list.map(item => item._id === editingId ? updated : item));
        setEditingId(null);
        alert('Updated successfully in database!');
      } else {
        const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const saved = await res.json();
        setList([saved, ...list]);
        alert('Added successfully to database!');
      }
      setFormData({});
      if(resetForm) resetForm.reset();
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  const handleDeleteItem = async (endpoint, id, list, setList) => {
    if(!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' });
      setList(list.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7EBE8', color: '#551A38', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '280px', backgroundColor: '#551A38', color: '#F7EBE8', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F3C3C7', color: '#551A38', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', fontFamily: 'serif' }}>G</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontFamily: 'serif', color: '#F3C3C7' }}>Admin Portal</h3>
            <span style={{ fontSize: '11px', color: '#E8D4D6' }}>GAC Udumalpet</span>
          </div>
        </div>

        <button onClick={onBack} style={{ backgroundColor: '#9B516F', color: '#FFFFFF', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textAlign: 'left' }}>
          ← Back to Home
        </button>

        <hr style={{ borderColor: '#6E3050', margin: '5px 0' }} />

        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'stats', label: '📈 Students & Staff Counts' },
          { id: 'principal', label: '👤 Principal Profile' },
          { id: 'about', label: '🏛️ About, Mission & Vision' },
          { id: 'departments', label: '📖 Departments' },
          { id: 'notices', label: '📢 Notices & Invitations' },
          { id: 'news', label: '📰 News Gallery' },
          { id: 'photos', label: '🖼️ Photo Album' },
          { id: 'achievers', label: '🏆 Achievers' },
          { id: 'services', label: '🛠️ Services & Contact' },
          { id: 'credentials', label: '🔐 Admin Credentials' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setEditingId(null); setFormData({}); }} 
            style={{ backgroundColor: activeTab === tab.id ? '#F3C3C7' : 'transparent', color: activeTab === tab.id ? '#551A38' : '#F7EBE8', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', fontSize: '13px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: '40px 50px', overflowY: 'auto', boxSizing: 'border-box' }}>
        
        {activeTab === 'dashboard' && (
          <div>
            {/* TOP HEADER WITH COLLEGE NAME & LIVE CLOCK */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '30px 35px', borderRadius: '16px', border: '1px solid #E8D4D6', borderLeft: '8px solid #551A38', boxShadow: '0 8px 25px rgba(85,26,56,0.08)', marginBottom: '35px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#9B516F', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Welcome Admin Portal</span>
                <h1 style={{ color: '#551A38', fontSize: '32px', fontFamily: 'serif', margin: '8px 0 5px 0' }}>Government Arts College, Udumalpet</h1>
              </div>
              <div style={{ textAlign: 'right', backgroundColor: '#F9F1F0', padding: '12px 20px', borderRadius: '10px', border: '1px solid #E8D4D6' }}>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#551A38', fontFamily: 'monospace' }}>
                  {currentDateTime.toLocaleTimeString()}
                </div>
                <div style={{ fontSize: '13px', color: '#9B516F', fontWeight: 'bold', marginTop: '4px' }}>
                  {currentDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* STATS COUNT CARDS */}
            <h3 style={{ color: '#551A38', fontFamily: 'serif', fontSize: '22px', marginBottom: '20px' }}>📈 Institutional Overview Counts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '25px', borderRadius: '12px', border: '1px solid #E8D4D6', boxShadow: '0 4px 15px rgba(85,26,56,0.05)', borderTop: '4px solid #551A38', textAlign: 'center' }}>
                <span style={{ fontSize: '24px' }}>🎓</span>
                <h4 style={{ margin: '10px 0 5px 0', color: '#9B516F', fontSize: '13px', textTransform: 'uppercase' }}>Students Count</h4>
                <p style={{ margin: 0, fontSize: '28px', color: '#551A38', fontWeight: 'bold', fontFamily: 'serif' }}>{stats.students || '0'}</p>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '25px', borderRadius: '12px', border: '1px solid #E8D4D6', boxShadow: '0 4px 15px rgba(85,26,56,0.05)', borderTop: '4px solid #551A38', textAlign: 'center' }}>
                <span style={{ fontSize: '24px' }}>👨‍🏫</span>
                <h4 style={{ margin: '10px 0 5px 0', color: '#9B516F', fontSize: '13px', textTransform: 'uppercase' }}>Staff Count</h4>
                <p style={{ margin: 0, fontSize: '28px', color: '#551A38', fontWeight: 'bold', fontFamily: 'serif' }}>{stats.staff || '0'}</p>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '25px', borderRadius: '12px', border: '1px solid #E8D4D6', boxShadow: '0 4px 15px rgba(85,26,56,0.05)', borderTop: '4px solid #551A38', textAlign: 'center' }}>
                <span style={{ fontSize: '24px' }}>📖</span>
                <h4 style={{ margin: '10px 0 5px 0', color: '#9B516F', fontSize: '13px', textTransform: 'uppercase' }}>Departments</h4>
                <p style={{ margin: 0, fontSize: '28px', color: '#551A38', fontWeight: 'bold', fontFamily: 'serif' }}>{departmentsList.length}</p>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '25px', borderRadius: '12px', border: '1px solid #E8D4D6', boxShadow: '0 4px 15px rgba(85,26,56,0.05)', borderTop: '4px solid #551A38', textAlign: 'center' }}>
                <span style={{ fontSize: '24px' }}>⏳</span>
                <h4 style={{ margin: '10px 0 5px 0', color: '#9B516F', fontSize: '13px', textTransform: 'uppercase' }}>Experience / Since</h4>
                <p style={{ margin: 0, fontSize: '28px', color: '#551A38', fontWeight: 'bold', fontFamily: 'serif' }}>{stats.experience || '0'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN CREDENTIALS MANAGEMENT */}
        {activeTab === 'credentials' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '12px', borderLeft: '6px solid #551A38' }}>
            <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>🔐 Admin Username & Password Settings</h3>
            <p style={{ fontSize: '13px', color: '#554148', marginBottom: '20px' }}>
              Update your Admin Username and Password here. Once updated, it will be saved directly to the database and required for all future admin portal logins.
            </p>
            <form onSubmit={async (e) => { 
              e.preventDefault(); 
              await updateConfigInDB({ 
                adminUsername: adminCredentials.username, 
                adminPassword: adminCredentials.password 
              }); 
              alert('Admin Credentials updated successfully in Database!'); 
            }} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px' }}>Admin Username</label>
                <input 
                  type="text" 
                  value={adminCredentials.username} 
                  onChange={(e) => setAdminCredentials({...adminCredentials, username: e.target.value})} 
                  placeholder="Enter Admin Username" 
                  required 
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px' }}>Admin Password</label>
                <input 
                  type="text" 
                  value={adminCredentials.password} 
                  onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})} 
                  placeholder="Enter New Password" 
                  required 
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }} 
                />
              </div>
              <button type="submit" style={{ backgroundColor: '#551A38', color: '#F3C3C7', border: 'none', padding: '12px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}>
                Update Credentials
              </button>
            </form>
          </div>
        )}

        {activeTab === 'stats' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '12px', borderLeft: '6px solid #551A38' }}>
            <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>📈 Manage Counts</h3>
            <form onSubmit={async (e) => { e.preventDefault(); await updateConfigInDB({ stats }); alert('Statistics updated!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <input type="text" value={stats.students} onChange={(e) => setStats({...stats, students: e.target.value})} placeholder="Students Count" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" value={stats.staff} onChange={(e) => setStats({...stats, staff: e.target.value})} placeholder="Staff Count" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" value={stats.experience} onChange={(e) => setStats({...stats, experience: e.target.value})} placeholder="Experience Years" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <button type="submit" style={{ backgroundColor: '#551A38', color: '#F3C3C7', border: 'none', padding: '12px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>Save Stats</button>
            </form>
          </div>
        )}

        {activeTab === 'principal' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '12px', borderLeft: '6px solid #9B516F' }}>
            <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>👤 Principal Profile</h3>
            <form onSubmit={async (e) => { e.preventDefault(); await updateConfigInDB({ principalInfo }); alert('Principal Profile updated!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <input type="text" value={principalInfo.name} onChange={(e) => setPrincipalInfo({...principalInfo, name: e.target.value})} placeholder="Name" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" value={principalInfo.designation} onChange={(e) => setPrincipalInfo({...principalInfo, designation: e.target.value})} placeholder="Designation" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setPrincipalInfo({...principalInfo, photo: url}))} />
              <textarea rows="4" value={principalInfo.message} onChange={(e) => setPrincipalInfo({...principalInfo, message: e.target.value})} placeholder="Message" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
              <button type="submit" style={{ backgroundColor: '#9B516F', color: '#FFFFFF', border: 'none', padding: '12px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>Update Profile</button>
            </form>
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '12px', borderLeft: '6px solid #551A38' }}>
            <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>🏛️ About Us, Mission & Vision</h3>
            <form onSubmit={async (e) => { e.preventDefault(); await updateConfigInDB({ aboutUsText, missionText, visionText }); alert('Saved successfully!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>About Us Text</label>
              <textarea rows="4" value={aboutUsText} onChange={(e) => setAboutUsText(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
              <label style={{ fontWeight: 'bold' }}>Mission Text</label>
              <textarea rows="3" value={missionText} onChange={(e) => setMissionText(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
              <label style={{ fontWeight: 'bold' }}>Vision Text</label>
              <textarea rows="3" value={visionText} onChange={(e) => setVisionText(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
              <button type="submit" style={{ backgroundColor: '#551A38', color: '#F3C3C7', border: 'none', padding: '12px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>Save Changes</button>
            </form>
          </div>
        )}

        {/* DEPARTMENTS MANAGEMENT */}
        {activeTab === 'departments' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '12px', borderLeft: '6px solid #551A38' }}>
            <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>📖 Departments Management</h3>
            <form onSubmit={(e) => handleSaveItem(e, 'departments', departmentsList, setDepartmentsList, e.target)} style={{ backgroundColor: '#F9F1F0', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Department Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Tag (UG · PG)" value={formData.tag || ''} onChange={(e) => setFormData({...formData, tag: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <textarea placeholder="Description" rows="2" value={formData.desc || ''} onChange={(e) => setFormData({...formData, desc: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
              <button type="submit" style={{ backgroundColor: '#551A38', color: '#F3C3C7', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>{editingId ? 'Update Department' : 'Add Department'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({}); }} style={{ background: '#ccc', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}>Cancel Edit</button>}
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {departmentsList.map((dept) => (
                <div key={dept._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: '#FAFAFA', border: '1px solid #E8D4D6', borderRadius: '6px' }}>
                  <div>
                    <strong>{dept.name}</strong> <span style={{ fontSize: '11px', background: '#551A38', color: '#FFF', padding: '2px 6px', borderRadius: '4px' }}>{dept.tag}</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>{dept.desc}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingId(dept._id); setFormData(dept); }} style={{ background: '#2B7AD9', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteItem('departments', dept._id, departmentsList, setDepartmentsList)} style={{ background: '#D9822B', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTICES MANAGEMENT */}
        {activeTab === 'notices' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '12px', borderLeft: '6px solid #551A38' }}>
            <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>📢 Information & Invitations</h3>
            <form onSubmit={(e) => handleSaveItem(e, 'invitations', invitationsList, setInvitationsList, e.target)} style={{ backgroundColor: '#F9F1F0', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Date" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <textarea placeholder="Description" rows="3" value={formData.desc || ''} onChange={(e) => setFormData({...formData, desc: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
              <button type="submit" style={{ backgroundColor: '#551A38', color: '#F3C3C7', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>{editingId ? 'Update Notice' : 'Publish Notice'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({}); }} style={{ background: '#ccc', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}>Cancel Edit</button>}
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {invitationsList.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', backgroundColor: '#FAFAFA', border: '1px solid #E8D4D6', borderRadius: '6px' }}>
                  <div><strong>{item.title}</strong> ({item.date})</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingId(item._id); setFormData(item); }} style={{ background: '#2B7AD9', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteItem('invitations', item._id, invitationsList, setInvitationsList)} style={{ background: '#D9822B', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEWS GALLERY MANAGEMENT */}
        {activeTab === 'news' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '12px', borderLeft: '6px solid #9B516F' }}>
            <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>📰 News Gallery Marquee</h3>
            <form onSubmit={(e) => handleSaveItem(e, 'news', newsGalleryList, setNewsGalleryList, e.target)} style={{ backgroundColor: '#F9F1F0', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Headline / News Text" value={formData.text || ''} onChange={(e) => setFormData({...formData, text: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <button type="submit" style={{ backgroundColor: '#9B516F', color: '#FFF', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>{editingId ? 'Update News' : 'Add News'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({}); }} style={{ background: '#ccc', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}>Cancel Edit</button>}
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {newsGalleryList.map((news) => (
                <div key={news._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', backgroundColor: '#FAFAFA', border: '1px solid #E8D4D6', borderRadius: '6px' }}>
                  <div>{news.text}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingId(news._id); setFormData(news); }} style={{ background: '#2B7AD9', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteItem('news', news._id, newsGalleryList, setNewsGalleryList)} style={{ background: '#D9822B', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHOTO ALBUM MANAGEMENT */}
        {activeTab === 'photos' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '12px', borderLeft: '6px solid #D9822B' }}>
            <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>🖼️ Photo Album & Gallery</h3>
            <form onSubmit={(e) => handleSaveItem(e, 'photos', photoAlbumList, setPhotoAlbumList, e.target)} style={{ backgroundColor: '#F9F1F0', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setFormData({...formData, image: url}))} />
              <textarea placeholder="Description" rows="2" value={formData.desc || ''} onChange={(e) => setFormData({...formData, desc: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
              <button type="submit" style={{ backgroundColor: '#D9822B', color: '#FFF', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>{editingId ? 'Update Photo' : 'Upload Photo'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({}); }} style={{ background: '#ccc', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}>Cancel Edit</button>}
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {photoAlbumList.map((photo) => (
                <div key={photo._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', backgroundColor: '#FAFAFA', border: '1px solid #E8D4D6', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={photo.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                    <div><strong>{photo.title}</strong><p style={{ margin: 0, fontSize: '12px' }}>{photo.desc}</p></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingId(photo._id); setFormData(photo); }} style={{ background: '#2B7AD9', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteItem('photos', photo._id, photoAlbumList, setPhotoAlbumList)} style={{ background: '#D9822B', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACHIEVERS MANAGEMENT */}
        {activeTab === 'achievers' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '12px', borderLeft: '6px solid #551A38' }}>
            <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>🏆 Achievers Management</h3>
            <form onSubmit={(e) => handleSaveItem(e, 'achievers', achieversList, setAchieversList, e.target)} style={{ backgroundColor: '#F9F1F0', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Department / Category" value={formData.dept || ''} onChange={(e) => setFormData({...formData, dept: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setFormData({...formData, photo: url}))} />
              <textarea placeholder="Achievement Description" rows="2" value={formData.desc || ''} onChange={(e) => setFormData({...formData, desc: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
              <button type="submit" style={{ backgroundColor: '#551A38', color: '#F3C3C7', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>{editingId ? 'Update Achiever' : 'Add Achiever'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({}); }} style={{ background: '#ccc', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}>Cancel Edit</button>}
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {achieversList.map((ach) => (
                <div key={ach._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', backgroundColor: '#FAFAFA', border: '1px solid #E8D4D6', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={ach.photo} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div><strong>{ach.name}</strong> ({ach.dept})<p style={{ margin: 0, fontSize: '12px' }}>{ach.desc}</p></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingId(ach._id); setFormData(ach); }} style={{ background: '#2B7AD9', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteItem('achievers', ach._id, achieversList, setAchieversList)} style={{ background: '#D9822B', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES MANAGEMENT */}
        {activeTab === 'services' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '35px', borderRadius: '12px', borderLeft: '6px solid #551A38' }}>
            <h3 style={{ color: '#551A38', marginTop: 0, fontFamily: 'serif' }}>🛠️ Services & Contact Management</h3>
            <form onSubmit={(e) => handleSaveItem(e, 'services', servicesList, setServicesList, e.target)} style={{ backgroundColor: '#F9F1F0', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Service Title" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <textarea placeholder="Description" rows="2" value={formData.desc || ''} onChange={(e) => setFormData({...formData, desc: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
              <button type="submit" style={{ backgroundColor: '#551A38', color: '#F3C3C7', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>{editingId ? 'Update Service' : 'Add Service'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({}); }} style={{ background: '#ccc', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}>Cancel Edit</button>}
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
              {servicesList.map((srv) => (
                <div key={srv._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', backgroundColor: '#FAFAFA', border: '1px solid #E8D4D6', borderRadius: '6px' }}>
                  <div><strong>{srv.title}</strong><p style={{ margin: 0, fontSize: '12px' }}>{srv.desc}</p></div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingId(srv._id); setFormData(srv); }} style={{ background: '#2B7AD9', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteItem('services', srv._id, servicesList, setServicesList)} style={{ background: '#D9822B', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ color: '#551A38', fontFamily: 'serif' }}>📞 Contact Info</h3>
            <form onSubmit={async (e) => { e.preventDefault(); await updateConfigInDB({ contactInfo }); alert('Contact updated!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <input type="text" value={contactInfo.address} onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})} placeholder="Address" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} placeholder="Phone" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" value={contactInfo.email} onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} placeholder="Email" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <button type="submit" style={{ backgroundColor: '#9B516F', color: '#FFF', border: 'none', padding: '12px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>Save Contact Info</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}