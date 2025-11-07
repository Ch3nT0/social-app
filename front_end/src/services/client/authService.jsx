import { post } from '../../utils/request'; 

export const loginUser = async (data) => {
    return post('/auth/login', data);
};

export const registerUser = async (data) => {
    return post('/auth/register', data); 
};