const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserController {
    async register(req, res) {
        const { name, email, password, isAdmin } = req.body;
        const photo = req.file ? req.file.path : null;

        try {
            if (await User.findOne({ email })) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ name, email, password: hashedPassword, isAdmin, photo });

            const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, photo: user.photo } });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, photo: user.photo } });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async getUserProfile(req, res) {
        try {
            const user = await User.findById(req.user.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error('Get user profile error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async updateUser(req, res) {
        const { name, email, password } = req.body;
        const photo = req.file ? req.file.path : null;

        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Vérifiez si l'adresse e-mail est déjà utilisée par un autre utilisateur
            if (email && email !== user.email) {
                const emailExists = await User.findOne({ email });
                if (emailExists) {
                    return res.status(400).json({ message: 'Email already in use' });
                }
            }

            user.name = name || user.name;
            user.email = email || user.email;
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }
            if (photo) {
                user.photo = photo;
            }

            await user.save();
            res.status(200).json({ message: 'User updated successfully', photo: user.photo });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async deleteUser(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await user.remove();
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await User.find().select('-password');
            res.status(200).json(users);
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = new UserController();