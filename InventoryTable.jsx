import React from 'react';
import StatusBadge from './StatusBadge';

export default function InventoryTable({ assets, loading }) {
    return (
        <div className="glass-card rounded-xl border border-border overflow-hidden stagger-3">
            <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                    <thead className="bg-surface border-b border-border text-xs text-text-muted uppercase font-mono tracking-[0.15em] font-bold">
                        <tr>
                            <th className="px-6 py-5 whitespace-nowrap">Serial Number</th>
                            <th className="px-6 py-5 whitespace-nowrap">Designation</th>
                            <th className="px-6 py-5 whitespace-nowrap">Type / Caliber</th>
                            <th className="px-6 py-5 text-center whitespace-nowrap">Quantity Avail.</th>
                            <th className="px-6 py-5 whitespace-nowrap">Status</th>
                            <th className="px-6 py-5 text-right whitespace-nowrap">Location</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-primary/60 font-mono tracking-widest animate-pulse">
                                    SCANNING INVENTORY DATABASE...
                                </td>
                            </tr>
                        ) : assets.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-text-muted font-mono tracking-widest">
                                    NO ASSETS FOUND MATCHING PARAMETERS
                                </td>
                            </tr>
                        ) : (
                            assets.map((asset, idx) => (
                                <tr 
                                    key={idx} 
                                    className="hover:bg-primary/5 transition-colors group cursor-default"
                                >
                                    <td className="px-6 py-5 font-mono text-sm tracking-wider group-hover:text-primary transition-colors">
                                        {asset.serial_number}
                                    </td>
                                    <td className="px-6 py-5 font-medium text-text font-display">
                                        {asset.name}
                                    </td>
                                    <td className="px-6 py-5 text-text-muted">
                                        <span className="font-medium font-sans">{asset.type}</span> <br/> 
                                        {asset.caliber && asset.caliber !== 'N/A' && <span className="text-xs text-primary/70 font-mono opacity-80">{asset.caliber}</span>}
                                    </td>
                                    <td className="px-6 py-5 text-center font-mono text-lg font-bold">
                                        {asset.quantity}
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={asset.status} />
                                    </td>
                                    <td className="px-6 py-5 text-right text-sm text-text-muted font-mono whitespace-nowrap group-hover:text-text transition-colors">
                                        {asset.current_location}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
