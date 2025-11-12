import React from 'react';

const ToastNotification = ({ toast }) => {
    return (
        <div 
            className="fixed top-16 right-5 mt-4 w-64 bg-white p-4 rounded-lg shadow-xl border-l-4 border-blue-500 z-50 
                       animate-fadeInOut" 
        >
            <p className="font-semibold text-sm text-gray-800">{toast.content}</p>
            <p className="text-xs text-gray-500 mt-1">Vừa mới xảy ra</p>
        </div>
    );
};

export default ToastNotification;