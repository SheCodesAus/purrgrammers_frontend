import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import getProfile from "../api/get-profile";
import getUserProfile from "../api/get-user-profile";
import patchProfile from "../api/patch-profile";
import './ProfileModal.css';


function ProfileModal({ isOpen, onClose, userId = null, username = null }) {
    const { auth } = useAuth();

    // determines if user is viewing own profile
    const isOwnProfile = !userId || userId === auth?.user?.id;

    // profile data
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ bio: '', location: '' });
    const [saving, setSaving] = useState(false);

    // fetch profile when modal opens
    useEffect(() => {
        async function fetchProfile() {
            if (!isOpen) return;

            setLoading(true);
            setError('');
            setIsEditing(false);

            try {
                let data;
                if (isOwnProfile) {
                    data = await getProfile(auth.token);
                } else {
                    data = await getUserProfile(userId, auth.token);
                }
                console.log('Profile response:', data);  // Debug: check what backend returns
                setProfile(data);
                setFormData({
                    bio: data.bio || '',
                    location: data.location || '',
                    job_role: data.job_role || '',
                });
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [isOpen, userId, auth?.token, isOwnProfile]);

    // handle form changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value}));
    };

    // save profile
    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await patchProfile(formData, auth.token);
            setProfile(updated);
            setIsEditing(false);
        } catch (error) {
            alert(`Failed to save: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    // cancel editing
    const handleCancel = () => {
        setFormData({
            bio: profile?.bio || '',
            location: profile?.location || '',
            job_role: profile?.job_role || '',
        });
        setIsEditing(false);
    };

    // format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!isOpen) return null;

     // display name: for own profile use auth.user, for others use passed username
    const displayName = isOwnProfile ? auth?.user?.username : username;
    const displayEmail = isOwnProfile ? auth?.user?.email : null;

    return (
        <div className="cyber-profile-overlay" onClick={onClose}>
            <div className="cyber-profile-modal" onClick={(event) => event.stopPropagation()}>
                {/* Scanline effect overlay */}
                <div className="cyber-profile-scanlines"></div>
                
                {/* Top glow bar */}
                <div className="cyber-profile-glow-bar top"></div>
                
                <button className="cyber-profile-close" onClick={onClose}>×</button>

                {loading && <div className="cyber-profile-loading">LOADING...</div>}
                
                {error && <div className="cyber-profile-error">ERROR: {error}</div>}

                {!loading && !error && profile && (
                    <>
                        {/* User Info */}
                        {(profile.first_name || profile.last_name) && (
                            <h2 className="cyber-profile-fullname">
                                {profile.first_name} {profile.last_name}
                            </h2>
                        )}
                        <p className="cyber-profile-username">{profile.username}</p>
                        
                        {profile.created_at && (
                            <p className="cyber-profile-joined">
                                ONLINE SINCE {formatDate(profile.created_at)}
                            </p>
                        )}

                        {/* Profile Details */}
                        <div className="cyber-profile-details">
                            {isEditing ? (
                                // Edit Mode
                                <div className="cyber-profile-edit-form">
                                    <div className="cyber-profile-form-group">
                                        <label htmlFor="job_role">Job Role</label>
                                        <input
                                            id="job_role"
                                            type="text"
                                            name="job_role"
                                            value={formData.job_role}
                                            onChange={handleChange}
                                            placeholder="What do you do?"
                                            maxLength={100}
                                        />
                                    </div>

                                    <div className="cyber-profile-form-group">
                                        <label htmlFor="location">Location</label>
                                        <input
                                            id="location"
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="Where are you based?"
                                            maxLength={100}
                                        />
                                    </div>
                                    
                                    <div className="cyber-profile-form-group">
                                        <label htmlFor="bio">Bio</label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Tell us about yourself..."
                                            maxLength={500}
                                            rows={4}
                                        />
                                        <span className="cyber-profile-char-count">
                                            {formData.bio.length}/500
                                        </span>
                                    </div>

                                    <div className="cyber-profile-actions">
                                        <button
                                            className="cyber-profile-btn cyber-profile-btn-primary"
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            className="cyber-profile-btn cyber-profile-btn-secondary"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    {profile.job_role && (
                                        <p className="cyber-profile-job-role">
                                            {profile.job_role}
                                        </p>
                                    )}

                                    <div className="cyber-profile-stats">
                                        {profile.location && (
                                            <div className="cyber-profile-stat-item">
                                                <span className="cyber-profile-stat-label">LOCATION</span>
                                                <span className="cyber-profile-stat-value">{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {profile.bio ? (
                                        <div className="cyber-profile-bio-section">
                                            <span className="cyber-profile-bio-label">// SYSTEM.BIO</span>
                                            <p className="cyber-profile-bio">&gt; {profile.bio}<span className="cyber-profile-cursor">_</span></p>
                                        </div>
                                    ) : isOwnProfile ? (
                                        <div className="cyber-profile-bio-section">
                                            <span className="cyber-profile-bio-label">// SYSTEM.BIO</span>
                                            <p className="cyber-profile-bio-empty">&gt; No data found. Initialize bio?<span className="cyber-profile-cursor">_</span></p>
                                        </div>
                                    ) : (
                                        <div className="cyber-profile-bio-section">
                                            <span className="cyber-profile-bio-label">// SYSTEM.BIO</span>
                                            <p className="cyber-profile-bio-empty">&gt; No data found.<span className="cyber-profile-cursor">_</span></p>
                                        </div>
                                    )}

                                    {/* Teams Section */}
                                    {profile.teams && profile.teams.length > 0 && (
                                        <div className="cyber-profile-teams">
                                            <h4 className="cyber-profile-teams-label">NETWORKS</h4>
                                            <div className="cyber-profile-teams-list">
                                                {profile.teams.map((team) => (
                                                    <span key={team.id} className="cyber-profile-team-chip">
                                                        {team.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isOwnProfile && (
                                        <button
                                            className="cyber-profile-btn cyber-profile-btn-edit"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            EDIT PROFILE
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        
                        {/* Bottom glow bar */}
                        <div className="cyber-profile-glow-bar bottom"></div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ProfileModal;