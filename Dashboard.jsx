import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { api } from '../services/api';
import { AlertTriangle, ShieldCheck, Wrench, Crosshair, RefreshCw, Send } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import Button from '../components/Button';
import { useToast } from '../components/Toast';
import { io } from 'socket.io-client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

// Memoised chart — only re-renders when history changes
const LiveChart = memo(function LiveChart({ history }) {
    return (
        <div className="glass-card rounded-xl border border-border/30 p-6 stagger-2 relative group">
            <h2 className="text-lg font-display font-bold flex items-center gap-3 text-text mb-6">
                <RefreshCw className="h-5 w-5 text-primary" />
                LIVE TACTICAL FEED
            </h2>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace', paddingTop: '12px' }} />
                        <Line type="monotone" dataKey="Available" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 6 }} animationDuration={400} />
                        <Line type="monotone" dataKey="Deployed"  stroke="var(--color-info)"    strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 6 }} animationDuration={400} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default function Dashboard() {
    const [metrics, setMetrics] = useState({ remaining: 0, taken: 0, maintenance: 0, redFlags: 0 });
    const [history, setHistory]  = useState([]);
    const [loading, setLoading]  = useState(true);
    const [error,   setError]    = useState(null);
    const { addToast } = useToast();
    const fetchRef = useRef(null);

    const fetchDashboardData = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        setError(null);
        try {
            const metricsData = await api.getMetrics();
            setMetrics(metricsData);
            setHistory(prev => {
                const now   = new Date();
                const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
                const point = { time: label, Available: metricsData.remaining, Deployed: metricsData.taken };
                return [...prev, point].slice(-20);
            });
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to establish connection. Protocol sync disrupted.');
            addToast(`Network Error: ${err.message || 'Failed to sync command dashboard.'}`, 'error');
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [addToast]);

    useEffect(() => { fetchRef.current = fetchDashboardData; }, [fetchDashboardData]);

    useEffect(() => {
        fetchDashboardData(true);

        const socket = io('http://localhost:5001', {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socket.on('connect',    () => console.log('Socket connected:',    socket.id));
        socket.on('disconnect', (r) => console.log('Socket disconnected:', r));
        socket.on('inventoryUpdate', () => { fetchRef.current?.(false); });

        return () => { socket.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cards = useMemo(() => [
        { title: 'Remaining Assets', value: metrics.remaining, icon: ShieldCheck,  color: 'success' },
        { title: 'Assets Taken',     value: metrics.taken,    icon: Send,          color: 'info'    },
        { title: 'In Maintenance',   value: metrics.maintenance,    icon: Wrench,        color: 'warning' },
        { title: 'Red Flags',        value: metrics.redFlags,   icon: AlertTriangle, color: 'danger'  },
    ], [metrics]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 fade-in">
                <AlertTriangle className="h-16 w-16 text-danger drop-shadow-[0_0_15px_var(--color-danger)] animate-pulse" />
                <h2 className="text-2xl font-display font-bold text-text uppercase tracking-widest">{error}</h2>
                <Button variant="secondary" onClick={fetchDashboardData}>
                    <RefreshCw className="h-5 w-5" /> RETRY CONNECTION
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse text-primary">
                <div className="h-16 w-1/3 bg-surface rounded-lg border border-border/50"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-40 glass-panel rounded-xl opacity-50 p-6 flex flex-col justify-between border border-border/30">
                            <div className="flex justify-between">
                                <div className="space-y-3">
                                    <div className="h-3 w-16 bg-white/20 rounded"></div>
                                    <div className="h-8 w-12 bg-white/30 rounded"></div>
                                </div>
                                <div className="h-10 w-10 bg-white/10 rounded-lg"></div>
                            </div>
                            <div className="h-6 w-full bg-white/5 rounded mt-4"></div>
                        </div>
                    ))}
                </div>
                <div className="h-96 glass-panel rounded-xl opacity-50 border border-border/30"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in pb-12">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-border pb-4 stagger-1">
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-widest text-text drop-shadow-[0_0_10px_var(--color-primary-dim)] flex items-center gap-4">
                        <Crosshair className="h-10 w-10 text-primary drop-shadow-[0_0_8px_var(--color-primary)]" />
                        TACTICAL OVERVIEW
                    </h1>
                    <p className="text-primary/70 mt-2 font-mono tracking-wide text-sm opacity-80">Live asset metrics &amp; intelligence reports.</p>
                </div>
                <Button variant="secondary" onClick={() => fetchDashboardData(true)} className="!py-2 !px-4 text-xs" title="Force Protocol Refresh">
                    <RefreshCw className="h-4 w-4 text-primary" /> SYNC
                </Button>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((c, i) => (
                    <DashboardCard
                        key={i}
                        delayIndex={i}
                        title={c.title}
                        value={c.value}
                        icon={c.icon}
                        color={c.color}
                    />
                ))}
            </div>

            {/* Live chart */}
            <LiveChart history={history} />
        </div>
    );
}
