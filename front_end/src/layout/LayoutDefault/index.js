import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import SidebarLeft from '../../components/SidebarLeft/SidebarLeft';
import SidebarRight from '../../components/SidebarRight/SidebarRight';

const LayoutDefault = () => { 
    return (
        <div className="flex flex-col min-h-screen bg-[#f0f2f5]"> 
            {/* Navbar cố định phía trên */}
            <Navbar /> 

            {/* Container chính: Căn giữa và giới hạn chiều rộng */}
            <div className="w-full flex justify-center pt-16">
                <div className="flex w-full max-w-[1440px] px-2 sm:px-4 gap-6">
                    
                    {/* SIDEBAR TRÁI: Chiếm 25% trên màn hình lớn */}
                    <aside className="hidden lg:block lg:w-[25%] xl:w-[20%] sticky top-16 h-[calc(100vh-64px)] py-4 overflow-y-auto no-scrollbar">
                        <SidebarLeft />
                    </aside>
                    
                    {/* NỘI DUNG CHÍNH (FEED): Chiếm 50% hoặc toàn bộ trên mobile */}
                    <main className="w-full lg:w-[75%] xl:w-[55%] py-4 min-h-[calc(100vh-64px)]">
                        <div className="max-w-[680px] mx-auto"> 
                            <Outlet /> 
                        </div>
                    </main>
                    
                    {/* SIDEBAR PHẢI: Chỉ hiện trên màn hình rất lớn (XL) */}
                    <aside className="hidden xl:block xl:w-[25%] sticky top-16 h-[calc(100vh-64px)] py-4 overflow-y-auto no-scrollbar">
                        <SidebarRight />
                    </aside>

                </div>
            </div>
        </div>
    );
};

export default LayoutDefault;