import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/users/login', { email, password });

            console.log('Login response:', response.data);
            localStorage.setItem('token', response.data.token);
            history.push(response.data.isAdmin ? '/admin' : '/profile');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <i className="fas fa-user-circle"></i>
                    <h2>Welcome Back</h2>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                            placeholder="Enter your email"
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
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className={`login-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <div className="register-link">
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;