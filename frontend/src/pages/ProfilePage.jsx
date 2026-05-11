import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyProfile, getMyUser } from '../services/api';
import Navbar from '../components/Navbar';
import { MapPin, Upload, Pencil, Star, Save, X } from 'lucide-react';
import { updateProfile, updateUserInfo } from '../services/api';
import { notification, Spin, Input, Button as AntButton, message } from 'antd';
import './Profile.css';

const { TextArea } = Input;

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [notifApi, contextHolder] = notification.useNotification();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    bio: '',
    department: '',
    academicYear: '',
    skills: ''
  });

  // Is this user a client or freelancer?
  const isFreelancer = user?.role?.includes('freelancer');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await getMyProfile();
        const p = res.data.profile || res.data;
        setProfile(p);
        setFormData({
          bio: p?.bio || '',
          department: user?.department || '',
          academicYear: user?.academicYear || '',
          skills: p?.skills?.join(', ') || '',
          portfolio: p?.portfolio?.join('\n') || '',
          workHistory: p?.workHistory?.join('\n') || '',
          testimonials: p?.testimonials?.join('\n') || ''
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    console.log('[Profile] Saving changes...', formData);
    
    try {
      // Execute both updates in parallel
      const [userRes, profileRes] = await Promise.all([
        updateUserInfo({
          department: formData.department || '',
          academicYear: formData.academicYear || ''
        }),
        updateProfile({
          bio: formData.bio || '',
          skills: (formData.skills || '').split(',').map(s => s.trim()).filter(s => s),
          portfolio: (formData.portfolio || '').split('\n').map(s => s.trim()).filter(s => s),
          workHistory: (formData.workHistory || '').split('\n').map(s => s.trim()).filter(s => s),
          testimonials: (formData.testimonials || '').split('\n').map(s => s.trim()).filter(s => s)
        })
      ]);

      console.log('[Profile] Update success:', { user: userRes.data, profile: profileRes.data });

      notifApi.success({ 
        message: 'Profile Updated', 
        description: 'Your changes have been saved successfully.' 
      });
      
      // Update local state with fresh data from server
      if (userRes.data?.user) setUser(userRes.data.user);
      if (profileRes.data?.profile) setProfile(profileRes.data.profile);
      
      setIsEditing(false);
    } catch (err) {
      console.error('[Profile] Save failed:', err);
      notifApi.error({ 
        message: 'Update Failed', 
        description: err.response?.data?.message || err.message 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div className="profile-container">
      {contextHolder}
      <Navbar />
      
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
          
          <div className="profile-actions">
            {isEditing ? (
              <>
                <AntButton 
                  icon={<Save size={16} />} 
                  type="primary" 
                  loading={saving}
                  onClick={handleSave}
                  style={{ background: '#E85D24', borderColor: '#E85D24' }}
                >
                  Save Changes
                </AntButton>
                <AntButton 
                  icon={<X size={16} />} 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </AntButton>
              </>
            ) : (
              <AntButton 
                type="primary" 
                icon={<Pencil size={16} />}
                onClick={() => setIsEditing(true)}
                style={{ background: '#E85D24', borderColor: '#E85D24' }}
              >
                Edit Profile
              </AntButton>
            )}
          </div>
        </div>
      </div>
      
      <div className="profile-body">
        {/* Left Column */}
        <div className="profile-col-left">
          <div className="profile-card">
            <div className="card-header">
              <h3>Education</h3>
              {!isEditing && <Pencil size={16} className="edit-icon" onClick={() => setIsEditing(true)} />}
            </div>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Input 
                  name="department" 
                  placeholder="Department (e.g. Computer Science)" 
                  value={formData.department} 
                  onChange={handleInputChange} 
                />
                <Input 
                  name="academicYear" 
                  placeholder="Academic Year (e.g. 2024)" 
                  value={formData.academicYear} 
                  onChange={handleInputChange} 
                />
              </div>
            ) : (
              <>
                <p className="card-text">{user?.department || 'No department info'}</p>
                <p className="card-text">{user?.academicYear || 'No academic year'}</p>
              </>
            )}
          </div>
          
          <div className="profile-card">
            <div className="card-header">
              <h3>Testimonials</h3>
              {!isEditing && <Pencil size={16} className="edit-icon" onClick={() => setIsEditing(true)} />}
            </div>
            {isEditing ? (
              <TextArea 
                name="testimonials" 
                rows={4} 
                value={formData.testimonials} 
                onChange={handleInputChange} 
                placeholder="Client review URLs or quotes (one per line)..."
              />
            ) : (
              <div className="card-text">
                {profile?.testimonials && profile.testimonials.length > 0 ? (
                  profile.testimonials.map((t, i) => <p key={i}>{t}</p>)
                ) : (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No testimonials yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-col-right">
          <div className="profile-card main-card">
            <div className="card-header">
              <h3>{profile?.bio ? 'About' : 'About Me'}</h3>
              {!isEditing && <Pencil size={16} className="edit-icon" onClick={() => setIsEditing(true)} />}
            </div>
            {isEditing ? (
              <TextArea 
                name="bio" 
                rows={4} 
                value={formData.bio} 
                onChange={handleInputChange} 
                placeholder="Write a short bio about yourself..."
              />
            ) : (
              <p className="card-text">
                {profile?.bio || 'Introduce yourself to the community...'}
              </p>
            )}
            
            <hr className="divider" />
            
            <div className="card-header">
              <h3>Portfolio</h3>
              {!isEditing && <Pencil size={16} className="edit-icon" onClick={() => setIsEditing(true)} />}
            </div>
            {isEditing ? (
              <TextArea 
                name="portfolio" 
                rows={4} 
                value={formData.portfolio} 
                onChange={handleInputChange} 
                placeholder="Portfolio links (one per line)..."
              />
            ) : (
              <div>
                {profile?.portfolio && profile.portfolio.length > 0 ? (
                  profile.portfolio.map((url, i) => (
                    <p key={i} className="text-primary" style={{ marginBottom: 4 }}>
                      <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer" style={{ color: '#f05a28' }}>{url}</a>
                    </p>
                  ))
                ) : (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No portfolio added</p>
                )}
              </div>
            )}

            <hr className="divider" />
            
            <div className="card-header">
              <h3>Work History</h3>
              {!isEditing && <Pencil size={16} className="edit-icon" onClick={() => setIsEditing(true)} />}
            </div>
            {isEditing ? (
              <TextArea 
                name="workHistory" 
                rows={4} 
                value={formData.workHistory} 
                onChange={handleInputChange} 
                placeholder="Work history entries (one per line)..."
              />
            ) : (
              <div className="work-history-boxes">
                {profile?.workHistory && profile.workHistory.length > 0 ? (
                  profile.workHistory.map((work, i) => (
                    <div key={i} className="work-box" style={{ background: '#f9fafb', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 8, width: '100%' }}>
                      <p>{work}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No work history available</p>
                )}
              </div>
            )}

            {isFreelancer && (
              <>
                <hr className="divider" />
                <div className="card-header">
                  <h3>Skills</h3>
                  {!isEditing && <Pencil size={16} className="edit-icon" onClick={() => setIsEditing(true)} />}
                </div>
                {isEditing ? (
                  <Input 
                    name="skills" 
                    placeholder="Skills (comma separated: React, Node, UI/UX)" 
                    value={formData.skills} 
                    onChange={handleInputChange} 
                  />
                ) : (
                  <div className="skills-container">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, i) => (
                        <span key={i} className="skill-pill">
                          <Star size={12} fill="white" /> {skill}
                        </span>
                      ))
                    ) : (
                      <p className="card-text" style={{ color: '#9ca3af', fontStyle: 'italic' }}>No skills added yet</p>
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
