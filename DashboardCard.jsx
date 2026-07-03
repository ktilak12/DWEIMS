import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ value }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value, 10) || 0;
        if (start === end) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCount(end);
            return;
        }
        const duration = 1200;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCount(end);
                clearInterval(timer);
            } else {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCount(Math.round(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{count}</span>;
};

const Sparkline = ({ color }) => (
    <svg viewBox="0 0 100 30" className="w-full h-10 opacity-50 mt-6 group-hover:opacity-100 transition-opacity duration-300">
        <path d="M 0,25 C 20,10 30,28 50,15 C 70,2 80,22 100,10" fill="none" stroke={`var(--color-${color})`} strokeWidth="3" opacity="0.8" strokeLinecap="round" />
        <path d="M 0,25 C 20,10 30,28 50,15 C 70,2 80,22 100,10 L 100,35 L 0,35 Z" fill={`url(#gradient-${color})`} opacity="0.3" />
        <defs>
            <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={`var(--color-${color})`} stopOpacity="1" />
                <stop offset="100%" stopColor={`var(--color-${color})`} stopOpacity="0" />
            </linearGradient>
        </defs>
    </svg>
);

// eslint-disable-next-line no-unused-vars
export default function DashboardCard({ title, value, icon: Icon, color, delayIndex = 1 }) {
    return (
        <div className={`glass-card rounded-xl p-6 group transition-all duration-300 border-[var(--color-${color})] border-opacity-30 hover:border-opacity-100 stagger-${(delayIndex % 3) + 1} flex flex-col justify-between min-h-[170px]`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className={`text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2 group-hover:text-[var(--color-${color})] transition-colors`}>{title}</p>
                    <h3 className={`text-5xl font-display font-black text-text drop-shadow-[0_0_12px_var(--color-${color})] leading-none`}>
                        <AnimatedCounter value={value} />
                    </h3>
                </div>
                <div className={`p-3.5 rounded-xl bg-[var(--color-${color}-dim)] text-[var(--color-${color})] shadow-[inset_0_0_12px_var(--color-${color}-dim)] group-hover:shadow-[0_0_15px_var(--color-${color})] transition-all`}>
                    <Icon className="h-7 w-7" />
                </div>
            </div>
            <Sparkline color={color} />
        </div>
    );
}
