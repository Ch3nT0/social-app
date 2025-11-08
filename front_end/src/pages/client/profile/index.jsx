import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import Post from '../../../components/Post/Post';
import Share from '../../../components/Share/Share';
import { getUserProfile } from '../../../services/client/userService'; 
import { getUserPosts } from '../../../services/client/postService'; 

const Profile = () => {
    const { id: profileId } = useParams(); 
    
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const CURRENT_USER_ID = "60c72b2f9a7d3c0015f624e5"; 
    
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (!profileId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const userData = await getUserProfile(profileId);
                setUser(userData);

                if (userData && Array.isArray(userData.followers)) {
                    setIsFollowing(userData.followers.includes(CURRENT_USER_ID));
                }
                
                const userPosts = await getUserPosts(profileId); 

                if (Array.isArray(userPosts)) {
                    setPosts(userPosts.sort((p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt)));
                } else {
                    setPosts([]);
                }
                
            } catch (err) {
                console.error("Lỗi khi tải trang Profile:", err);
                if (err.response && err.response.status === 404) {
                    setError("Người dùng này không tồn tại.");
                } else {
                    setError("Không thể tải hồ sơ người dùng hoặc bài đăng.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [profileId, CURRENT_USER_ID]);

    const handleFollow = () => {
        try {
            // Logic gọi service follow/unfollow
            
            setIsFollowing(!isFollowing); 
            
            setUser(prev => ({
                ...prev,
                followers: isFollowing 
                    ? prev.followers.filter(id => id !== CURRENT_USER_ID)
                    : [...prev.followers, CURRENT_USER_ID]
            }));
            
        } catch (error) {
            console.error("Lỗi hành động follow:", error);
        }
    };

    if (loading) {
        return <div className="text-center p-8 text-blue-500">Đang tải hồ sơ...</div>;
    }

    if (error || !user) {
        return <div className="text-center p-8 text-red-500 bg-red-100 rounded">Không tìm thấy người dùng hoặc có lỗi xảy ra.</div>;
    }


    return (
        <div className="profile-page">
            
            <div className="bg-white rounded-xl shadow-xl mb-6">
                
                <div className="relative h-64 bg-gray-300 rounded-t-xl">
                    <img 
                        src={user.coverPicture || "https://via.placeholder.com/1000x250/C0C0C0/FFFFFF?text=Cover+Picture"} 
                        alt="Cover"
                        className="w-full h-full object-cover rounded-t-xl"
                    />
                    
                    <img 
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                                   w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl z-10"
                        src={user.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"}
                        alt="Profile"
                    />
                </div>
                
                <div className="flex flex-col items-center pt-16 px-6 pb-6"> 
                    <h1 className="text-3xl font-bold mt-3 text-gray-900">{user.username}</h1>
                    <p className="text-gray-600 mt-1">{user.desc || "Chưa có mô tả"}</p>
                    
                    <div className="mt-4 flex space-x-3">
                        {profileId !== CURRENT_USER_ID ? (
                            <button 
                                onClick={handleFollow}
                                className={`px-4 py-2 rounded-full font-semibold transition ${
                                    isFollowing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {isFollowing ? 'Hủy Theo dõi' : 'Theo dõi'}
                            </button>
                        ) : (
                            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full font-semibold hover:bg-gray-300 transition">
                                Chỉnh sửa Hồ sơ
                            </button>
                        )}
                        <button className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-600 transition">
                            Nhắn tin
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
                
                <div className="w-full lg:w-1/3 space-y-4">
                    <div className="bg-white rounded-xl shadow-lg p-5">
                        <h3 className="text-xl font-bold mb-3 border-b pb-2">Thông tin</h3>
                        <p className="text-gray-700">📍 Sống tại: **{user.city || "Chưa rõ"}**</p>
                        <p className="text-gray-700">🏡 Đến từ: **{user.from || "Chưa rõ"}**</p>
                        <p className="text-gray-700">👥 **{user.friends.length}** Bạn bè</p>
                        <p className="text-gray-700">👀 **{user.followers.length}** Người theo dõi</p>
                    </div>
                </div>

                <div className="w-full lg:w-2/3 space-y-6">
                    {profileId === CURRENT_USER_ID && <Share />} 

                    <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Bài đăng</h3>
                    
                    {posts.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-md">
                            Người dùng này chưa có bài đăng nào.
                        </div>
                    ) : (
                        posts.map((p) => <Post key={p._id} post={p} />)
                    )}
                </div>
            </div>
        </div>
    );
};


export default Profile;