import React, { useState, useEffect } from 'react';
import Post from '../../../components/Post/Post'; 
import Share from '../../../components/Share/Share'; 
import { getTimelinePosts } from '../../../services/client/postService'; 
import { getCookie } from '../../../helpers/cookie';
import { getUserProfile } from '../../../services/client/userService';

const getUserId = () => {
    return getCookie('userId') || null; 
};

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const currentUserId = getUserId(); 

    // Lấy thông tin cá nhân (Chỉ chạy nếu đã đăng nhập)
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
                }
            };
            fetchCurrentUser();
        }
    }, [currentUserId]);


    // Fetch dòng thời gian (Chạy ngay cả khi không có currentUserId)
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                // Truyền currentUserId (có thể null), 
                // service sẽ tự gọi endpoint /timeline nếu không có ID
                const timelineData = await getTimelinePosts(currentUserId);
                
                if (Array.isArray(timelineData)) {
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
                setError("Không thể tải bài viết. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        // Bỏ điều kiện if(currentUserId) ở đây để khách vẫn fetch được
        fetchPosts(); 
        
    }, [currentUserId]);

    const handleNewPostCreated = (newPost) => {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
    };

    const userAvatar = currentUser?.profilePicture;
    const userName = currentUser?.username;

    return (
        <div className="home-page">
            {/* Form đăng bài: Chỉ hiện khi đã đăng nhập */}
            {currentUserId && (
                <Share 
                    onPostCreated={handleNewPostCreated} 
                    userAvatar={userAvatar} 
                    userName={userName} 
                /> 
            )}
            
            {/* Đường kẻ ngăn cách: Chỉ hiện khi có form đăng bài */}
            {currentUserId && <div className="my-6 border-b border-gray-300"></div>}

            {loading && <div className="text-center p-4 text-blue-500">Đang tải bài đăng...</div>}
            {error && <div className="text-center p-4 text-red-500 bg-red-100 rounded">{error}</div>}

            <div className="space-y-6">
                {!loading && posts.length === 0 && !error && (
                    <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-md">
                        Chưa có bài đăng nào để hiển thị.
                    </div>
                )}
                
                {/* Danh sách bài viết (Hiển thị cho cả khách và thành viên) */}
                {posts.map((p) => (
                    <Post key={p._id} post={p} /> 
                ))}
            </div>
        </div>
    );
};

export default Home;