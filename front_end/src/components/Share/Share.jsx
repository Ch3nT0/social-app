import React, { useState } from 'react';
import { createPost } from '../../services/client/postService'; 
import { getCookie } from '../../helpers/cookie';
import { handleUpload } from '../../helpers/uploaFileToCloud'; 
import '@google/model-viewer';

const getUserId = () => getCookie('userId') || null;

const Share = ({ onPostCreated, userAvatar, userName }) => {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]); 
    const [isUploading, setIsUploading] = useState(false);
    const [visibility, setVisibility] = useState('public');
    const currentUserId = getUserId(); 
    const displayAvatar = userAvatar || "https://via.placeholder.com/150/FF0000/FFFFFF?text=U"; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content && files.length === 0) return;
        if (!currentUserId) {
            alert("Bạn cần đăng nhập để tạo bài đăng.");
            return;
        }

        setIsUploading(true);
        let imageUrls = [];
        let videoUrl = ""; // Backend chỉ nhận 1 chuỗi video
        let model3dUrl = "";

        try {
            // Duyệt qua tất cả các file đã chọn để upload
            for (const file of files) {
                const is3D = file.name.endsWith('.glb');
                const isVideo = file.type.startsWith('video/');
                
                // Xác định type cho hàm handleUpload của bạn
                const uploadType = is3D ? "3d" : (isVideo ? "video" : "image");
                
                const url = await handleUpload(file, uploadType);
                
                if (is3D) {
                    model3dUrl = url;
                } else if (isVideo) {
                    videoUrl = url; // Lấy video cuối cùng nếu user chọn nhiều video
                } else {
                    imageUrls.push(url);
                }
            }
            
            const postData = {
                userId: currentUserId, 
                content: content,
                image: imageUrls, 
                video: videoUrl,
                model3d: model3dUrl,
                visibility: visibility
            };
            
            const result = await createPost(postData);
            
            if (result && result.post) {
                alert("Đăng bài thành công!");
                
                const populatedUser = {
                    _id: currentUserId,
                    username: userName,
                    profilePicture: userAvatar
                };
                
                // Trộn dữ liệu để hiển thị ngay lập tức lên Feed (Optimistic UI)
                const finalPost = { 
                    ...result.post, 
                    userId: populatedUser
                }; 

                if (onPostCreated) onPostCreated(finalPost);
                
                // Reset form
                setContent('');
                setFiles([]);
            }
        } catch (error) {
            console.error("Lỗi khi tạo bài đăng:", error);
            alert("Có lỗi xảy ra khi tạo bài đăng.");
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-start space-x-3 border-b pb-4 mb-4">
                <img className="w-12 h-12 rounded-full object-cover flex-shrink-0" src={displayAvatar} alt={userName} />
                
                <div className="flex-grow"> 
                    <textarea 
                        placeholder={`Bạn đang nghĩ gì, ${userName || 'Bạn'}?`} 
                        className="w-full resize-none p-2 text-gray-700 focus:outline-none placeholder-gray-500 text-lg" 
                        rows="3" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                    />

                    {/* PREVIEW FILES */}
                    {files.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {files.map((file, index) => {
                                const is3D = file.name.endsWith('.glb');
                                const isVideo = file.type.startsWith('video/');
                                const url = URL.createObjectURL(file);
                                return (
                                    <div key={index} className="relative aspect-square border rounded-lg bg-gray-900 overflow-hidden group">
                                        <button 
                                            type="button" 
                                            onClick={() => removeFile(index)} 
                                            className="absolute top-1 right-1 z-20 text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                                        >
                                            ×
                                        </button>
                                        
                                        {is3D ? (
                                            <model-viewer src={url} style={{width: '100%', height: '100%'}} auto-rotate></model-viewer>
                                        ) : isVideo ? (
                                            <video src={url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={url} alt="preview" className="w-full h-full object-cover" />
                                        )}
                                        
                                        {/* Overlay icon cho video/3d */}
                                        {(isVideo || is3D) && (
                                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">
                                                {is3D ? "3D" : "VIDEO"}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-4">
                    <label htmlFor="file-input" className="flex items-center space-x-1 cursor-pointer text-green-500 hover:text-green-600 transition duration-150 font-medium">
                        <span className="text-xl">🖼️</span>
                        <span className="text-sm font-bold">Ảnh/Video/3D</span> 
                        <input 
                            type="file" 
                            id="file-input" 
                            className="hidden" 
                            multiple 
                            accept="image/*,video/*,.glb" 
                            onChange={handleFileChange} 
                        />
                    </label>
                    {/* SELECT CHỌN QUYỀN RIÊNG TƯ */}
                    <div className="relative inline-block">
                        <select 
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            className="bg-gray-100 border-none text-gray-600 text-sm rounded-lg focus:ring-blue-500 block w-full p-1.5 font-medium cursor-pointer hover:bg-gray-200 transition"
                        >
                            <option value="public">🌎 Công khai</option>
                            <option value="friends">👥 Bạn bè</option>
                            <option value="private">🔒 Chỉ mình tôi</option>
                        </select>
                    </div>
                </div>
                
                <button 
                    onClick={handleSubmit} 
                    className={`px-6 py-2 rounded-full text-white font-bold transition duration-200 flex items-center ${
                        (content || files.length > 0) && !isUploading ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : 'bg-blue-300 cursor-not-allowed'
                    }`} 
                    disabled={(!content && files.length === 0) || isUploading}
                >
                    {isUploading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang tải...
                        </>
                    ) : 'Đăng'}
                </button>
            </div>
        </div>
    );
};

export default Share;