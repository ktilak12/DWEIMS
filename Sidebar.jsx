import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Archive, LogOut, ShieldAlert, FileText, Menu, X, ListChecks, Undo2, ShoppingCart, Truck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, handleLogout }) {
    const location = useLocation();
    const { user } = useAuth();
    
    const navItems = [
        { path: '/', label: 'Command Center', icon: LayoutDashboard },
        { path: '/inventory', label: 'Inventory Matrix', icon: Archive },
        { path: '/issue', label: 'Authorize Asset', icon: FileText },
        { path: '/issued', label: 'Weapons Taken', icon: ListChecks },
        { path: '/returns', label: 'Return Records', icon: Undo2 },
        { path: '/procurement', label: 'Procurement', icon: ShoppingCart },
        { path: '/suppliers', label: 'Suppliers', icon: Truck },
        { path: '/audit', label: 'Audit Logs', icon: ShieldCheck, adminOnly: true },
    ].filter(item => !item.adminOnly || user?.role === 'Admin');

    return (
        <aside 
            className={`transition-all duration-300 ease-in-out z-20 ${isSidebarOpen ? 'w-64' : 'w-20'} glass-panel border-r border-[#1e293b] hidden md:flex flex-col relative`}
        >
            {/* Toggle Button */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="absolute -right-3 top-6 bg-surface border border-border rounded-full p-1.5 text-text-muted hover:text-primary hover:border-primary hover:shadow-[0_0_10px_var(--color-primary-dim)] z-50 transition-all cursor-pointer"
            >
                {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Header */}
            <div className={`p-6 flex items-center ${isSidebarOpen ? 'justify-start gap-4' : 'justify-center'} border-b border-border/50 transition-all`}>
                <ShieldAlert className="h-8 w-8 text-primary shrink-0 drop-shadow-[0_0_8px_var(--color-primary)]" />
                {isSidebarOpen && (
                    <div className="overflow-hidden whitespace-nowrap fade-in">
                        <h1 className="text-xl font-display font-bold tracking-widest text-text">DWEMS</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-success" style={{ animation: 'pulse-glow 2s infinite' }}></div>
                            <p className="text-[10px] text-success/90 uppercase tracking-widest font-mono font-bold font-semibold">System Online</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-2 mt-6 overflow-y-auto">
                {navItems.map((item, idx) => {
                    const active = location.pathname === item.path;
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} py-3.5 rounded-lg transition-all duration-200 group relative overflow-hidden ${active ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_var(--color-primary-dim)]' : 'text-text-muted hover:bg-surface-hover hover:text-text'} stagger-${(idx % 3) + 1} fade-in`}
                            title={!isSidebarOpen ? item.label : undefined}
                        >
                            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary drop-shadow-[0_0_5px_var(--color-primary)]"></div>}
                            <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${active ? 'drop-shadow-[0_0_5px_var(--color-primary)]' : 'group-hover:text-primary group-hover:scale-110'}`} />
                            {isSidebarOpen && <span className="font-semibold ml-3 font-mono tracking-wide whitespace-nowrap transition-colors">{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>
            
            {/* User Section */}
            <div className={`p-4 border-t border-border/50 ${isSidebarOpen ? '' : 'flex flex-col items-center'}`}>
                <div className={`flex items-center mb-4 ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-surface border border-border flex items-center justify-center font-bold text-sm text-primary shadow-[inset_0_0_10px_var(--color-primary-dim)] relative overflow-hidden group">
                       <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {isSidebarOpen && (
                        <div className="overflow-hidden whitespace-nowrap">
                            <p className="font-medium text-sm text-text font-mono tracking-wide">{user?.username}</p>
                            <p className="text-[10px] text-primary/80 uppercase tracking-wider font-bold">{user?.role}</p>
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleLogout}
                    className={`cursor-pointer flex w-full items-center justify-center gap-2 hover:bg-danger-dim hover:text-danger hover:border-danger/50 border border-transparent rounded-lg transition-all duration-300 text-sm font-bold ${isSidebarOpen ? 'px-4 py-2.5 bg-surface' : 'p-2.5 bg-surface'}`}
                    title={!isSidebarOpen ? 'Sign Out' : undefined}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {isSidebarOpen && <span className="font-mono tracking-wide uppercase">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
