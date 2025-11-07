import React, { useState, useEffect } from 'react';
import Post from '../../../components/Post/Post'; 
import Share from '../../../components/Share/Share'; 
import { getTimelinePosts } from '../../../services/client/postService'; 


const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const CURRENT_USER_ID = "690dbb1325f4ae5c4e1c798e"; 

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                console.log("Fetching timeline posts for CURRENT_USER_ID:", CURRENT_USER_ID);
                const timelineData = await getTimelinePosts(CURRENT_USER_ID);
                
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
                setError("Không thể tải dòng thời gian. Vui lòng kiểm tra đăng nhập.");
            } finally {
                setLoading(false);
            }
        };

        if (CURRENT_USER_ID) {
            fetchPosts();
        } else {
             setLoading(false);
             setError("Bạn cần đăng nhập để xem dòng thời gian.");
        }
    }, [CURRENT_USER_ID]);


    return (
        <div className="home-page">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 hidden">Dòng thời gian</h1> 

            <Share /> 
            
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
                    <Post key={p._id} post={p} />
                ))}
            </div>
        </div>
    );
};

export default Home;