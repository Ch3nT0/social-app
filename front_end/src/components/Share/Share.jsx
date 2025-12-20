import React, { useState } from 'react';
import { createPost } from '../../services/client/postService'; 
import { getCookie } from '../../helpers/cookie';
import { handleUpload } from '../../helpers/uploaFileToCloud'; 
// Đảm bảo import model-viewer để dùng cho phần preview
import '@google/model-viewer';

const getUserId = () => getCookie('userId') || null;

const Share = ({ onPostCreated, userAvatar, userName }) => {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const currentUserId = getUserId(); 
    const displayAvatar = userAvatar || "https://via.placeholder.com/150/FF0000/FFFFFF?text=U"; 
    
    // Tạo URL để xem trước (Preview)
    const filePreviewUrl = file ? URL.createObjectURL(file) : null;
    const is3DModel = file?.name.endsWith('.glb');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content && !file) return;
        if (!currentUserId) {
            alert("Bạn cần đăng nhập để tạo bài đăng.");
            return;
        }

        setIsUploading(true);
        let uploadedFileUrl = ""; 

        try {
            if (file) {
                // Xác định loại file để Cloudinary xử lý đúng
                // .glb thường được xử lý như "raw" hoặc "video" (tùy config backend)
                // Ở đây ta giả định handleUpload nhận file trực tiếp
                const fileType = is3DModel ? "video" : (file.type.startsWith('video/') ? "video" : "image");
                uploadedFileUrl = await handleUpload(file, fileType); 

                if (!uploadedFileUrl) {
                    throw new Error("Không nhận được URL từ dịch vụ lưu trữ.");
                }
            }
            
            const postData = {
                userId: currentUserId, 
                content: content,
                // Nếu là 3D thì gán vào model3d, nếu là ảnh thì gán vào image
                image: !is3DModel ? (uploadedFileUrl || "") : "",
                model3d: is3DModel ? (uploadedFileUrl || "") : ""
            };
            
            const result = await createPost(postData);
            
            if (result && result.post) {
                alert("Đăng bài thành công!");
                
                const populatedUser = {
                    _id: currentUserId,
                    username: userName,
                    profilePicture: userAvatar
                };
                
                // Đồng bộ dữ liệu để Post.jsx hiển thị ngay lập tức
                const finalPost = { 
                    ...result.post, 
                    userId: populatedUser,
                    image: postData.image,
                    model3d: postData.model3d
                }; 

                if (onPostCreated) {
                    onPostCreated(finalPost);
                }
                
                // Reset form
                setContent('');
                setFile(null);
            } else {
                 alert("Lỗi đăng bài: " + (result.message || "Không rõ lỗi."));
            }

        } catch (error) {
            console.error("Lỗi khi tạo bài đăng:", error);
            alert(error.message || "Có lỗi xảy ra khi tạo bài đăng.");
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-start space-x-3 border-b pb-4 mb-4">
                <img className="w-12 h-12 rounded-full object-cover flex-shrink-0" src={displayAvatar} alt={userName || "User"} />
                
                <form onSubmit={handleSubmit} className="flex-grow"> 
                    <textarea 
                        placeholder={`Bạn đang nghĩ gì, ${userName || 'Bạn'}?`} 
                        className="w-full resize-none p-2 text-gray-700 focus:outline-none placeholder-gray-500 text-lg" 
                        rows="3" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                    />

                    {/* PHẦN PREVIEW FILE */}
                    {file && (
                        <div className="relative mt-2 p-2 border rounded-lg bg-gray-50">
                            <button type="button" onClick={() => setFile(null)} className="absolute top-1 right-1 z-10 text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition">×</button>
                            
                            {/* Nếu là file 3D */}
                            {is3DModel ? (
                                <div className="h-48 w-full bg-gray-200 rounded">
                                    <model-viewer
                                        src={filePreviewUrl}
                                        camera-controls
                                        auto-rotate
                                        style={{ width: '100%', height: '100%' }}
                                    ></model-viewer>
                                </div>
                            ) : (
                                /* Nếu là ảnh */
                                file.type.startsWith('image/') && (
                                    <img src={filePreviewUrl} alt="Preview" className="max-h-40 w-auto rounded" />
                                )
                            )}
                            <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                        </div>
                    )}
                </form>
            </div>
            
            <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-4">
                    {/* Chấp nhận thêm .glb */}
                    <label htmlFor="file-input" className="flex items-center space-x-1 cursor-pointer text-green-500 hover:text-green-600 transition duration-150 font-medium">
                        <span>🖼️ Ảnh/Video/3D</span> 
                        <input 
                            type="file" 
                            id="file-input" 
                            className="hidden" 
                            accept=".png,.jpeg,.jpg,.mp4,.glb" 
                            onChange={handleFileChange} 
                        />
                    </label>
                </div>
                
                <button 
                    type="submit" 
                    onClick={handleSubmit} 
                    className={`px-6 py-2 rounded-full text-white font-semibold transition duration-200 flex items-center ${
                        (content || file) && !isUploading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
                    }`} 
                    disabled={(!content && !file) || isUploading}
                >
                    {isUploading ? (<span className="animate-spin mr-2 text-sm">🔄</span>) : ('Đăng')}
                </button>
            </div>
        </div>
    );
};

export default Share;