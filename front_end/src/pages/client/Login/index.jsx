import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { loginUser } from '../../../services/client/authService'; 
import { setCookie } from '../../../helpers/cookie';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError("Vui lòng nhập Email và Mật khẩu.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const loginData = { email, password };

            const result = await loginUser(loginData); 
            
            if (result && result.accessToken) {

                // Lưu Token vào cookie (Thời hạn 7 ngày)
                setCookie('token', result.accessToken, 7);
                
                // ⭐️ BƯỚC FIX: LƯU USER ID VÀO COOKIE
                if (result.user && result.user._id) {
                    // Giả định backend trả về { user: { _id: '...' } }
                    setCookie('userId', result.user._id, 7); 
                } else if (result.userId) {
                    // Trường hợp backend trả về userId trực tiếp
                    setCookie('userId', result.userId, 7); 
                }
                
                alert("Đăng nhập thành công! Chuyển hướng đến Trang chủ.");
                navigate('/'); 
                
            } else {
                setError(result.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
            }

        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            setError("Lỗi kết nối server. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-900">
                    Đăng nhập SocialApp
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
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
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Hiển thị lỗi */}
                    {error && (
                        <div className="p-3 text-sm font-medium text-red-700 bg-red-100 border border-red-400 rounded-lg">
                            {error}
                        </div>
                    )}
                    
                    {/* Nút Đăng nhập */}
                    <button
                        type="submit"
                        className="w-full py-2.5 mt-4 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="animate-spin mr-2">🔄</span>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>

                {/* Liên kết phụ */}
                <div className="text-sm text-center">
                    <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                        Quên mật khẩu?
                    </Link>
                </div>
                <div className="text-sm text-center mt-2">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;