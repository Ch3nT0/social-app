import React, { useState } from 'react';
// import { Image, Video, Tag, Smile } from 'lucide-react'; // Dùng icons

const Share = () => {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    
    // Giả định User ID và Profile Picture
    const CURRENT_USER_AVATAR = "https://via.placeholder.com/150/FF0000/FFFFFF?text=A"; 

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log("Nội dung đăng:", content);
        console.log("File đính kèm:", file);

        alert("Logic đăng bài sẽ được thực hiện tại đây!");
    };
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200">
            
            {/* Phần nhập liệu chính */}
            <div className="flex items-start space-x-3 border-b pb-4 mb-4">
                <img 
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    src={CURRENT_USER_AVATAR}
                    alt="Avatar"
                />
                
                <form onSubmit={handleSubmit} className="flex-grow">
                    <textarea
                        placeholder="Bạn đang nghĩ gì thế?"
                        className="w-full resize-none p-2 text-gray-700 focus:outline-none placeholder-gray-500 text-lg"
                        rows="3"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />

                    {/* Hiển thị ảnh/video đã chọn (Preview) */}
                    {file && (
                        <div className="relative mt-2 p-2 border rounded-lg bg-gray-50">
                            {/* Tùy chọn: Dùng URL.createObjectURL(file) để tạo preview thực tế */}
                            <span className="text-sm text-gray-600 truncate block">Đã chọn file: {file.name}</span>
                            <button 
                                type="button" 
                                onClick={() => setFile(null)} 
                                className="absolute top-1 right-1 text-red-500 bg-white rounded-full p-1 hover:bg-red-100 transition"
                            >
                                X
                            </button>
                        </div>
                    )}
                </form>
            </div>
            
            {/* Các tùy chọn đính kèm và Nút Đăng */}
            <form onSubmit={handleSubmit} className="flex justify-between items-center pt-2">
                
                {/* Các tùy chọn đính kèm */}
                <div className="flex space-x-4">
                    
                    {/* Tùy chọn Ảnh/Video */}
                    <label htmlFor="file" className="flex items-center space-x-1 cursor-pointer text-green-500 hover:text-green-600 transition duration-150">
                        {/* Thay bằng icon Image */}
                        <span>🖼️ Ảnh/Video</span> 
                        <input 
                            type="file" 
                            id="file" 
                            name="file"
                            className="hidden" 
                            accept=".png,.jpeg,.jpg,.mp4"
                            onChange={handleFileChange}
                        />
                    </label>

                    {/* Tùy chọn Gắn thẻ bạn bè */}
                    <button type="button" className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition duration-150">
                        {/* Thay bằng icon Tag */}
                        <span>🏷️ Gắn thẻ</span>
                    </button>
                    
                    {/* Tùy chọn Cảm xúc/Hoạt động */}
                    <button type="button" className="flex items-center space-x-1 text-yellow-500 hover:text-yellow-600 transition duration-150 hidden sm:flex">
                        {/* Thay bằng icon Smile */}
                        <span>😊 Cảm xúc</span>
                    </button>
                </div>
                
                {/* Nút Đăng */}
                <button 
                    type="submit"
                    className={`px-6 py-2 rounded-full text-white font-semibold transition duration-200 
                                ${content || file ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                    disabled={!content && !file} // Vô hiệu hóa nếu không có nội dung/file
                >
                    Đăng
                </button>
            </form>
        </div>
    );
};

export default Share;