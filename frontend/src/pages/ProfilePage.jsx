import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMyProfile, getMyUser, updateUserInfo, updateProfile } from '../services/api';
import Navbar from '../components/Navbar';
import { MapPin, Upload, Pencil, Star, ArrowLeft } from 'lucide-react';
import './Profile.css';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [editSection, setEditSection] = useState(null);
  const [formData, setFormData] = useState({});
  
  // Is this user a client or freelancer?
  // Defaulting to freelancer if role array includes it, otherwise client.
  const isFreelancer = user?.role?.includes('freelancer');

  const handleEditClick = (section, initialData) => {
    setEditSection(section);
    setFormData(initialData || {});
  };

  const handleCancel = () => {
    setEditSection(null);
    setFormData({});
  };

  const handleSave = async (section) => {
    try {
      if (section === 'education') {
        await updateUserInfo({ department: formData.department, academicYear: formData.academicYear });
      } else if (section === 'about') {
        await updateProfile({ bio: formData.bio });
      } else if (section === 'portfolio') {
        const urlArray = (formData.portfolio || '').split(',').map(s => s.trim()).filter(Boolean);
        await updateProfile({ portfolio: urlArray });
        formData.portfolio = urlArray; // keep local state consistent
      } else if (section === 'skills') {
        const skillArray = (formData.skills || '').split(',').map(s => s.trim()).filter(Boolean);
        await updateProfile({ skills: skillArray });
        formData.skills = skillArray; // keep local state consistent
      }

      setProfile((prev) => ({ ...prev, ...formData }));
      setEditSection(null);
    } catch (error) {
      console.error("Failed to save", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert(`Failed to save changes: ${errorMsg}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await getMyProfile();
        setProfile(res.data.profile);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        // If profile fetch fails (e.g. backend routes commented out), we just use user context
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <Navbar hideLinks={true} />
      
      <div style={{ padding: '20px 40px 0' }}>
        <button 
          onClick={() => navigate(isFreelancer ? '/freelancer-dashboard' : '/dashboard')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600' }}
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>
      
      <div className="profile-header-section">
        <div className="profile-header-content">
          <div className="profile-identity">
            <div className="profile-avatar-large">
              {profile?.coverImage ? (
                <img src={profile.coverImage} alt="Profile" />
              ) : (
                 <div className="avatar-placeholder-large">{user?.name?.charAt(0).toUpperCase()}</div>
              )}
            </div>
            
            <div className="profile-info">
              <h1 className="profile-name">{user?.name || 'Loading...'}</h1>
              <p className="profile-location">
                <MapPin size={16} color="var(--primary)" />
                Lahore, Pakistan
              </p>
            </div>
          </div>
          

        </div>
      </div>
      
      <div className="profile-body">
        {/* Left Column */}
        <div className="profile-col-left">
          <div className="profile-card">
            <div className="card-header">
              <h3>Education</h3>
              {editSection !== 'education' && <Pencil size={16} className="edit-icon" onClick={() => handleEditClick('education', { department: profile?.department || user?.department, academicYear: profile?.academicYear || user?.academicYear })} />}
            </div>
            {editSection === 'education' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input name="department" placeholder="Department" value={formData.department || ''} onChange={handleChange} className="input-field" />
                <input name="academicYear" placeholder="Academic Year" value={formData.academicYear || ''} onChange={handleChange} className="input-field" />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn-primary" onClick={() => handleSave('education')} style={{ padding: '6px 12px' }}>Save</button>
                  <button className="btn-outline" onClick={handleCancel} style={{ padding: '6px 12px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="card-text">{profile?.department || user?.department || 'No department info'}</p>
                <p className="card-text">{profile?.academicYear || user?.academicYear || 'No academic year'}</p>
              </>
            )}
          </div>
          
          {isFreelancer && (
            <div className="profile-card">
              <div className="card-header">
                <h3>Bids</h3>
              </div>
              <p className="card-text">How many bids you got left</p>
            </div>
          )}


        </div>

        {/* Right Column */}
        <div className="profile-col-right">
          <div className="profile-card main-card">
            <div className="card-header">
              <h3>{profile?.bio ? 'About' : 'Your Intro'}</h3>
              {editSection !== 'about' && <Pencil size={16} className="edit-icon" onClick={() => handleEditClick('about', { bio: profile?.bio })} />}
            </div>
            {editSection === 'about' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea name="bio" placeholder="Who you are, what you did..." value={formData.bio || ''} onChange={handleChange} className="input-field" style={{ minHeight: '80px', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn-primary" onClick={() => handleSave('about')} style={{ padding: '6px 12px' }}>Save</button>
                  <button className="btn-outline" onClick={handleCancel} style={{ padding: '6px 12px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="card-text">
                  {profile?.bio || 'Who you are, what you did basic intro type text'}
                </p>
              </>
            )}
            
            <hr className="divider" />
            
            <div className="card-header">
              <h3>Portfolio</h3>
              {editSection !== 'portfolio' && <Pencil size={16} className="edit-icon" onClick={() => handleEditClick('portfolio', { portfolio: profile?.portfolio?.join(', ') || '' })} />}
            </div>
            {editSection === 'portfolio' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea name="portfolio" placeholder="Comma separated URLs" value={formData.portfolio || ''} onChange={(e) => setFormData({ portfolio: e.target.value })} className="input-field" style={{ minHeight: '60px' }} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn-primary" onClick={() => handleSave('portfolio')} style={{ padding: '6px 12px' }}>Save</button>
                  <button className="btn-outline" onClick={handleCancel} style={{ padding: '6px 12px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                {profile?.portfolio && profile.portfolio.length > 0 ? (
                  profile.portfolio.map((url, i) => (
                    <p key={i} className="text-primary">{url}</p>
                  ))
                ) : (
                  <p className="text-primary">url</p>
                )}
              </>
            )}



            {isFreelancer && (
              <>
                <hr className="divider" />
                <div className="card-header">
                  <h3>Skills</h3>
                  {editSection !== 'skills' && <Pencil size={16} className="edit-icon" onClick={() => handleEditClick('skills', { skills: profile?.skills?.join(', ') || '' })} />}
                </div>
                {editSection === 'skills' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input name="skills" placeholder="Comma separated skills (e.g. React, Node)" value={formData.skills || ''} onChange={(e) => setFormData({ skills: e.target.value })} className="input-field" />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button className="btn-primary" onClick={() => handleSave('skills')} style={{ padding: '6px 12px' }}>Save</button>
                      <button className="btn-outline" onClick={handleCancel} style={{ padding: '6px 12px' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="skills-container">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, i) => (
                        <span key={i} className="skill-pill">
                          <Star size={12} fill="white" /> {skill}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="skill-pill"><Star size={12} fill="white" /> Skill 1</span>
                        <span className="skill-pill"><Star size={12} fill="white" /> Skill 2</span>
                        <span className="skill-pill"><Star size={12} fill="white" /> Skill 3</span>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
