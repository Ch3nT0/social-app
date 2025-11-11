import { getAuth, putAuth } from "../../utils/request";

const API_USERS_PATH = "/users";

export const getUserProfile = async (userId) => {
    const path = `${API_USERS_PATH}/${userId}`;
    const result = await getAuth(path);
    return result;
};

export const followUser = async (userIdToFollow) => {
    const path = `${API_USERS_PATH}/${userIdToFollow}/follow`;
    return putAuth(path, {});
};

export const unfollowUser = async (userIdToUnfollow) => {
    const path = `${API_USERS_PATH}/${userIdToUnfollow}/unfollow`;
    return putAuth(path, {});
};

export const searchUsersByKeyword = async (keyword) => {
    const path = `${API_USERS_PATH}/search?q=${encodeURIComponent(keyword)}`;
    return getAuth(path);
};

export const getFriendsList = async (userId) => {
    console.log("Fetching friends list for userId:", userId);
    const path = `${API_USERS_PATH}/friends/${userId}`;
    const result = await getAuth(path);
    console.log("Friends list result:", result);
    return result;
};


export const getSuggestedUsers = async (userId) => {
    const path = `${API_USERS_PATH}/suggestions`; 
    try {
        const result = await getAuth(path);
        return result; 
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
};