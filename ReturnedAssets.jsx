import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Search, Undo2, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import { useToast } from '../components/Toast';

export default function ReturnedAssets() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const { addToast } = useToast();

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getReturns();
            setAssets(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load returned weapons.');
            addToast('Error: Cannot load return records.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const filteredAssets = assets.filter(a => {
        return String(a.serial_number).toLowerCase().includes(search.toLowerCase()) || 
               String(a.name).toLowerCase().includes(search.toLowerCase()) ||
               String(a.unit_name).toLowerCase().includes(search.toLowerCase());
    });

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 fade-in">
                <AlertTriangle className="h-16 w-16 text-danger drop-shadow-[0_0_15px_var(--color-danger)] animate-pulse" />
                <h2 className="text-2xl font-display font-bold text-text uppercase tracking-widest">{error}</h2>
                <Button variant="secondary" onClick={fetchAssets}>
                    <RefreshCw className="h-5 w-5" /> REFRESH
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in pb-12">
            <div className="flex justify-between items-end border-b border-border pb-4 stagger-1">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-widest text-text flex items-center gap-3">
                        <Undo2 className="h-8 w-8 text-primary" />
                        RETURN RECORDS
                    </h1>
                    <p className="text-primary/70 mt-2 font-mono tracking-wide text-sm opacity-80">Log of assets successfully repatriated to armory.</p>
                </div>
            </div>

            <div className="flex gap-4 mb-8 stagger-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface/80 border border-border rounded-xl text-text focus:ring-2 focus:ring-primary focus:border-primary/50 outline-none transition-all font-mono tracking-wide glass-panel"
                    />
                </div>
            </div>

            <div className="glass-panel border border-border rounded-xl overflow-hidden stagger-3">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface/50 border-b border-border font-mono text-xs uppercase tracking-wider text-text-muted">
                                <th className="p-4">Serial / Name</th>
                                <th className="p-4">Returned From (Unit)</th>
                                <th className="p-4">Qty Returned</th>
                                <th className="p-4">Return Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-text-muted font-mono animate-pulse">
                                        SCANNING DATABASE...
                                    </td>
                                </tr>
                            ) : filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-text-muted font-mono">
                                        NO RETURN RECORDS FOUND
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset, idx) => (
                                    <tr key={`${asset.id}-${idx}`} className="group hover:bg-surface-hover/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-mono text-primary font-bold">{asset.serial_number}</div>
                                            <div className="text-sm text-text-muted">{asset.name}</div>
                                        </td>
                                        <td className="p-4 font-mono text-sm">{asset.unit_name}</td>
                                        <td className="p-4 font-mono text-success">{asset.quantity}</td>
                                        <td className="p-4 text-sm text-text-muted font-mono">{new Date(asset.return_date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
