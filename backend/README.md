# User Management App - Backend

This is the backend part of the User Management application built with Node.js, Express, and MongoDB. The application allows for user registration, login, profile management, and admin functionalities to manage users.

## Features

- User registration with name, email, password, and photo upload.
- User login and authentication.
- Profile management for users.
- Admin functionalities to view, modify, and delete users.

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- Bcrypt for password hashing
- Multer for handling file uploads

## Project Structure

```
backend
├── src
│   ├── controllers
│   │   └── userController.js
│   ├── models
│   │   └── userModel.js
│   ├── routes
│   │   └── userRoutes.js
│   ├── middleware
│   │   └── authMiddleware.js
│   ├── config
│   │   └── db.js
│   └── app.js
├── package.json
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd user-management-app/backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Set up your MongoDB database and update the connection string in `src/config/db.js`.

5. Start the server:
   ```
   npm start
   ```

## API Endpoints

- `POST /api/users/register` - Register a new user.
- `POST /api/users/login` - Log in an existing user.
- `GET /api/users/profile` - Get the logged-in user's profile.
- `PUT /api/users/:id` - Update user information (admin only).
- `DELETE /api/users/:id` - Delete a user (admin only).

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.