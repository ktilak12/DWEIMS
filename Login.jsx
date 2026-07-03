import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, Fingerprint } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch {
            setError('ACCESS DENIED: INSUFFICIENT CLEARANCE');
        }
    };

    const { user } = useAuth();
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden scan-effect font-sans">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="w-full max-w-md glass-card p-10 rounded-2xl z-10 fade-in stagger-1">
                <div className="flex flex-col items-center mb-10 group">
                    <div className="relative h-20 w-20 flex items-center justify-center mb-6">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="h-20 w-20 bg-surface border border-primary/30 text-primary rounded-full flex items-center justify-center relative z-10 shadow-[inset_0_0_15px_var(--color-primary-dim)]">
                            <ShieldAlert className="h-10 w-10 drop-shadow-[0_0_8px_var(--color-primary)]" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-display font-black tracking-widest text-text drop-shadow-[0_0_8px_var(--color-primary-dim)]">DWEMS ACCESS</h2>
                    <p className="text-primary/70 text-xs mt-2 font-mono tracking-[0.2em] uppercase font-bold text-center">Authorized Personnel Only <br/> Class A Clearance Required</p>
                </div>
                
                {error && (
                    <div className="bg-danger/10 text-danger p-4 rounded-lg text-xs font-mono tracking-widest font-bold mb-8 text-center border border-danger/40 shadow-[0_0_15px_var(--color-danger-dim)] fade-in">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="block text-xs font-mono font-bold text-text-muted uppercase tracking-widest group-focus-within:text-primary transition-colors">Service ID / Designation</label>
                        <div className="relative">
                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full glass-panel border border-border/60 rounded-xl pl-12 pr-4 py-3.5 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 focus:shadow-[0_0_15px_var(--color-primary-dim)] transition-all font-mono text-lg tracking-wider"
                                placeholder="IDENTIFICATION"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2 group">
                        <label className="block text-xs font-mono font-bold text-text-muted uppercase tracking-widest group-focus-within:text-primary transition-colors">Passcode</label>
                        <div className="relative">
                            <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors z-10 opacity-50" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full glass-panel border border-border/60 rounded-xl pl-12 pr-4 py-3.5 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 focus:shadow-[0_0_15px_var(--color-primary-dim)] transition-all font-mono text-lg"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-background font-display font-black tracking-widest rounded-xl px-4 py-4 flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-[0_0_20px_var(--color-primary)] hover:-translate-y-1"
                        >
                            <LogIn className="h-5 w-5" />
                            AUTHENTICATE SESSION
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center fade-in stagger-3">
                <p className="text-[10px] text-text-muted/50 font-mono tracking-[0.3em] uppercase">
                    Secure Enclave // End-to-End Encrypted
                </p>
            </div>
        </div>
    );
}
