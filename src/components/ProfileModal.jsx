import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "./ToastProvider";
import getProfile from "../api/get-profile";
import getUserProfile from "../api/get-user-profile";
import patchProfile from "../api/patch-profile";
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
            await patchProfile(formData, auth.token);
            // Re-fetch profile to get complete data including teams
            const refreshed = await getProfile(auth.token);
            setProfile(refreshed);
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
                        {/* Full Name */}
                        <h2 className="profile-fullname">
                            {profile.first_name || profile.last_name 
                                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                                : profile.username}
                        </h2>

                        {/* Job Role - editable or display */}
                        <div className="profile-job-role">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="job_role"
                                    value={formData.job_role}
                                    onChange={handleChange}
                                    placeholder="Add job role"
                                    className="profile-inline-input"
                                    maxLength={100}
                                />
                            ) : (
                                <span>{profile.job_role || 'No job role'}</span>
                            )}
                        </div>

                        {/* Location - editable or display */}
                        <div className="profile-location">
                            <span className="material-icons">location_on</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Add location"
                                    className="profile-inline-input"
                                    maxLength={100}
                                />
                            ) : (
                                <span>{profile.location || 'No location'}</span>
                            )}
                        </div>

                        {/* Teams */}
                        {profile.teams && profile.teams.length > 0 && (
                            <div className="profile-teams">
                                <p className="profile-teams-label">Teams</p>
                                <div className="profile-teams-list">
                                    {profile.teams.map((team) => (
                                        <span key={team.id} className="profile-team-chip">
                                            {team.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Edit / Save / Cancel Buttons */}
                        {isOwnProfile && (
                            <div className="profile-actions">
                                {isEditing ? (
                                    <>
                                        <button
                                            className="profile-btn profile-btn-edit"
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
                                    </>
                                ) : (
                                    <button
                                        className="profile-btn profile-btn-edit"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ProfileModal;