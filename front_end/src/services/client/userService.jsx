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

