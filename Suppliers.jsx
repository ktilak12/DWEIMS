import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Truck, Search, Phone, Mail, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import { useToast } from '../components/Toast';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getSuppliers();
            setSuppliers(data);
        } catch (err) {
            console.error(err);
            setError('System synchronization failed.');
            addToast('Network Request Error: Cannot load supplier database.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredSuppliers = suppliers.filter(s => 
        s.Supplier_Name.toLowerCase().includes(search.toLowerCase()) || 
        s.Contact_Details.toLowerCase().includes(search.toLowerCase())
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
                        <Truck className="h-8 w-8 text-primary" />
                        SUPPLIER DIRECTORY
                    </h1>
                    <p className="text-primary/70 mt-2 font-mono tracking-wide text-sm opacity-80">Verified defense equipment vendors and contact details.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 stagger-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                    <input 
                        type="text" 
                        placeholder="Search by name or contact info..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface/80 border border-border rounded-xl text-text focus:ring-2 focus:ring-primary focus:border-primary/50 focus:shadow-[0_0_15px_var(--color-primary-dim)] outline-none transition-all font-mono tracking-wide glass-panel"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-3">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl border border-border"></div>
                    ))
                ) : filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((s) => (
                        <div key={s.Supplier_ID} className="bg-surface/40 backdrop-blur-md border border-border rounded-2xl p-6 glass-panel hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.2)] transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                <Truck className="h-12 w-12 text-primary" />
                            </div>
                            
                            <h3 className="text-xl font-display font-bold text-text mb-4 tracking-wider flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                {s.Supplier_Name}
                            </h3>
                            
                            <div className="space-y-3 font-mono text-sm">
                                <div className="flex items-center gap-3 text-text-muted">
                                    <Mail className="h-4 w-4 text-primary/60" />
                                    <span>{s.Contact_Details}</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-muted">
                                    <Package className="h-4 w-4 text-primary/60" />
                                    <span>Linked Assets: Multiple</span>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-border/50">
                                <button className="text-xs font-bold text-primary uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                                    View Contract History →
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-text-muted font-mono tracking-widest uppercase opacity-50">
                        No suppliers found matching identification
                    </div>
                )}
            </div>
        </div>
    );
}
