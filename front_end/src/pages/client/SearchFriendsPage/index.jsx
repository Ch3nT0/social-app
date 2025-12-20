import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchUsersByKeyword } from '../../../services/client/userService';
import UserCard from '../../../components/UserCard/UserCard'; 

const SearchFriendsPage = () => {
    const [searchParams] = useSearchParams();
    // Lấy query trực tiếp từ searchParams để React nhận diện thay đổi URL
    const query = searchParams.get('q') || ''; 
    
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const performSearch = useCallback(async (searchQuery) => {
        // Nếu query quá ngắn, reset kết quả và dừng lại
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const results = await searchUsersByKeyword(searchQuery);
            setSearchResults(results);
        } catch (err) {
            console.error("Lỗi tìm kiếm:", err);
            setError("Không thể tìm kiếm người dùng. Vui lòng thử lại.");
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, []); 

    const handleUserStatusUpdate = useCallback((userId, newStatus) => {
        setSearchResults(prevResults => prevResults.map(user => {
            if (user._id === userId) {
                return { ...user, friendshipStatus: newStatus };
            }
            return user;
        }));
    }, []);

    // ⭐️ SỬA TẠI ĐÂY: Theo dõi sự thay đổi của biến 'query'
    useEffect(() => {
        performSearch(query);
    }, [query, performSearch]);

    return (
        <div className="search-page pt-4 px-4 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
                Kết quả tìm kiếm cho: "<span className="text-blue-600">{query}</span>"
            </h2>
            
            {loading && (
                <div className="flex justify-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-blue-500 font-medium">Đang tìm kiếm...</span>
                </div>
            )}
            
            {error && <div className="text-center p-4 text-red-500 bg-red-100 rounded mb-4">{error}</div>}

            {!loading && !error && (
                <div className="space-y-4">
                    {searchResults.length > 0 ? (
                        searchResults.map(user => (
                            <UserCard 
                                key={user._id} 
                                requestId={user.requestId}
                                user={user} 
                                onUpdateStatus={handleUserStatusUpdate} 
                            />
                        ))
                    ) : query.trim().length >= 2 ? (
                        <div className="text-center p-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p className="text-xl mb-2">🔭 Không tìm thấy kết quả</p>
                            <p className="text-sm">Chúng tôi không tìm thấy ai khớp với từ khóa "{query}".</p>
                        </div>
                    ) : (
                        <div className="text-center p-12 text-gray-500 italic">
                            Vui lòng nhập từ khóa dài hơn 2 ký tự để tìm kiếm.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchFriendsPage;