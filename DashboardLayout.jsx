import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-background text-text overflow-hidden scan-effect font-sans fade-in">
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
                handleLogout={handleLogout} 
            />
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent relative z-10 p-4 md:p-8">
                <div className="w-full max-w-[1600px] mx-auto h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
