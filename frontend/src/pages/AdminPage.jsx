import React, { useEffect, useState } from 'react';
import UserList from '../components/UserList';
import UserForm from '../components/UserForm';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
    };

    const handleDelete = async (userId) => {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        fetchUsers();
    };

    const handleFormSubmit = async (user) => {
        if (selectedUser) {
            await fetch(`/api/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });
        } else {
            await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });
        }
        setSelectedUser(null);
        fetchUsers();
    };

    return (
        <div>
            <h1>Admin User Management</h1>
            <UserForm onSubmit={handleFormSubmit} selectedUser={selectedUser} />
            <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
};

export default AdminPage;