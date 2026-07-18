"use client";

import { useMemo } from "react";
import { useAppContext } from "@/components/providers/AppProvider";
import { DEFAULT_TRUST_BOUNDARIES } from "@/lib/constants";
import { theme } from "@/lib/theme";

const ZONE_WIDTH = 188;
const NODE_WIDTH = 148;
const NODE_HEIGHT = 68;

const criticalityColor = { Low: theme.colors.low, Medium: theme.colors.medium, High: "#FF7A45", Critical: theme.colors.critical } as const;

export function ArchitectureGraph() {
  const { architecture, selectedAssetId, selectAsset } = useAppContext();
  const zones = useMemo(() => Array.from(new Set([...DEFAULT_TRUST_BOUNDARIES, ...architecture.assets.map((asset) => asset.zone)])), [architecture.assets]);
  const graphHeight = Math.max(500, ...zones.map((zone) => 120 + architecture.assets.filter((asset) => asset.zone === zone).length * 92));
  const positions = useMemo(() => {
    const result = new Map<string, { x: number; y: number }>();
    zones.forEach((zone, zoneIndex) => architecture.assets.filter((asset) => asset.zone === zone).forEach((asset, assetIndex) => result.set(asset.id, { x: zoneIndex * ZONE_WIDTH + 20, y: 78 + assetIndex * 92 })));
    return result;
  }, [architecture.assets, zones]);

  return <section className="panel min-w-0 overflow-hidden">
    <header className="flex items-start justify-between border-b border-border px-5 py-4"><div><p className="eyebrow">Live topology</p><h2 className="mt-1 font-medium">Architecture graph</h2></div><span className="rounded-full bg-panel-secondary px-2.5 py-1 font-mono text-[10px] text-slate-400">{architecture.assets.length} assets · {architecture.connections.length} paths</span></header>
    {architecture.assets.length === 0 ? <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center"><div className="rounded-full border border-dashed border-border p-5 font-mono text-xl text-secondary">◎</div><p className="mt-4 text-sm font-medium text-slate-300">Your architecture will appear here</p><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Add an asset to create its zone and build a live view of your trust boundaries.</p></div> : <div className="overflow-auto bg-[#0d1320] p-3"><svg className="min-w-[940px]" viewBox={`0 0 ${zones.length * ZONE_WIDTH} ${graphHeight}`} role="img" aria-label="Interactive architecture graph" onClick={() => selectAsset(null)}>
      <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M 0 0 L 8 4 L 0 8 z" fill={theme.colors.secondary} /></marker></defs>
      {zones.map((zone, index) => <g key={zone}><rect x={index * ZONE_WIDTH + 6} y="12" width={ZONE_WIDTH - 12} height={graphHeight - 24} rx="10" fill={index % 2 ? "#111b2c" : "#0f1928"} stroke={theme.colors.border} /><text x={index * ZONE_WIDTH + 20} y="42" fill="#94a3b8" fontSize="11" fontFamily="var(--font-jetbrains-mono)" letterSpacing="1">{zone.toUpperCase()}</text></g>)}
      {architecture.connections.map((connection) => { const from = positions.get(connection.from); const to = positions.get(connection.to); if (!from || !to) return null; const isActive = selectedAssetId === connection.from || selectedAssetId === connection.to; const x1 = from.x + NODE_WIDTH / 2; const y1 = from.y + NODE_HEIGHT; const x2 = to.x + NODE_WIDTH / 2; const y2 = to.y; return <g key={connection.id} opacity={selectedAssetId && !isActive ? 0.2 : 1}><path d={`M ${x1} ${y1} C ${x1} ${y1 + 35}, ${x2} ${y2 - 35}, ${x2} ${y2}`} fill="none" stroke={theme.colors.secondary} strokeWidth="1.5" markerEnd="url(#arrow)" /><rect x={(x1 + x2) / 2 - 38} y={(y1 + y2) / 2 - 9} width="76" height="18" rx="4" fill="#0A0E17" /><text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="var(--font-jetbrains-mono)">{connection.label}</text></g>; })}
      {architecture.assets.map((asset) => { const position = positions.get(asset.id); if (!position) return null; const isSelected = selectedAssetId === asset.id; const isDimmed = selectedAssetId !== null && !isSelected && !architecture.connections.some((connection) => (connection.from === selectedAssetId && connection.to === asset.id) || (connection.to === selectedAssetId && connection.from === asset.id)); return <g key={asset.id} transform={`translate(${position.x} ${position.y})`} onClick={(event) => { event.stopPropagation(); selectAsset(asset.id); }} className="cursor-pointer" opacity={isDimmed ? 0.35 : 1}><rect width={NODE_WIDTH} height={NODE_HEIGHT} rx="9" fill={theme.colors.panel} stroke={isSelected ? theme.colors.primary : criticalityColor[asset.criticality]} strokeWidth={isSelected ? 2.5 : 1.5} /><circle cx="16" cy="16" r="4" fill={criticalityColor[asset.criticality]} /><text x="28" y="20" fill="#f1f5f9" fontSize="11" fontWeight="600">{asset.name.length > 19 ? `${asset.name.slice(0, 18)}…` : asset.name}</text><text x="14" y="42" fill="#94a3b8" fontSize="9">{asset.type}</text><text x="14" y="56" fill="#64748b" fontSize="9">{asset.ip || "No IP / hostname"}</text></g>; })}
    </svg></div>}
    <footer className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border px-5 py-3 font-mono text-[10px] text-slate-500"><span>Click a node to focus its paths</span>{Object.entries(criticalityColor).map(([level, color]) => <span className="inline-flex items-center gap-1.5" key={level}><i className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{level}</span>)}</footer>
  </section>;
}
