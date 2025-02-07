const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configuration de multer pour gérer les fichiers uploadés
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

router.post('/register', upload.single('photo'), UserController.register);
router.post('/login', UserController.login);
router.get('/profile', protect, UserController.getUserProfile);
router.put('/update/:id', protect, upload.single('photo'), UserController.updateUser);
router.delete('/:id', protect, UserController.deleteUser);
router.get('/', protect, UserController.getAllUsers);

module.exports = router;