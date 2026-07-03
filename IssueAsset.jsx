import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { FileText, ScanLine, AlertTriangle, RefreshCw } from 'lucide-react';
import { FormInput, FormSelect } from '../components/FormControls';
import Button from '../components/Button';
import { useToast } from '../components/Toast';

export default function IssueAsset() {
    const [availableAssets, setAvailableAssets] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [selectedAsset, setSelectedAsset] = useState('');
    const [selectedPersonnel, setSelectedPersonnel] = useState('');
    const [expectedReturn, setExpectedReturn] = useState(1);
    const [quantity, setQuantity] = useState(1);
    
    const [submitting, setSubmitting] = useState(false);
    
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [assetsData, personnelData] = await Promise.all([
                api.getAvailableInventory(),
                api.getPersonnel()
            ]);
            setAvailableAssets(assetsData);
            setPersonnel(personnelData);
        } catch (err) {
            console.error(err);
            setError('Auth system unreachable. Synchronization failed.');
            addToast('Network Request Error: Cannot load authorization matrix.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            await api.issueAsset(parseInt(selectedAsset), parseInt(selectedPersonnel), parseInt(expectedReturn), parseInt(quantity));
            addToast('ASSET AUTHORIZATION CONFIRMED. LOGGED IN SYSTEM.', 'success');
            
            // Refresh available assets directly on success to immediately respect stock constraints map
            const newAssets = await api.getAvailableInventory();
            setAvailableAssets(newAssets);
            
            setSelectedAsset('');
        } catch (err) {
            addToast(err.message || 'Authorization failed. Protocol mismatch.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

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

    const maxAvail = availableAssets.find(a => a.id === parseInt(selectedAsset))?.max_qty || 1;

    return (
        <div className="max-w-3xl mx-auto space-y-8 fade-in pb-12">
            <div className="border-b border-border pb-4 stagger-1">
                <h1 className="text-3xl font-display font-bold tracking-widest text-text drop-shadow-[0_0_10px_var(--color-primary-dim)] flex items-center gap-3">
                    <ScanLine className="h-8 w-8 text-primary" />
                    AUTHORIZE ASSET
                </h1>
                <p className="text-primary/70 mt-2 font-mono tracking-wide text-sm opacity-80">Log physical transfer of armory assets to authorized combat units.</p>
            </div>

            <div className="glass-card rounded-xl p-6 md:p-10 stagger-3">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {loading ? (
                        <div className="animate-pulse flex flex-col h-40 items-center justify-center space-y-4">
                            <div className="h-2 w-full max-w-sm bg-primary/20 rounded-full overflow-hidden relative">
                                <div className="absolute top-0 left-0 h-full w-1/3 bg-primary/60 rounded-full animate-[scan-line_1s_ease-in-out_infinite_alternate]"></div>
                            </div>
                            <span className="font-mono text-primary/70 tracking-widest text-sm">SYNCING PROTOCOLS...</span>
                        </div>
                    ) : (
                        <>
                            <FormSelect 
                                label="Select Asset Designation"
                                defaultOption="-- Select an available item --"
                                value={selectedAsset}
                                onChange={(e) => {
                                    setSelectedAsset(e.target.value);
                                    setQuantity(1); // Reset quantity constraint on asset switch
                                }}
                                required
                                options={availableAssets.map(asset => ({
                                    value: asset.id,
                                    label: `${asset.serial_number} - ${asset.name} (${asset.type}) [Avail: ${asset.max_qty}]`
                                }))}
                            />

                            <FormSelect 
                                label="Assign To Defence Unit"
                                defaultOption="-- Select authorized unit --"
                                value={selectedPersonnel}
                                onChange={(e) => setSelectedPersonnel(e.target.value)}
                                required
                                options={personnel.map(p => ({
                                    value: p.id,
                                    label: `UNIT-[${p.id.toString().padStart(3, '0')}] // ${p.username} (${p.role}) - ${p.location}`
                                }))}
                            />

                            <FormInput 
                                label={`Issue Quantity (Units) - Max ${maxAvail}`}
                                type="number"
                                min="1"
                                max={maxAvail}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />

                            <FormInput 
                                label="Expected Return Window (Days)"
                                type="number"
                                min="1"
                                max="365"
                                value={expectedReturn}
                                onChange={(e) => setExpectedReturn(e.target.value)}
                                required
                            />

                            <div className="pt-4">
                                <Button 
                                    type="submit" 
                                    variant="primary"
                                    className="w-full"
                                    disabled={submitting || !selectedAsset || !selectedPersonnel || quantity > maxAvail}
                                >
                                    <FileText className="h-5 w-5" />
                                    {submitting ? 'AUTHORIZING TRANSFER...' : 'EXECUTE AUTHORIZATION'}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
