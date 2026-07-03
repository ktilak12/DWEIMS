import React from 'react';

export default function Button({ 
    children, 
    variant = 'primary', 
    className = '', 
    disabled, 
    ...props 
}) {
    const baseStyles = "flex items-center justify-center gap-3 font-display font-bold py-3.5 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed hover:-translate-y-1";
    
    const variants = {
        primary: "bg-primary text-background border border-transparent hover:bg-primary/90 hover:shadow-[0_0_20px_var(--color-primary)] disabled:bg-surface disabled:border-border disabled:text-text-muted disabled:shadow-none disabled:opacity-50 disabled:hover:-translate-y-0",
        secondary: "bg-surface hover:bg-surface-hover text-text border border-border hover:border-primary/50 hover:shadow-[0_0_15px_var(--color-primary-dim)] disabled:opacity-50 disabled:hover:shadow-none disabled:hover:-translate-y-0 disabled:border-border",
        danger: "bg-danger text-white border border-transparent hover:bg-danger/90 hover:shadow-[0_0_20px_var(--color-danger)] disabled:opacity-50 disabled:hover:-translate-y-0"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
