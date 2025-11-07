const User = require('../models/User'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            isAdmin: user.isAdmin 
        },
        process.env.JWT_SECRET || "social_app_secret_key", 
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
};

// [POST] /api/auth/register
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được sử dụng." });
        }
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            email,
            password: hashedPassword, 
        });
        const user = await newUser.save();
        
        const { password: userPassword, ...other } = user._doc;
        res.status(201).json({ 
            message: "Đăng ký thành công!", 
            user: other 
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Tên đăng nhập hoặc Email đã tồn tại." });
        }
        console.error("Lỗi đăng ký:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [POST] /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        const isPasswordCorrect = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Mật khẩu không đúng." });
        }

        const accessToken = generateAccessToken(user);

        const { password, ...other } = user._doc;

        res.status(200).json({
            user: other,
            accessToken, 
            message: "Đăng nhập thành công!"
        });

    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};
