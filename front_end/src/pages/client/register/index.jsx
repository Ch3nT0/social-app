
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../../services/client/authService'; 

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!username || !email || !password || !confirmPassword) {
            setError("Vui lòng điền đầy đủ tất cả các trường.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }
        
        if (password.length < 6) {
             setError("Mật khẩu phải có ít nhất 6 ký tự.");
             return;
        }

        setLoading(true);
        setError(null);

        try {
            const registerData = { username, email, password };
            
            // ⭐️ Gọi API đăng ký
            const result = await registerUser(registerData); // Giả định service này gọi POST /auth/register
            
            if (result && result.user) {
                // Đăng ký thành công
                alert("Đăng ký thành công! Vui lòng đăng nhập.");
                
                // Chuyển hướng đến trang đăng nhập
                navigate('/login'); 
            } else {
                // Lỗi từ server (ví dụ: Email đã được sử dụng)
                setError(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
            }

        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            // Lỗi mạng hoặc lỗi server 500
            setError("Lỗi kết nối server. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-900">
                    Đăng ký Tài khoản Mới
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    
                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Tên đăng nhập
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tối thiểu 3 ký tự"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="vd: tenban@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    
                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tối thiểu 6 ký tự"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Hiển thị lỗi */}
                    {error && (
                        <div className="p-3 text-sm font-medium text-red-700 bg-red-100 border border-red-400 rounded-lg">
                            {error}
                        </div>
                    )}
                    
                    {/* Nút Đăng ký */}
                    <button
                        type="submit"
                        className="w-full py-2.5 mt-4 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition duration-150 flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="animate-spin mr-2">🔄</span>
                        ) : (
                            'Đăng ký'
                        )}
                    </button>
                </form>

                {/* Liên kết phụ */}
                <div className="text-sm text-center mt-2">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;