import React, { useEffect, useState } from 'react';
import UserItem from './UserItem';

const UserList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);
        };

        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        await fetch(`/api/users/${id}`, {
            method: 'DELETE',
        });
        setUsers(users.filter(user => user._id !== id));
    };

    return (
        <div>
            <h2>User List</h2>
            <ul>
                {users.map(user => (
                    <UserItem key={user._id} user={user} onDelete={handleDelete} />
                ))}
            </ul>
        </div>
    );
};

export default UserList;