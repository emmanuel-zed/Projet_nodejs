import React, { useState, useEffect } from 'react';

const UserForm = ({ user, onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhoto(user.photo);
        }
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        if (photo) {
            formData.append('photo', photo);
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Photo:</label>
                <input
                    type="file"
                    onChange={(e) => setPhoto(e.target.files[0])}
                />
            </div>
            <button type="submit">{user ? 'Update' : 'Create'} User</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
};

export default UserForm;