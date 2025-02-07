// filepath: /c:/Users/vanfl/CascadeProjects/node/user-management-app/frontend/src/components/UserProfile.jsx
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Modal from './Modal';
import './UserProfile.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const history = useHistory();

    useEffect(() => {
        let isMounted = true;

        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    history.push('/login');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (isMounted) {
                    setUser(response.data);
                    setName(response.data.name);
                    setEmail(response.data.email);
                    setPhotoPreview(response.data.photo);
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
                if (isMounted) {
                    setError('Failed to fetch user profile');
                }
            }
        };

        fetchUserProfile();

        return () => {
            isMounted = false;
        };
    }, [history]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            if (password) {
                formData.append('password', password);
            }
            if (photo) {
                formData.append('photo', photo);
            }

            await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const response = await axios.get('http://localhost:5000/api/users/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data);
            setName(response.data.name);
            setEmail(response.data.email);
            setPhotoPreview(response.data.photo);
            setIsUpdateModalOpen(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/users/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            localStorage.removeItem('token');
            history.push('/register');
        } catch (err) {
            console.error('Error deleting account:', err);
            setError('Failed to delete account');
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-grid">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-image-wrapper">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="profile-image" />
                            ) : (
                                <div className="profile-image-placeholder">
                                    <i className="fas fa-user"></i>
                                </div>
                            )}
                        </div>
                        <h2>{user.name}</h2>
                        <span className="user-role">{user.isAdmin ? 'Administrator' : 'User'}</span>
                    </div>
                    <div className="profile-details">
                        <div className="detail-item">
                            <span className="detail-label">Email</span>
                            <span className="detail-value">{user.email}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Member since</span>
                            <span className="detail-value">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="profile-actions">
                        <button className="action-button" onClick={() => setIsUpdateModalOpen(true)}>
                            Update Profile
                        </button>
                        {user.isAdmin && (
                            <button 
                                className="action-button admin"
                                onClick={() => history.push('/admin')}
                            >
                                Admin Dashboard
                            </button>
                        )}
                        <button 
                            className="action-button delete" 
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)}>
                <h3>Update Profile</h3>
                <form onSubmit={handleSubmit} className="update-form">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="Leave blank to keep current password"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="photo">Profile Photo</label>
                        <div className="file-input-wrapper">
                            <input
                                id="photo"
                                type="file"
                                onChange={handlePhotoChange}
                                className="file-input"
                                accept="image/*"
                            />
                            <button type="button" className="file-input-button">
                                Choose Photo
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className={`update-button ${isLoading ? 'loading' : ''}`} 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                <span>Updating...</span>
                            </>
                        ) : (
                            'Update Profile'
                        )}
                    </button>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h3>Delete Account</h3>
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                <button 
                    className={`delete-button ${isLoading ? 'loading' : ''}`} 
                    onClick={handleDeleteAccount} 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            <span>Deleting...</span>
                        </>
                    ) : (
                        'Delete Account'
                    )}
                </button>
            </Modal>
        </div>
    );
};

export default UserProfile;