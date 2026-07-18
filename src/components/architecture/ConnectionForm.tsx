"use client";

import { useState, type FormEvent } from "react";
import { useAppContext } from "@/components/providers/AppProvider";

const inputClass = "mt-1 w-full rounded-md border border-border bg-panel-secondary px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50";

export function ConnectionForm() {
  const { architecture, connectionDraft, updateConnectionDraft, addConnection } = useAppContext();
  const [error, setError] = useState("");
  const hasAssets = architecture.assets.length > 1;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(addConnection() ? "" : "Choose two different assets and enter a protocol label.");
  }

  return <form className="panel p-4" onSubmit={submit}>
    <div><p className="eyebrow">Step 2</p><h2 className="mt-1 font-medium">Add connection</h2></div>
    <p className="mt-2 text-xs leading-5 text-slate-500">{hasAssets ? "Define the permitted or observed path between assets." : "Add at least two assets before defining a connection."}</p>
    <div className="mt-4 grid gap-3">
      <label className="text-xs text-slate-400">Source asset<select disabled={!hasAssets} value={connectionDraft.from} onChange={(event) => updateConnectionDraft("from", event.target.value)} className={inputClass}><option value="">Select source</option>{architecture.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.zone}</option>)}</select></label>
      <label className="text-xs text-slate-400">Destination asset<select disabled={!hasAssets} value={connectionDraft.to} onChange={(event) => updateConnectionDraft("to", event.target.value)} className={inputClass}><option value="">Select destination</option>{architecture.assets.map((asset) => <option key={asset.id} value={asset.id} disabled={asset.id === connectionDraft.from}>{asset.name} · {asset.zone}</option>)}</select></label>
      <label className="text-xs text-slate-400">Protocol / port label<input disabled={!hasAssets} value={connectionDraft.label} onChange={(event) => updateConnectionDraft("label", event.target.value)} className={inputClass} placeholder="HTTPS 443" /></label>
    </div>
    {error && <p className="mt-3 text-xs text-critical" role="alert">{error}</p>}
    <button disabled={!hasAssets} className="mt-4 w-full rounded-md bg-panel-secondary px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50" type="submit">Add connection</button>
  </form>;
}
