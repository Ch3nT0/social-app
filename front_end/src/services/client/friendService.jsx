import { getAuth, postAuth, putAuth, delAuth } from "../../utils/request"; 

const API_FRIENDS_PATH = "/friends";

export const sendFriendRequest = async (receiverId) => {
    console.log("Sending friend request to:", receiverId);
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
    return putAuth(path, {}); 
};


export const cancelSentRequest = async (requestId) => {
    const path = `${API_FRIENDS_PATH}/cancel/${requestId}`;
    return delAuth(path); 
};


export const getPendingRequests = async (userId) => {
    const path = `${API_FRIENDS_PATH}/requests/${userId}`;
    return getAuth(path); 
};


export const unfriendUser = async (friendId) => {
    const path = `${API_FRIENDS_PATH}/${friendId}/unfriend`; 
    return delAuth(path); 
};