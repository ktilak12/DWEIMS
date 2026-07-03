import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Search, Filter, Database, AlertTriangle, RefreshCw } from 'lucide-react';
import InventoryTable from '../components/InventoryTable';
import Button from '../components/Button';
import { useToast } from '../components/Toast';

export default function Inventory() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const { addToast } = useToast();

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getInventory();
            setAssets(data);
        } catch (err) {
            console.error(err);
            setError('System synchronization failed.');
            addToast('Network Request Error: Cannot load database registry.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const filteredAssets = assets.filter(a => {
        const matchesSearch = String(a.serial_number).toLowerCase().includes(search.toLowerCase()) || 
                              String(a.name).toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterStatus === 'All' || a.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 fade-in">
                <AlertTriangle className="h-16 w-16 text-danger drop-shadow-[0_0_15px_var(--color-danger)] animate-pulse" />
                <h2 className="text-2xl font-display font-bold text-text uppercase tracking-widest">{error}</h2>
                <Button variant="secondary" onClick={fetchAssets}>
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
                        <Database className="h-8 w-8 text-primary" />
                        MASTER INVENTORY
                    </h1>
                    <p className="text-primary/70 mt-2 font-mono tracking-wide text-sm opacity-80">Complete catalog of tracked serialized assets.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 stagger-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                    <input 
                        type="text" 
                        placeholder="Scan or enter identification..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface/80 border border-border rounded-xl text-text focus:ring-2 focus:ring-primary focus:border-primary/50 focus:shadow-[0_0_15px_var(--color-primary-dim)] outline-none transition-all font-mono tracking-wide glass-panel"
                    />
                </div>
                <div className="relative w-full md:w-64 group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary pointer-events-none transition-colors z-10" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface/80 border border-border rounded-xl text-text focus:ring-2 focus:ring-primary focus:border-primary/50 focus:shadow-[0_0_15px_var(--color-primary-dim)] outline-none appearance-none cursor-pointer transition-all font-mono tracking-wide glass-panel"
                    >
                        <option value="All">All Classifications</option>
                        <option value="Active">Active</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Decommissioned">Decommissioned</option>
                    </select>
                </div>
            </div>

            <InventoryTable assets={filteredAssets} loading={loading} />
        </div>
    );
}
