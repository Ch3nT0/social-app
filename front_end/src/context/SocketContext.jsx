import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { getCookie } from '../helpers/cookie';

const SocketContext = createContext({
    socket: null, 
    notifications: [],
    setNotifications: () => {}
});

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

const SOCKET_SERVER_URL = process.env.REACT_APP_API_DOMAIN; 

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]); 
    
    // Lấy token/userId khi component mount
    const token = getCookie('token');
    const userId = getCookie('userId');

    useEffect(() => {
        if (token && userId) {
            const newSocket = io(SOCKET_SERVER_URL);
            setSocket(newSocket);
            
            newSocket.on('connect', () => {
                // Gửi ID người dùng để server map ID -> socketId
                newSocket.emit('addUser', userId);
            });
            
            // Lắng nghe thông báo đẩy realtime từ BE
            newSocket.on('newNotification', (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
            });

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [token, userId]); 

    return (
        <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};