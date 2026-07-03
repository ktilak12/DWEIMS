import React from 'react';

export function FormInput({ label, type = "text", ...props }) {
    return (
        <div className="space-y-2 group">
            <label className="block text-xs font-mono font-bold text-text-muted uppercase tracking-widest group-focus-within:text-primary transition-colors">
                {label}
            </label>
            <input 
                type={type}
                className="w-full glass-panel border border-border/60 rounded-lg px-4 py-3.5 text-text focus:ring-2 focus:ring-primary focus:border-primary/50 focus:shadow-[0_0_15px_var(--color-primary-dim)] outline-none transition-all font-mono text-lg font-bold"
                {...props}
            />
        </div>
    );
}

export function FormSelect({ label, options = [], defaultOption, ...props }) {
    return (
        <div className="space-y-2 group">
            <label className="block text-xs font-mono font-bold text-text-muted uppercase tracking-widest group-focus-within:text-primary transition-colors">
                {label}
            </label>
            <select 
                className="w-full glass-panel border border-border/60 rounded-lg px-4 py-3.5 text-text focus:ring-2 focus:ring-primary focus:border-primary/50 focus:shadow-[0_0_15px_var(--color-primary-dim)] outline-none transition-all appearance-none cursor-pointer font-mono tracking-wide"
                {...props}
            >
                {defaultOption && <option value="" disabled className="bg-surface text-text-muted">{defaultOption}</option>}
                {options.map((opt, i) => (
                    <option key={i} value={opt.value} className="bg-surface text-text">
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
