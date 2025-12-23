import { post } from '../../utils/request'; 

export const loginUser = async (data) => {
    return post('/auth/login', data);
};

export const registerUser = async (data) => {
    return post('/auth/register', data); 
};

export const forgotPassword = async (data) => {
    return post('/auth/password/forgot', data);
}

export const resetPassword = async (data) => {
    return post('/auth/password/reset', data);
}

export const verifyOtp = async (data) => {
    return post('/auth/password/otp', data);
}