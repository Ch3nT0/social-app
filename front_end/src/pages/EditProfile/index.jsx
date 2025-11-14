import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../helpers/cookie';
import { getUserProfile, updateUser } from '../../services/client/userService';
import { handleUpload } from '../../helpers/uploaFileToCloud';

const getCurrentUserId = () => getCookie('userId') || null;

const EditProfilePage = () => {
    const navigate = useNavigate();
    const currentUserId = getCurrentUserId();

    const [formData, setFormData] = useState({
        username: '',
        desc: '',
        city: '',
        from: '',
        // ⭐️ Đã loại bỏ 'password'
        profilePicture: '',
        coverPicture: '', // URL ảnh bìa hiện tại
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    // States cho File Preview
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);


    useEffect(() => {
        if (!currentUserId) {
            navigate('/login');
            return;
        }
        const fetchUserData = async () => {
            try {
                const userData = await getUserProfile(currentUserId);
                setFormData({
                    username: userData.username || '',
                    desc: userData.desc || '',
                    city: userData.city || '',
                    from: userData.from || '',
                    profilePicture: userData.profilePicture || '',
                    coverPicture: userData.coverPicture || ''
                });
                
            } catch (err) {
                console.error("Lỗi tải dữ liệu hồ sơ:", err);
                setError("Không thể tải dữ liệu hồ sơ để chỉnh sửa.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUserId, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            // Lưu đối tượng File vào formData
            setFormData(prev => ({ ...prev, [field]: file }));

            // Tạo preview URL
            const previewUrl = URL.createObjectURL(file);
            if (field === 'profilePicture') {
                setAvatarPreview(previewUrl);
            } else if (field === 'coverPicture') {
                setCoverPreview(previewUrl);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const dataToUpdate = {};
            
            // 1. Xử lý tải ảnh đại diện (profilePicture)
            if (formData.profilePicture instanceof File) {
                const imageUrl = await handleUpload(formData.profilePicture, 'image');
                dataToUpdate.profilePicture = imageUrl;
            } else if (formData.profilePicture) {
                 dataToUpdate.profilePicture = formData.profilePicture; // Giữ URL cũ
            } else {
                 dataToUpdate.profilePicture = ""; // Xóa ảnh nếu người dùng xóa nó (nếu có logic xóa)
            }
            
            // 2. Xử lý tải ảnh bìa (coverPicture)
             if (formData.coverPicture instanceof File) {
                const imageUrl = await handleUpload(formData.coverPicture, 'image');
                dataToUpdate.coverPicture = imageUrl;
            } else if (formData.coverPicture) {
                 dataToUpdate.coverPicture = formData.coverPicture; // Giữ URL cũ
            } else {
                 dataToUpdate.coverPicture = "";
            }
            
            // 3. Xử lý các trường văn bản
            dataToUpdate.username = formData.username;
            dataToUpdate.desc = formData.desc;
            dataToUpdate.city = formData.city;
            dataToUpdate.from = formData.from;

            // 4. Gọi API cập nhật (PUT /api/users/:id)
            const result = await updateUser(currentUserId, dataToUpdate);

            if (result && result.user) {
                alert("Cập nhật hồ sơ thành công!");
                navigate(`/profile/${currentUserId}`); 
            } else {
                setError(result.message || "Cập nhật thất bại.");
            }

        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            setError("Lỗi server hoặc lỗi tải ảnh lên.");
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return <div className="text-center p-8">Đang tải dữ liệu hồ sơ...</div>;
    }

    // Fallback URL cho ảnh hiện tại
    const currentAvatarUrl = avatarPreview || formData.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U";
    const currentCoverUrl = coverPreview || formData.coverPicture || "https://via.placeholder.com/1000x200/C0C0C0/FFFFFF?text=Cover";


    return (
        <div className="max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-2xl mt-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-3">Chỉnh sửa Hồ sơ</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Ảnh Đại diện */}
                <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Ảnh Đại diện</h3>
                    <div className="flex items-center space-x-6">
                        <img 
                            src={currentAvatarUrl}
                            alt="Avatar Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-blue-400"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tải ảnh mới</label>
                            <input 
                                type="file" 
                                name="profilePictureFile"
                                onChange={(e) => handleFileChange(e, 'profilePicture')}
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>
                </div>
                
                {/* 2. Ảnh Bìa */}
                <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Ảnh Bìa</h3>
                    <div className="flex flex-col items-center space-y-3">
                         <img 
                            src={currentCoverUrl}
                            alt="Cover Preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <input 
                            type="file" 
                            name="coverPictureFile"
                            onChange={(e) => handleFileChange(e, 'coverPicture')}
                            accept="image/*"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>


                {/* 3. Thông tin cơ bản */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-4 border-t">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                    </div>
                    <div>
                        <label htmlFor="desc" className="block text-sm font-medium text-gray-700">Mô tả bản thân</label>
                        <input type="text" id="desc" name="desc" value={formData.desc} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" maxLength="150" />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Sống tại</label>
                        <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                    </div>
                    <div>
                        <label htmlFor="from" className="block text-sm font-medium text-gray-700">Quê quán</label>
                        <input type="text" id="from" name="from" value={formData.from} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                    </div>
                </div>

                {/* ⭐️ ĐỔI MẬT KHẨU ĐÃ BỊ LOẠI BỎ */}

                {/* 4. Thông báo lỗi */}
                {error && (
                    <div className="p-3 text-sm font-medium text-red-700 bg-red-100 border border-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {/* 5. Nút Submit */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition duration-150 disabled:bg-blue-300"
                        disabled={submitting}
                    >
                        {submitting ? 'Đang lưu...' : 'Lưu Thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfilePage;