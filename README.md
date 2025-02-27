# User Management App

This project is a user management application that allows users to register, log in, and manage their profiles. Admin users can view, modify, and delete user accounts. The application includes image upload functionality for user photos.

## Project Structure

```
user-management-app
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── middleware
│   │   ├── config
│   │   └── app.js
│   ├── package.json
│   └── README.md
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles
│   ├── package.json
│   └── README.md
├── README.md
└── .gitignore
```

## Technologies Used

- **Frontend**: React, JSX, CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer for handling image uploads

## Features

- User registration with name, email, password, and photo upload.
- User login and profile management.
- Admin dashboard for viewing, modifying, and deleting users.
- Secure authentication and authorization.

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd user-management-app
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. Start the frontend application:
   ```
   cd frontend
   npm start
   ```

### API Endpoints

- `POST /api/users/register`: Register a new user.
- `POST /api/users/login`: Log in a user.
- `GET /api/users/profile`: Get user profile (requires authentication).
- `GET /api/users`: Get all users (admin only).
- `PUT /api/users/:id`: Update user information (admin only).
- `DELETE /api/users/:id`: Delete a user (admin only).

## License

This project is licensed under the MIT License.# n o d e j s  
 