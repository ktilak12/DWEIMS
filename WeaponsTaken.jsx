import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Search, ListChecks, AlertTriangle, RefreshCw, Undo2 } from 'lucide-react';
import Button from '../components/Button';
import { useToast } from '../components/Toast';

export default function WeaponsTaken() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const { addToast } = useToast();

    // Return Modal State
    const [returningAsset, setReturningAsset] = useState(null);
    const [returnQty, setReturnQty] = useState(1);
    const [isReturning, setIsReturning] = useState(false);

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getIssued();
            setAssets(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load issued weapons.');
            addToast('Error: Cannot load issued records.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleReturn = async () => {
        if (!returningAsset) return;
        setIsReturning(true);
        try {
            await api.returnAsset(returningAsset.id, Number(returnQty));
            addToast('Asset returned successfully', 'success');
            setReturningAsset(null);
            fetchAssets();
        } catch (err) {
            addToast(err.message || 'Error occurred while returning', 'error');
        } finally {
            setIsReturning(false);
        }
    };

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
        <div className="space-y-6 fade-in pb-12 relative">
            <div className="flex justify-between items-end border-b border-border pb-4 stagger-1">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-widest text-text flex items-center gap-3">
                        <ListChecks className="h-8 w-8 text-primary" />
                        WEAPONS TAKEN
                    </h1>
                    <p className="text-primary/70 mt-2 font-mono tracking-wide text-sm opacity-80">Currently issued assets avoiding system baseline.</p>
                </div>
            </div>

            <div className="flex gap-4 mb-8 stagger-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                    <input 
                        type="text" 
                        placeholder="Search by serial, name or unit..." 
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
                                <th className="p-4">Unit Assigned</th>
                                <th className="p-4">Qty</th>
                                <th className="p-4">Issue Date</th>
                                <th className="p-4">Expected Return</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-text-muted font-mono animate-pulse">
                                        SCANNING DATABASE...
                                    </td>
                                </tr>
                            ) : filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-text-muted font-mono">
                                        NO ISSUED RECORDS FOUND
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset, idx) => {
                                    const isOverdue = new Date(asset.expected_return) < new Date();
                                    return (
                                        <tr key={`${asset.id}-${idx}`} className="group hover:bg-surface-hover/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-mono text-primary font-bold">{asset.serial_number}</div>
                                                <div className="text-sm text-text-muted">{asset.name}</div>
                                            </td>
                                            <td className="p-4 font-mono text-sm">{asset.unit_name}</td>
                                            <td className="p-4 font-mono">{asset.quantity}</td>
                                            <td className="p-4 text-sm text-text-muted">{new Date(asset.issue_date).toLocaleDateString()}</td>
                                            <td className={`p-4 text-sm font-mono ${isOverdue ? 'text-danger font-bold' : 'text-text-muted'}`}>
                                                {new Date(asset.expected_return).toLocaleDateString()}
                                                {isOverdue && <span className="ml-2 text-[10px] bg-danger/20 border border-danger/50 px-1 py-0.5 rounded text-danger">OVERDUE</span>}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    onClick={() => { setReturningAsset(asset); setReturnQty(asset.quantity); }}
                                                >
                                                    <Undo2 className="h-4 w-4" /> Return
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Return Modal Overlay */}
            {returningAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="glass-panel border border-border rounded-2xl w-full max-w-md overflow-hidden transform transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <div className="bg-surface p-6 border-b border-border flex justify-between items-center">
                            <h3 className="font-display font-bold text-xl tracking-widest text-text">RETURN ASSET</h3>
                            <button onClick={() => setReturningAsset(null)} className="text-text-muted hover:text-danger">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-surface/50 border border-border rounded-lg">
                                <p className="font-mono text-primary text-lg mb-1">{returningAsset.serial_number}</p>
                                <p className="text-sm text-text-muted">{returningAsset.name}</p>
                                <div className="mt-2 text-xs font-mono uppercase text-warning opacity-80">
                                    Assigned: {returningAsset.unit_name}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-mono tracking-wider text-text-muted uppercase mb-2">Return Quantity</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    max={returningAsset.quantity}
                                    value={returnQty}
                                    onChange={(e) => setReturnQty(e.target.value)}
                                    className="w-full bg-surface/80 border border-border rounded-lg px-4 py-3 text-text font-mono focus:ring-2 focus:ring-primary focus:border-primary/50 outline-none"
                                />
                                <p className="text-xs text-text-muted mt-2">Max available to return: {returningAsset.quantity}</p>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" className="flex-1" onClick={() => setReturningAsset(null)}>Cancel</Button>
                                <Button 
                                    variant="primary" 
                                    className="flex-1" 
                                    onClick={handleReturn}
                                    disabled={isReturning || returnQty < 1 || returnQty > returningAsset.quantity}
                                >
                                    {isReturning ? 'Processing...' : 'Confirm Return'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
