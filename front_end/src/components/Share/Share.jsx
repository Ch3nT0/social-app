import React, { useState } from 'react';
import { createPost } from '../../services/client/postService'; 
import { getCookie } from '../../helpers/cookie';
import { handleUpload } from '../../helpers/uploaFileToCloud';

const getUserId = () => {
    return getCookie('userId') || null; 
};

const Share = ({ onPostCreated, userAvatar, userName }) => {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const currentUserId = getUserId(); 
    
    const displayAvatar = userAvatar || "https://via.placeholder.com/150/FF0000/FFFFFF?text=U"; 
    
    // Tạo preview URL (sẽ được giải phóng khi component unmount)
    const filePreviewUrl = file ? URL.createObjectURL(file) : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content && !file) return;
        
        if (!currentUserId) {
            alert("Bạn cần đăng nhập để tạo bài đăng.");
            return;
        }

        setIsUploading(true);
        let postData = {};
        let uploadedImageUrl = ""; // Biến lưu URL sau khi tải lên

        try {
            // 1. TẢI FILE LÊN CLOUDINARY (nếu có)
            if (file) {
                // Determine file type for Cloudinary endpoint (image or video)
                const fileType = file.type.startsWith('video/') ? "video" : "image";
                
                // Gọi hàm handleUpload
                uploadedImageUrl = await handleUpload(file, fileType); 

                if (!uploadedImageUrl) {
                    // Nếu handleUpload không ném lỗi nhưng trả về null (rất hiếm nếu hàm throw lỗi)
                    throw new Error("Không nhận được URL từ dịch vụ lưu trữ.");
                }
            }
            
            // 2. TẠO DỮ LIỆU BÀI ĐĂNG VỚI URL ĐÃ TẢI LÊN
            postData = {
                userId: currentUserId, 
                content: content,
                image: uploadedImageUrl || "" // Gán URL đã tải lên hoặc chuỗi rỗng
            };
            
            console.log("Creating post with data:", postData);
            
            // 3. GỌI API BACKEND
            const result = await createPost(postData);
            
            if (result && result.post) {
                alert("Đăng bài thành công!");
                
                // Thêm URL ảnh đã tải lên vào bài đăng trả về nếu cần thiết
                const finalPost = { ...result.post, image: uploadedImageUrl || "" }; 

                if (onPostCreated) {
                    // Truyền bài đăng đã tạo để cập nhật Feed
                    onPostCreated(finalPost); 
                }
                
                // Reset form
                setContent('');
                setFile(null);
            } else {
                 alert("Lỗi đăng bài: " + (result.message || "Không rõ lỗi."));
            }

        } catch (error) {
            // Lỗi tải lên hoặc lỗi API
            const errorMessage = error.message.includes("Tải file thất bại") 
                                ? error.message 
                                : "Có lỗi xảy ra khi tạo bài đăng.";
            console.error("Lỗi khi tạo bài đăng:", error);
            alert(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200">
            
            <div className="flex items-start space-x-3 border-b pb-4 mb-4">
                <img 
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    src={displayAvatar}
                    alt={userName || "User"}
                />
                
                <form onSubmit={handleSubmit} className="flex-grow"> 
                    <textarea
                        placeholder={`Bạn đang nghĩ gì, ${userName || 'Bạn'}?`}
                        className="w-full resize-none p-2 text-gray-700 focus:outline-none placeholder-gray-500 text-lg"
                        rows="3"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {file && (
                        <div className="relative mt-2 p-2 border rounded-lg bg-gray-50">
                            <span className="text-sm text-gray-600 truncate block">Đã chọn file: {file.name}</span>
                            <button 
                                type="button" 
                                onClick={() => setFile(null)} 
                                className="absolute top-1 right-1 text-red-500 bg-white rounded-full p-1 hover:bg-red-100 transition"
                            >
                                X
                            </button>
                            {file.type.startsWith('image/') && (
                                <img src={filePreviewUrl} alt="Preview" className="max-h-20 w-auto mt-2 rounded" />
                            )}
                            {/* Tùy chọn: Thêm preview cho video nếu cần */}
                        </div>
                    )}
                </form>
            </div>
            
            <div className="flex justify-between items-center pt-2">
                
                <div className="flex space-x-4">
                    
                    <label htmlFor="file-input" className="flex items-center space-x-1 cursor-pointer text-green-500 hover:text-green-600 transition duration-150">
                        <span>🖼️ Ảnh/Video</span> 
                        <input 
                            type="file" 
                            id="file-input"
                            name="file"
                            className="hidden" 
                            accept=".png,.jpeg,.jpg,.mp4"
                            onChange={handleFileChange}
                        />
                    </label>

                </div>
                
                <button 
                    type="submit"
                    onClick={handleSubmit} 
                    className={`px-6 py-2 rounded-full text-white font-semibold transition duration-200 flex items-center ${
                                (content || file) && !isUploading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                    disabled={!content && !file || isUploading}
                >
                    {isUploading ? (
                         <span className="animate-spin mr-2">🔄</span> 
                    ) : (
                        'Đăng'
                    )}
                </button>
            </div>
        </div>
    );
};

export default Share;