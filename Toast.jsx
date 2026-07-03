import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`fade-in flex items-center gap-3 py-3 px-4 rounded-lg border shadow-lg max-w-sm pointer-events-auto ${
                            toast.type === 'success' 
                            ? 'bg-success/10 text-success border-success/30 shadow-[0_0_15px_var(--color-success-dim)]' 
                            : 'bg-danger/10 text-danger border-danger/30 shadow-[0_0_15px_var(--color-danger-dim)]'
                        }`}
                    >
                        {toast.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                        <p className="font-mono text-sm tracking-wide break-words">{toast.message}</p>
                        <button onClick={() => removeToast(toast.id)} className="ml-auto hover:text-white transition-colors cursor-pointer">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
