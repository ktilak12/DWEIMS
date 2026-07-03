import React from 'react';

export default function StatusBadge({ status }) {
    const getStatusStyle = (s) => {
        const lowerS = s ? s.toLowerCase() : '';
        if (lowerS.includes('available') || lowerS.includes('active') || lowerS.includes('operational')) return 'bg-success/10 text-success border-success/30 shadow-[0_0_8px_var(--color-success-dim)]';
        if (lowerS.includes('issued') || lowerS.includes('deployed')) return 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_8px_var(--color-primary-dim)]';
        if (lowerS.includes('repair') || lowerS.includes('maintenance')) return 'bg-warning/10 text-warning border-warning/30 shadow-[0_0_8px_var(--color-warning-dim)]';
        if (lowerS.includes('decommissioned') || lowerS.includes('critical') || lowerS.includes('overdue')) return 'bg-danger/10 text-danger border-danger/30 shadow-[0_0_8px_var(--color-danger-dim)]';
        if (lowerS.includes('low')) return 'bg-warning/10 text-warning border-warning/30 shadow-[0_0_8px_var(--color-warning-dim)]';
        return 'bg-surface text-text-muted border-border';
    };

    return (
        <span className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider border whitespace-nowrap ${getStatusStyle(status)}`}>
            {status ? status.toUpperCase() : 'UNKNOWN'}
        </span>
    );
}
