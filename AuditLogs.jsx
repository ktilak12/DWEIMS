import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { ShieldCheck, Search, Clock, User, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import { useToast } from '../components/Toast';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getAuditLogs();
            setLogs(data);
        } catch (err) {
            console.error(err);
            setError('System synchronization failed.');
            addToast('Network Request Error: Cannot load audit history.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredLogs = logs.filter(l => 
        l.Action_Type.toLowerCase().includes(search.toLowerCase()) || 
        l.Username.toLowerCase().includes(search.toLowerCase()) ||
        l.Equipment_Name.toLowerCase().includes(search.toLowerCase())
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 fade-in">
                <AlertTriangle className="h-16 w-16 text-danger drop-shadow-[0_0_15px_var(--color-danger)] animate-pulse" />
                <h2 className="text-2xl font-display font-bold text-text uppercase tracking-widest">{error}</h2>
                <Button variant="secondary" onClick={fetchData}>
                    <RefreshCw className="h-5 w-5" /> RE-ESTABLISH CONNECTION
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in pb-12">
            <div className="flex justify-between items-end border-b border-border pb-4 stagger-1">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-widest text-text drop-shadow-[0_0_10px_var(--color-primary-dim)] flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        SYSTEM AUDIT LOGS
                    </h1>
                    <p className="text-primary/70 mt-2 font-mono tracking-wide text-sm opacity-80">Immutable record of all inventory transactions and updates.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 stagger-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                    <input 
                        type="text" 
                        placeholder="Search by action, user, or equipment..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface/80 border border-border rounded-xl text-text focus:ring-2 focus:ring-primary focus:border-primary/50 focus:shadow-[0_0_15px_var(--color-primary-dim)] outline-none transition-all font-mono tracking-wide glass-panel"
                    />
                </div>
            </div>

            <div className="space-y-4 stagger-3">
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl border border-border"></div>
                    ))
                ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log, idx) => (
                        <div key={idx} className="bg-surface/40 backdrop-blur-md border border-border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${
                                    log.Action_Type === 'Issue' ? 'bg-warning/20 text-warning' :
                                    log.Action_Type === 'Return' ? 'bg-success/20 text-success' :
                                    'bg-primary/20 text-primary'
                                }`}>
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-text tracking-wide uppercase text-sm">
                                        {log.Action_Type} PERMISSION EXECUTED
                                    </h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-text-muted font-mono">
                                            <User className="h-3 w-3" /> {log.Username}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-text-muted font-mono">
                                            <Package className="h-3 w-3" /> {log.Equipment_Name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-mono text-primary/80 bg-primary/10 px-2 py-1 rounded">
                                    {new Date(log.Timestamp).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-text-muted font-mono tracking-widest uppercase opacity-50">
                        No audit records found in registry
                    </div>
                )}
            </div>
        </div>
    );
}
