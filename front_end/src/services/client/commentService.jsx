import { getAuth, postAuth, delAuth } from "../../utils/request"; 
const API_COMMENTS_PATH = "/comments";
export const getPostComments = async (postId) => {
    const path = `${API_COMMENTS_PATH}/${postId}`;
    return getAuth(path); 
};

export const createNewComment = async (commentData) => {
    const path = API_COMMENTS_PATH;
    return postAuth(path, commentData);
};

export const deleteCommentById = async (commentId) => {
    const path = `${API_COMMENTS_PATH}/${commentId}`;
    return delAuth(path); 
};