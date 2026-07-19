"use client";

import { useAppContext } from "@/components/providers/AppProvider";
import { AssetForm } from "./AssetForm";
import { ConnectionForm } from "./ConnectionForm";
import { ArchitectureGraph } from "./ArchitectureGraph";

export function ArchitectureBuilder() {
  const { architecture, deleteAsset } = useAppContext();
  const confirmDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this asset? Its connections will also be removed.")) deleteAsset(id);
  };
  return <section><header><p className="eyebrow">Architecture builder</p><h1 className="mt-1 text-2xl font-semibold">Define your infrastructure</h1></header><div className="mt-6 grid gap-4 xl:grid-cols-[360px_1fr]"><div className="space-y-4"><AssetForm /><ConnectionForm /><section className="panel p-4"><div className="flex items-center justify-between"><h2 className="font-medium">Assets</h2><span className="font-mono text-[10px] text-slate-500">{architecture.assets.length}</span></div>{architecture.assets.length === 0 ? <p className="mt-3 text-xs text-slate-500">No assets added yet.</p> : <ul className="mt-3 space-y-2">{architecture.assets.map((asset) => <li key={asset.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-panel-secondary px-3 py-2"><div className="min-w-0"><p className="truncate text-sm text-slate-200">{asset.name}</p><p className="truncate font-mono text-[10px] text-slate-500">{asset.type} · {asset.ip || asset.zone}</p></div><button type="button" onClick={() => confirmDelete(asset.id)} className="grid h-5 w-5 shrink-0 place-items-center rounded text-xs font-bold text-critical transition hover:bg-critical hover:text-white" aria-label={`Delete ${asset.name}`}>×</button></li>)}</ul>}</section></div><ArchitectureGraph /></div></section>;
}
