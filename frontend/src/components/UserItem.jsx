import React from 'react';

const UserItem = ({ user, onEdit, onDelete }) => {
    return (
        <div className="user-item">
            <img src={user.photo} alt={`${user.name}'s profile`} />
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <button onClick={() => onEdit(user.id)}>Edit</button>
            <button onClick={() => onDelete(user.id)}>Delete</button>
        </div>
    );
};

export default UserItem;