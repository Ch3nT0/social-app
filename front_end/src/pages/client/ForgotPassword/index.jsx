import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword } from '../../../services/client/authService';

const ForgotPassword = () => {
    // Luồng: 'email' -> 'otp' -> 'reset'
    const [step, setStep] = useState('email'); 
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState(''); // Lưu token từ bước OTP

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    // Bước 1: Gửi yêu cầu OTP
    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await forgotPassword({ email });
            setMessage(res.message);
            setStep('otp'); // Chuyển sang bước nhập OTP
        } catch (err) {
            setError(err.response?.data?.message || "Không thể gửi OTP.");
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Xác thực OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await verifyOtp({ email, otp });
            setResetToken(res.resetToken); // Lưu lại token để dùng cho bước reset
            setMessage(res.message);
            setStep('reset'); // Chuyển sang bước đặt mật khẩu mới
        } catch (err) {
            setError(err.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn.");
        } finally {
            setLoading(false);
        }
    };

    // Bước 3: Đặt lại mật khẩu
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await resetPassword({ newPassword }, resetToken);
            alert("Thành công: " + res.message);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi đặt lại mật khẩu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Quên mật khẩu?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 'email' && "Nhập email để nhận mã OTP khôi phục."}
                        {step === 'otp' && `Mã OTP đã được gửi đến ${email}`}
                        {step === 'reset' && "Thiết lập mật khẩu mới cho tài khoản của bạn."}
                    </p>
                </div>

                {/* Hiển thị Thông báo / Lỗi */}
                {error && <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg">{error}</div>}
                {message && !error && <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-lg">{message}</div>}

                {/* FORM BƯỚC 1: NHẬP EMAIL */}
                {step === 'email' && (
                    <form onSubmit={handleSendEmail} className="space-y-4">
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Địa chỉ Email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button disabled={loading} className="w-full py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                            {loading ? "Đang xử lý..." : "Gửi mã xác nhận"}
                        </button>
                    </form>
                )}

                {/* FORM BƯỚC 2: NHẬP OTP */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <input
                            type="text"
                            required
                            maxLength="6"
                            className="w-full px-4 py-3 text-center text-2xl tracking-[1rem] border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button disabled={loading} className="w-full py-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
                            {loading ? "Đang xác thực..." : "Xác thực mã OTP"}
                        </button>
                        <button type="button" onClick={() => setStep('email')} className="w-full text-sm text-gray-500 hover:underline">
                            Quay lại nhập email
                        </button>
                    </form>
                )}

                {/* FORM BƯỚC 3: RESET PASSWORD */}
                {step === 'reset' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button disabled={loading} className="w-full py-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 transition font-bold">
                            {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                        </button>
                    </form>
                )}

                <div className="text-center pt-4">
                    <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Quay về đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;