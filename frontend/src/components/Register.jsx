import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('isAdmin', isAdmin);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            const response = await axios.post('http://localhost:5000/api/users/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Registration response:', response.data);
            history.push('/login'); // Rediriger vers la page de connexion après l'enregistrement
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h2>Create an Account</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Photo</label>
                        <input
                            type="file"
                            onChange={handlePhotoChange}
                            accept="image/*"
                            className="form-input"
                        />
                        {photoPreview && (
                            <img
                                src={photoPreview}
                                alt="Preview"
                                className="photo-preview"
                            />
                        )}
                    </div>
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isAdmin}
                                onChange={(e) => {
                                    setIsAdmin(e.target.checked);
                                    console.log('isAdmin changed to:', e.target.checked);
                                }}
                            />
                            <span>Register as Admin</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        className={`register-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <div className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;