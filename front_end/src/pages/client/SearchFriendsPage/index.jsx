import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchUsersByKeyword } from '../../../services/client/userService';
import UserCard from '../../../components/UserCard/UserCard';


const SearchFriendsPage = () => {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const hasFetchedRef = useRef(false);
    const performSearch = async (query) => {
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const results = await searchUsersByKeyword(query);
            setSearchResults(results);
        } catch (err) {
            console.error("Lỗi tìm kiếm:", err);
            setError("Không thể tìm kiếm người dùng. Vui lòng thử lại.");
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialQuery && !hasFetchedRef.current) {
            performSearch(initialQuery);
            hasFetchedRef.current = true; // Đánh dấu đã fetch
        }
    }, [initialQuery]);

    return (
        <div className="search-page pt-4 px-4 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
                Kết quả tìm kiếm cho: "<span className="text-blue-600">{initialQuery}</span>"
            </h2>
            {loading && <div className="text-center p-4 text-blue-500">Đang tìm kiếm...</div>}
            {error && <div className="text-center p-4 text-red-500 bg-red-100 rounded">{error}</div>}

            {!loading && !error && (
                <div className="space-y-4">
                    {searchResults.length > 0 ? (
                        searchResults.map(user => (
                            <UserCard key={user._id} user={user} />
                        ))
                    ) : initialQuery.length > 0 ? (
                        <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-md">
                            Không tìm thấy kết quả nào khớp với "{initialQuery}".
                        </div>
                    ) : (
                        <div className="text-center p-8 text-gray-500">
                            Vui lòng tìm kiếm bằng thanh điều hướng trên cùng.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchFriendsPage;