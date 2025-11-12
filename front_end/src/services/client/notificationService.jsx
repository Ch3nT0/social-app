import { getAuth, putAuth } from "../../utils/request";

const API_NOTIFICATIONS_PATH = "/notifications";

export const getNotifications = async () => {
    const path = API_NOTIFICATIONS_PATH;
    return getAuth(path);
};

export const markNotificationsAsRead = async (notificationId = null) => {
    const path = `${API_NOTIFICATIONS_PATH}/read`;
    let body = {};
    if (notificationId) {
        body = { notificationId }; 
    } 
    return putAuth(path, body);
};