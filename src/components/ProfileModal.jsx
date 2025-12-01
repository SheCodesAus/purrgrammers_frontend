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
                setProfile(data);
                setFormData({
                    bio: data.bio || '',
                    location: data.location || '',
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
            location: profile?.location || ''
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
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
                <button className="profile-modal-close" onClick={onClose}>×</button>

                {loading && <div className="profile-modal-loading">Loading...</div>}
                
                {error && <div className="profile-modal-error">{error}</div>}

                {!loading && !error && profile && (
                    <>
                        {/* Avatar */}
                        <div className="profile-avatar">
                            {displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        {/* User Info */}
                        <h2 className="profile-username">{displayName}</h2>
                        
                        {displayEmail && (
                            <p className="profile-email">{displayEmail}</p>
                        )}

                        {profile.created_at && (
                            <p className="profile-joined">
                                Joined {formatDate(profile.created_at)}
                            </p>
                        )}

                        {/* Profile Details */}
                        <div className="profile-details">
                            {isEditing ? (
                                // Edit Mode
                                <div className="profile-edit-form">
                                    <div className="form-group">
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
                                    
                                    <div className="form-group">
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
                                        <span className="char-count">
                                            {formData.bio.length}/500
                                        </span>
                                    </div>

                                    <div className="profile-actions">
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    {profile.location && (
                                        <p className="profile-location">
                                            {profile.location}
                                        </p>
                                    )}
                                    
                                    {profile.bio ? (
                                        <p className="profile-bio">{profile.bio}</p>
                                    ) : isOwnProfile ? (
                                        <p className="profile-bio-empty">
                                            No bio yet. Click edit to add one!
                                        </p>
                                    ) : (
                                        <p className="profile-bio-empty">
                                            This user hasn't added a bio yet.
                                        </p>
                                    )}

                                    {isOwnProfile && (
                                        <button
                                            className="btn btn-edit"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ProfileModal;