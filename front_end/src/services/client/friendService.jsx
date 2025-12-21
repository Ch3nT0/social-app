import { getAuth, postAuth, putAuth, delAuth } from "../../utils/request"; 

const API_FRIENDS_PATH = "/friends";

export const sendFriendRequest = async (receiverId) => {
    const path = `${API_FRIENDS_PATH}/add/${receiverId}`;
    return postAuth(path, {}); 
};

export const acceptFriendRequest = async (requestId) => {
    console.log("Accepting friend request with ID:", requestId);
    const path = `${API_FRIENDS_PATH}/accept/${requestId}`;
    return putAuth(path, {}); 
};

export const rejectFriendRequest = async (requestId) => {
    const path = `${API_FRIENDS_PATH}/reject/${requestId}`;
    const result = putAuth(path, {});
    return result; 
};

export const cancelSentRequest = async (requestId) => {
    const path = `${API_FRIENDS_PATH}/cancel/${requestId}`;
    const result = delAuth(path);
    return result; 
};

export const getPendingRequests = async (userId) => {
    const path = `${API_FRIENDS_PATH}/requests/${userId}`;
    return getAuth(path); 
};

export const unfriendUser = async (friendId) => {
    const path = `${API_FRIENDS_PATH}/${friendId}/unfriend`; 
    return delAuth(path); 
};

export const getSuggestedFriends = async (userId) => {
    const path = `${API_FRIENDS_PATH}/${userId}/suggestions`;
    return getAuth(path); 
};

export const getCheckRequests = async (userId) => {
    const path = `${API_FRIENDS_PATH}/check_requests/${userId}`;
    return getAuth(path); 
};
