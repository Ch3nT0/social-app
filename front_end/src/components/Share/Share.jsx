import React, { useState } from 'react';
import { createPost } from '../../services/client/postService'; 
import { getCookie } from '../../helpers/cookie';
import { handleUpload } from '../../helpers/uploaFileToCloud'; 
import '@google/model-viewer';

const getUserId = () => getCookie('userId') || null;

const Share = ({ onPostCreated, userAvatar, userName }) => {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]); // Chuyển thành mảng files
    const [isUploading, setIsUploading] = useState(false);
    
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
        let uploadedUrls = [];
        let model3dUrl = "";

        try {
            // Duyệt qua tất cả các file đã chọn để upload
            for (const file of files) {
                const is3D = file.name.endsWith('.glb');
                const fileType = is3D ? "video" : (file.type.startsWith('video/') ? "video" : "image");
                
                const url = await handleUpload(file, fileType);
                
                if (is3D) {
                    model3dUrl = url; // Lưu URL model 3D (thường chỉ 1 cái mỗi post)
                } else {
                    uploadedUrls.push(url); // Lưu vào danh sách ảnh/video
                }
            }
            
            const postData = {
                userId: currentUserId, 
                content: content,
                // Gửi mảng các URL ảnh (hoặc chuỗi nếu backend bạn chưa sửa thành mảng)
                image: uploadedUrls, 
                model3d: model3dUrl
            };
            
            const result = await createPost(postData);
            
            if (result && result.post) {
                alert("Đăng bài thành công!");
                
                const populatedUser = {
                    _id: currentUserId,
                    username: userName,
                    profilePicture: userAvatar
                };
                
                const finalPost = { 
                    ...result.post, 
                    userId: populatedUser,
                    // Đảm bảo dữ liệu truyền ngược lại cho Feed khớp với những gì Post.jsx mong đợi
                    image: uploadedUrls, 
                    model3d: model3dUrl
                }; 

                if (onPostCreated) onPostCreated(finalPost);
                
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
        // Hợp nhất với danh sách đã chọn trước đó hoặc thay thế mới
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-start space-x-3 border-b pb-4 mb-4">
                <img className="w-12 h-12 rounded-full object-cover flex-shrink-0" src={displayAvatar} alt={userName} />
                
                <form onSubmit={handleSubmit} className="flex-grow"> 
                    <textarea 
                        placeholder={`Bạn đang nghĩ gì, ${userName || 'Bạn'}?`} 
                        className="w-full resize-none p-2 text-gray-700 focus:outline-none placeholder-gray-500 text-lg" 
                        rows="3" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                    />

                    {/* HIỂN THỊ DANH SÁCH FILE PREVIEW */}
                    {files.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {files.map((file, index) => {
                                const is3D = file.name.endsWith('.glb');
                                const url = URL.createObjectURL(file);
                                return (
                                    <div key={index} className="relative aspect-square border rounded-lg bg-gray-50 overflow-hidden group">
                                        <button 
                                            type="button" 
                                            onClick={() => removeFile(index)} 
                                            className="absolute top-1 right-1 z-20 text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                        >
                                            ×
                                        </button>
                                        
                                        {is3D ? (
                                            <model-viewer src={url} style={{width: '100%', height: '100%'}} auto-rotate></model-viewer>
                                        ) : file.type.startsWith('image/') ? (
                                            <img src={url} alt="preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-[10px] text-gray-500">Video</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </form>
            </div>
            
            <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-4">
                    <label htmlFor="file-input" className="flex items-center space-x-1 cursor-pointer text-green-500 hover:text-green-600 transition duration-150 font-medium">
                        <span className="text-xl">🖼️</span>
                        <span className="text-sm">Ảnh/Video/3D</span> 
                        <input 
                            type="file" 
                            id="file-input" 
                            className="hidden" 
                            multiple // QUAN TRỌNG: Cho phép chọn nhiều file
                            accept=".png,.jpeg,.jpg,.mp4,.glb" 
                            onChange={handleFileChange} 
                        />
                    </label>
                </div>
                
                <button 
                    type="submit" 
                    onClick={handleSubmit} 
                    className={`px-6 py-2 rounded-full text-white font-semibold transition duration-200 ${
                        (content || files.length > 0) && !isUploading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
                    }`} 
                    disabled={(!content && files.length === 0) || isUploading}
                >
                    {isUploading ? (<span className="animate-spin mr-2">🔄</span>) : ('Đăng')}
                </button>
            </div>
        </div>
    );
};

export default Share;