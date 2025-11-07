import { getAuth, postAuth, delAuth, putAuth } from "../../utils/request"; 

const API_POSTS_PATH = "/posts";

export const getTimelinePosts = async (userId) => {
    console.log("Fetching timeline posts for userId:", userId);
    const path = `${API_POSTS_PATH}/timeline/${userId}`;
    const result = await getAuth(path); 
    console.log("Received timeline posts data:", result);
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