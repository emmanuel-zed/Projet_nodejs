import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);  // Success message state
    const [editingUser, setEditingUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const history = useHistory();

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    history.push('/login');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (isMounted) {
                    setUsers(response.data);
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        localStorage.removeItem('token');
                        history.push('/login');
                    } else {
                        setError('Error fetching users. Please try again.');
                        console.error('Error:', err);
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, [history]);

    useEffect(() => {
        if (photo) {
            const objectUrl = URL.createObjectURL(photo);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [photo]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(users.filter(user => user._id !== id));
                setSuccess('User deleted successfully!');
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    history.push('/login');
                } else {
                    setError('Error deleting user. Please try again.');
                    console.error('Error:', err);
                }
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/users/update/${editingUser._id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUsers(users.map(user => 
                user._id === editingUser._id 
                    ? { ...user, name, email, photo: response.data.photo || user.photo } 
                    : user
            ));
            setSuccess('User updated successfully!');
            handleCancelEdit();
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                history.push('/login');
            } else {
                setError('Error updating user. Please try again.');
                console.error('Error:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPreview(user.photo);
        setPhoto(null);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setName('');
        setEmail('');
        setPhoto(null);
        setPreview(null);
        setError(null);
        setSuccess(null); // Reset success state
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setPhoto(file);
        } else {
            setError('Please upload a valid image file.');
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>} {/* Success message */}
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn btn-edit" 
                                                onClick={() => handleEdit(user)}
                                                disabled={loading}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="btn btn-delete" 
                                                onClick={() => handleDelete(user._id)}
                                                disabled={loading}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {editingUser && (
                        <form className="edit-form" onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Photo</label>
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    accept="image/*"
                                />
                                {preview && (
                                    <img 
                                        src={preview} 
                                        alt="Preview" 
                                        className="photo-preview" 
                                    />
                                )}
                            </div>
                            <div className="form-actions">
                                <button 
                                    className="btn btn-edit" 
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                                <button 
                                    className="btn btn-cancel" 
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;