// src/pages/client/home.jsx

import React, { useState, useEffect } from 'react';
import Post from '../../../components/Post/Post'; 
import Share from '../../../components/Share/Share'; 
import { getTimelinePosts } from '../../../services/client/postService'; 
// Import helper và service cần thiết
import { getCookie } from '../../../helpers/cookie';
import { getUserProfile } from '../../../services/client/userService';

// Hàm helper để lấy ID người dùng từ cookie
const getUserId = () => {
    return getCookie('userId') || null; 
};

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // State mới lưu thông tin người dùng
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Lấy ID người dùng từ cookie
    const currentUserId = getUserId(); 

    // Fetch thông tin người dùng hiện tại (cho component Share)
    useEffect(() => {
        if (currentUserId) {
            const fetchCurrentUser = async () => {
                try {
                    const user = await getUserProfile(currentUserId);
                    if (user && user._id) {
                        setCurrentUser(user);
                    }
                } catch (err) {
                    console.error("Lỗi khi tải thông tin người dùng:", err);
                    // Không cần setError nếu chỉ lỗi avatar, nhưng cần đảm bảo user không null nếu cần thiết
                }
            };
            fetchCurrentUser();
        }
    }, [currentUserId]);


    // Fetch dòng thời gian
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const timelineData = await getTimelinePosts(currentUserId);
                
                if (Array.isArray(timelineData)) {
                    // Sắp xếp dữ liệu theo ngày giảm dần
                    setPosts(
                        timelineData.sort((p1, p2) => {
                            return new Date(p2.createdAt) - new Date(p1.createdAt);
                        })
                    );
                    setError(null);
                } else if (timelineData && timelineData.message) {
                    setError(`Lỗi từ Server: ${timelineData.message}`);
                    setPosts([]);
                }
                
            } catch (err) {
                console.error("Lỗi khi fetch timeline:", err);
                // Cần đảm bảo lỗi này được ném ra từ request.js
                setError("Không thể tải dòng thời gian. Vui lòng kiểm tra đăng nhập.");
            } finally {
                setLoading(false);
            }
        };

        if (currentUserId) { // Chỉ fetch nếu có ID người dùng (đã đăng nhập)
            fetchPosts();
        } else {
             setLoading(false);
             // Giữ setError cho trường hợp chưa đăng nhập, nhưng không cần thiết nếu dùng Protected Route
             // setError("Bạn cần đăng nhập để xem dòng thời gian.");
        }
    }, [currentUserId]);


    // Hàm Callback: Xử lý bài đăng mới sau khi tạo thành công từ component Share
    const handleNewPostCreated = (newPost) => {
        // Thêm bài đăng mới vào đầu danh sách hiện tại (optimistic update)
        setPosts((prevPosts) => [newPost, ...prevPosts]);
    };


    // Dữ liệu truyền xuống Share
    const userAvatar = currentUser?.profilePicture;
    const userName = currentUser?.username;


    return (
        <div className="home-page">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 hidden">Dòng thời gian</h1> 

            {/* Chỉ hiển thị Share nếu đã có thông tin người dùng */}
            {currentUserId && (
                <Share 
                    onPostCreated={handleNewPostCreated} // Truyền callback
                    userAvatar={userAvatar}             // Truyền avatar
                    userName={userName}                 // Truyền username
                /> 
            )}
            
            <div className="my-6 border-b border-gray-300"></div>

            {loading && <div className="text-center p-4 text-blue-500">Đang tải bài đăng...</div>}
            {error && <div className="text-center p-4 text-red-500 bg-red-100 rounded">{error}</div>}

            <div className="space-y-6">
                {!loading && posts.length === 0 && !error && (
                    <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-md">
                        Chưa có bài đăng nào trong dòng thời gian của bạn.
                    </div>
                )}
                
                {posts.map((p) => (
                    // post.userId là đối tượng (nếu BE đã populate)
                    <Post key={p._id} post={p} /> 
                ))}
            </div>
        </div>
    );
};

export default Home;