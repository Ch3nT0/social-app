const User = require('../../models/user.model');
const sendMailHelper = require('../../helpers/sendMail');
const generate = require('../../helpers/generate');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ForgotPassword = require('../../models/forgot-password.model');

// [POST] /auth/register
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
        const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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

// [POST] /auth/password/forgot
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: "Nếu email tồn tại, mã OTP sẽ được gửi." });
        }
        const otp = generate.generateRandomNumber(6); 
        const expireAt = Date.now() + 5 * 60 * 1000; 
        await ForgotPassword.create({ otp, email, expireAt });

        // Gửi email
        const subject = "Mã OTP xác minh lấy lại mật khẩu";
        const html = `
            <p>Chào bạn,</p>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn.</p>
            <p>Mã OTP của bạn là: <b>${otp}</b>. Mã này có hiệu lực trong 5 phút.</p>
            <p>Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        `;

        sendMailHelper.senMail(email, subject, html);

        res.status(200).json({ 
            message: "Đã gửi mã OTP xác minh qua email. Mã có hiệu lực trong 5 phút." 
        });
    } catch (err) {
        console.error("Lỗi gửi OTP:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ khi gửi OTP.", error: err.message });
    }
};

// [POST] /auth/password/otp
exports.otpPassword = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const record = await ForgotPassword.findOne({ email, otp }).sort({ expireAt: -1 });
        if (!record) {
            return res.status(400).json({ message: "Mã OTP không hợp lệ." });
        }
        if (Date.now() > record.expireAt) {
            await ForgotPassword.deleteOne({ _id: record._id }); 
            return res.status(400).json({ message: "Mã OTP đã hết hạn." });
        }
        const user = await User.findOne({ email });
        if (!user) {
             return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        const resetToken = jwt.sign(
            { userId: user._id, purpose: 'password_reset' }, 
            JWT_SECRET, 
            { expiresIn: '15m' }
        );

        await ForgotPassword.deleteMany({ email }); 

        res.status(200).json({ 
            message: "Xác thực thành công. Bây giờ bạn có thể đặt lại mật khẩu.", 
            resetToken 
        });
    } catch (err) {
        console.error("Lỗi xác thực OTP:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ khi xác thực OTP.", error: err.message });
    }
};

// [POST] /auth/password/reset
exports.resetPassword = async (req, res) => {
    const authHeader = req.headers.authorization;
    const resetToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(" ")[1] : null;
    const { newPassword } = req.body; 
    if (!resetToken) {
        return res.status(401).json({ message: "Yêu cầu mã xác thực để đặt lại mật khẩu." });
    }
    
    if (!newPassword || newPassword.length < 6) { 
        return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
    }

    try {
        const decoded = jwt.verify(resetToken, JWT_SECRET);
        
        if (decoded.purpose !== 'password_reset') {
             return res.status(403).json({ message: "Token không hợp lệ cho mục đích đặt lại mật khẩu." });
        }
        
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({ message: "Mật khẩu mới không được trùng với mật khẩu cũ." });
        }

        const saltRounds = 10; 
        const newHashed = await bcrypt.hash(newPassword, saltRounds);
        user.password = newHashed;
        await user.save();

        res.status(200).json({ message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
    } catch (err) {
        console.error("Lỗi đặt lại mật khẩu:", err);
        res.status(401).json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại quy trình quên mật khẩu.", error: err.message });
    }
};