import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyProfile, getMyUser } from '../services/api';
import Navbar from '../components/Navbar';
import { MapPin, Upload, Pencil, Star } from 'lucide-react';
import './Profile.css';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Is this user a client or freelancer?
  // Defaulting to freelancer if role array includes it, otherwise client.
  const isFreelancer = user?.role?.includes('freelancer');

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
            <button className="btn-outline">See Public View</button>
            <button className="btn-primary">Profile Settings</button>
            <div className="share-btn">
              <Upload size={20} color="var(--primary)" />
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
              <Pencil size={16} className="edit-icon" />
            </div>
            <p className="card-text">{user?.department || 'No department info'}</p>
            <p className="card-text">{user?.academicYear || 'No academic year'}</p>
          </div>
          
          {isFreelancer && (
            <div className="profile-card">
              <div className="card-header">
                <h3>Bids</h3>
              </div>
              <p className="card-text">How many bids you got left</p>
            </div>
          )}

          <div className="profile-card">
            <div className="card-header">
              <h3>Testimonials</h3>
            </div>
            <p className="card-text">Client reviews etc url</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-col-right">
          <div className="profile-card main-card">
            <div className="card-header">
              <h3>{profile?.bio ? 'About' : 'Random Job'}</h3>
              <Pencil size={16} className="edit-icon" />
            </div>
            <p className="card-text">
              {profile?.bio || 'Who you are, what you did basic intro type text'}
            </p>
            {isFreelancer && <p className="text-primary mt-2">300 pkr/hr <Pencil size={14} className="edit-icon inline" /></p>}
            
            <hr className="divider" />
            
            <div className="card-header">
              <h3>Portfolio</h3>
              <Pencil size={16} className="edit-icon" />
            </div>
            {profile?.portfolio && profile.portfolio.length > 0 ? (
              profile.portfolio.map((url, i) => (
                <p key={i} className="text-primary">{url}</p>
              ))
            ) : (
              <p className="text-primary">url</p>
            )}

            <hr className="divider" />
            
            <div className="card-header">
              <h3>Work History</h3>
              <Pencil size={16} className="edit-icon" />
            </div>
            <div className="work-history-boxes">
               <div className="work-box">
                 <div className="work-img-placeholder"></div>
                 <p>job details in a url</p>
               </div>
               <div className="work-box">
                 <div className="work-img-placeholder"></div>
                 <p>job details in a url</p>
               </div>
            </div>

            {isFreelancer && (
              <>
                <hr className="divider" />
                <div className="card-header">
                  <h3>Skills</h3>
                  <Pencil size={16} className="edit-icon" />
                </div>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
