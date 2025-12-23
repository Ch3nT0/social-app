import { getAuth, postAuth, delAuth, putAuth, patchAuth } from "../../utils/request"; 

const API_POSTS_PATH = "/posts";

export const getTimelinePosts = async (userId) => {
    const path = `${API_POSTS_PATH}/timeline/${userId}`;
    const result = await getAuth(path); 
    return result; 
};

export const createPost = async (postData) => {
    const path = API_POSTS_PATH;
    const result = await postAuth(path, postData);
    return result;
};

export const likePost = async (postId) => {
    const path = `${API_POSTS_PATH}/${postId}/like`;
    const result = await putAuth(path, {}); 
    return result;
};


export const deletePost = async (postId) => {
    const path = `${API_POSTS_PATH}/${postId}`;
    const result = await delAuth(path); 
    return result;
};

export const getUserPosts = async (userId) => {
    const path = `${API_POSTS_PATH}/user/${userId}`;
    const result = await getAuth(path); 
    return result; 
}

export const updateVisibility = async (postId, visibility) => {
    const path = `${API_POSTS_PATH}/${postId}/visibility`;
    const result = await patchAuth(path, { visibility }); 
    return result; 
}