import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Search, Filter, ShoppingCart, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import Button from '../components/Button';
import { useToast } from '../components/Toast';

export default function Procurement() {
    const [procurements, setProcurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterSupplier, setFilterSupplier] = useState('All');
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getProcurement();
            setProcurements(data);
        } catch (err) {
            console.error(err);
            setError('System synchronization failed.');
            addToast('Network Request Error: Cannot load procurement registry.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const suppliers = ['All', ...new Set(procurements.map(p => p.Supplier_Name))];

    const filteredData = procurements.filter(p => {
        const matchesSearch = p.Equipment_Name.toLowerCase().includes(search.toLowerCase()) || 
                              p.Supplier_Name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterSupplier === 'All' || p.Supplier_Name === filterSupplier;
        return matchesSearch && matchesFilter;
    });

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
                        <ShoppingCart className="h-8 w-8 text-primary" />
                        PROCUREMENT MANAGEMENT
                    </h1>
                    <p className="text-primary/70 mt-2 font-mono tracking-wide text-sm opacity-80">Track and manage equipment acquisition logs.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 stagger-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                    <input 
                        type="text" 
                        placeholder="Search equipment or supplier..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface/80 border border-border rounded-xl text-text focus:ring-2 focus:ring-primary focus:border-primary/50 focus:shadow-[0_0_15px_var(--color-primary-dim)] outline-none transition-all font-mono tracking-wide glass-panel"
                    />
                </div>
                <div className="relative w-full md:w-64 group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary pointer-events-none transition-colors z-10" />
                    <select
                        value={filterSupplier}
                        onChange={(e) => setFilterSupplier(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface/80 border border-border rounded-xl text-text focus:ring-2 focus:ring-primary focus:border-primary/50 focus:shadow-[0_0_15px_var(--color-primary-dim)] outline-none appearance-none cursor-pointer transition-all font-mono tracking-wide glass-panel"
                    >
                        {suppliers.map(s => <option key={s} value={s}>{s === 'All' ? 'All Suppliers' : s}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface/40 backdrop-blur-md glass-panel shadow-2xl stagger-3">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-primary/10 border-b border-border">
                            <th className="px-6 py-4 font-display text-xs uppercase tracking-[0.2em] text-primary">Equipment Name</th>
                            <th className="px-6 py-4 font-display text-xs uppercase tracking-[0.2em] text-primary">Supplier Name</th>
                            <th className="px-6 py-4 font-display text-xs uppercase tracking-[0.2em] text-primary">Quantity</th>
                            <th className="px-6 py-4 font-display text-xs uppercase tracking-[0.2em] text-primary">Procurement Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="4" className="px-6 py-4 h-12 bg-white/5"></td>
                                </tr>
                            ))
                        ) : filteredData.length > 0 ? (
                            filteredData.map((p, idx) => (
                                <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-sm text-text font-bold">{p.Equipment_Name}</td>
                                    <td className="px-6 py-4 font-mono text-sm text-text-muted">{p.Supplier_Name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-mono text-xs border border-primary/30">
                                            {p.Quantity} UNITS
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-text-muted flex items-center gap-2">
                                        <Calendar className="h-4 w-4 opacity-50" />
                                        {new Date(p.Procurement_Date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-text-muted font-mono tracking-widest uppercase opacity-50">
                                    No records found matching criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
