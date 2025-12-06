import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "./ToastProvider";
import getProfile from "../api/get-profile";
import getUserProfile from "../api/get-user-profile";
import patchProfile from "../api/patch-profile";
import Avatar from "./Avatar";
import './ProfileModal.css';


function ProfileModal({ isOpen, onClose, userId = null, username = null }) {
    const { auth } = useAuth();
    const { showToast } = useToast();

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
            showToast(`Failed to save: ${error.message}`);
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
        <div className="profile-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
                <button className="profile-close" onClick={onClose}>×</button>

                {loading && <div className="profile-loading">Loading...</div>}
                
                {error && <div className="profile-error">{error}</div>}

                {!loading && !error && profile && (
                    <>
                        {isEditing ? (
                            /* Edit Mode */
                            <div className="profile-edit-form">
                                <div className="profile-form-group">
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

                                <div className="profile-form-group">
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
                                
                                <div className="profile-form-group">
                                    <label htmlFor="bio">Bio</label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us about yourself..."
                                        maxLength={200}
                                        rows={3}
                                    />
                                    <span className="profile-char-count">
                                        {formData.bio.length}/200
                                    </span>
                                </div>

                                <div className="profile-actions">
                                    <button
                                        className="profile-btn profile-btn-primary"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        className="profile-btn profile-btn-secondary"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View Mode */
                            <>
                                {/* Avatar */}
                                <div className="profile-avatar">
                                    <Avatar 
                                        initials={profile.initials || profile.username?.substring(0, 2).toUpperCase()} 
                                        userId={profile.id} 
                                        size={80} 
                                    />
                                </div>

                                {/* Username */}
                                <p className="profile-username">@{profile.username}</p>

                                {/* Full Name */}
                                {(profile.first_name || profile.last_name) && (
                                    <h2 className="profile-fullname">
                                        {profile.first_name} {profile.last_name}
                                    </h2>
                                )}

                                {/* Job Role */}
                                {profile.job_role && (
                                    <p className="profile-job-role">{profile.job_role}</p>
                                )}

                                {/* Location & Date Joined */}
                                {(profile.location || profile.created_at) && (
                                    <div className="profile-info">
                                        {profile.location && (
                                            <p className="profile-location">
                                                <span className="material-icons">location_on</span>
                                                {profile.location}
                                            </p>
                                        )}
                                        {profile.created_at && (
                                            <p className="profile-joined">
                                                <span className="material-icons">calendar_today</span>
                                                {formatDate(profile.created_at)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Bio */}
                                {profile.bio && (
                                    <p className="profile-bio">{profile.bio}</p>
                                )}

                                {/* Teams */}
                                {profile.teams && profile.teams.length > 0 && (
                                    <div className="profile-teams">
                                        <h4 className="profile-teams-label">Teams</h4>
                                        <div className="profile-teams-list">
                                            {profile.teams.map((team) => (
                                                <span key={team.id} className="profile-team-chip">
                                                    {team.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Edit Button - only for own profile */}
                                {isOwnProfile && (
                                    <button
                                        className="profile-btn profile-btn-edit"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ProfileModal;