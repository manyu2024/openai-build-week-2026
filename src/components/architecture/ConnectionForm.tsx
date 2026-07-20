"use client";

import { useState, type FormEvent } from "react";
import { useAppContext } from "@/components/providers/AppProvider";

const inputClass = "mt-1 w-full rounded-md border border-border bg-panel-secondary px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50";

export function ConnectionForm() {
  const { architecture, connectionDraft, updateConnectionDraft, addConnection, deleteConnection } = useAppContext();
  const [error, setError] = useState("");
  const [labelTouched, setLabelTouched] = useState(false);
  const hasAssets = architecture.assets.length > 1;
  const labelError = (labelTouched || connectionDraft.label.length > 0) && !connectionDraft.label.trim() ? "Protocol / port label cannot be empty." : "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLabelTouched(true);
    if (!connectionDraft.label.trim()) return;
    setError(addConnection() ? "" : "Choose two different assets.");
  }

  const assetName = (id: string) => architecture.assets.find((asset) => asset.id === id)?.name ?? "Unknown asset";
  const removeConnection = (id: string) => { if (window.confirm("Are you sure you want to remove this connection?")) deleteConnection(id); };
  return <form className="panel p-4" onSubmit={submit}>
    <div><p className="eyebrow">Step 2</p><h2 className="mt-1 font-medium">Add connection</h2></div>
    <p className="mt-2 text-xs leading-5 text-slate-500">{hasAssets ? "Define the permitted or observed path between assets." : "Add at least two assets before defining a connection."}</p>
    <div className="mt-4 grid gap-3">
      <label className="text-xs text-slate-400">Source asset<select disabled={!hasAssets} value={connectionDraft.from} onChange={(event) => updateConnectionDraft("from", event.target.value)} className={inputClass}><option value="">Select source</option>{architecture.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.zone}</option>)}</select></label>
      <label className="text-xs text-slate-400">Destination asset<select disabled={!hasAssets} value={connectionDraft.to} onChange={(event) => updateConnectionDraft("to", event.target.value)} className={inputClass}><option value="">Select destination</option>{architecture.assets.map((asset) => <option key={asset.id} value={asset.id} disabled={asset.id === connectionDraft.from}>{asset.name} · {asset.zone}</option>)}</select></label>
      <label className="text-xs text-slate-400">Protocol / port label<input disabled={!hasAssets} value={connectionDraft.label} onChange={(event) => updateConnectionDraft("label", event.target.value)} onBlur={(event) => { setLabelTouched(true); updateConnectionDraft("label", event.target.value.trim()); }} className={inputClass} placeholder="HTTPS 443" /></label>
      {labelError && <p className="-mt-1 text-xs text-critical" role="alert">{labelError}</p>}
    </div>
    {error && <p className="mt-3 text-xs text-critical" role="alert">{error}</p>}
    <button disabled={!hasAssets} className="mt-4 w-full rounded-md bg-panel-secondary px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50" type="submit">Add connection</button>
    {architecture.connections.length > 0 && <section className="mt-5 border-t border-border pt-4"><div className="flex items-center justify-between"><h3 className="text-xs font-medium text-slate-200">Existing connections</h3><span className="font-mono text-[10px] text-slate-500">{architecture.connections.length}</span></div><ul className="mt-2 space-y-2">{architecture.connections.map((connection) => <li key={connection.id} className="flex items-center gap-2 rounded border border-border bg-panel-secondary p-2"><p className="min-w-0 flex-1 font-mono text-[10px] leading-4 text-slate-400"><span className="text-slate-200">{assetName(connection.from)}</span> → <span className="text-slate-200">{assetName(connection.to)}</span><span className="block text-cyan">{connection.label}</span></p><button type="button" onClick={() => removeConnection(connection.id)} className="grid h-6 w-6 shrink-0 place-items-center rounded text-sm font-bold text-critical transition hover:bg-critical hover:text-white" aria-label={`Delete connection ${connection.label}`}>×</button></li>)}</ul></section>}
  </form>;
}
