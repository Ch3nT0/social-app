import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { getCookie } from '../helpers/cookie';

const SocketContext = createContext();

// Hàm hook tiện ích
export const useSocket = () => {
    return useContext(SocketContext);
};

const SOCKET_SERVER_URL = "http://localhost:3001"; 

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]); // State để lưu thông báo

    useEffect(() => {
        const token = getCookie('token');
        const userId = getCookie('userId');
        
        // Chỉ kết nối nếu đã có token
        if (token && userId) {
            const newSocket = io(SOCKET_SERVER_URL);
            setSocket(newSocket);
            
            // 1. Gửi User ID lên server để BE map (userId -> socketId)
            newSocket.on('connect', () => {
                newSocket.emit('addUser', userId);
                console.log("Socket connected and user ID sent:", userId);
            });
            
            // 2. Lắng nghe thông báo đẩy realtime từ BE
            newSocket.on('newNotification', (newNotif) => {
                console.log("Real-time notification received:", newNotif);
                
                // Thêm thông báo mới vào đầu danh sách
                setNotifications(prev => [newNotif, ...prev]);
                
                // ⭐️ Hiển thị cảnh báo nhỏ (tùy chọn)
                // alert(`${newNotif.senderName} ${newNotif.content}`); 
            });

            // 3. Cleanup: Ngắt kết nối khi component unmount
            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        } else if (socket) {
            // Ngắt kết nối nếu người dùng đăng xuất
            socket.disconnect();
            setSocket(null);
        }
    }, [getCookie('token')]); // Kích hoạt lại khi token thay đổi (Đăng nhập/Đăng xuất)

    return (
        <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};