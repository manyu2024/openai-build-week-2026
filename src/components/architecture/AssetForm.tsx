"use client";

import { useState, type FormEvent } from "react";
import { useAppContext } from "@/components/providers/AppProvider";
import { ASSET_TYPES, CRITICALITY_LEVELS, DEFAULT_TRUST_BOUNDARIES } from "@/lib/constants";

const inputClass = "mt-1 w-full rounded-md border border-border bg-panel-secondary px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary";

export function AssetForm() {
  const { assetDraft, updateAssetDraft, addAsset } = useAppContext();
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(addAsset() ? "" : "An asset name is required.");
  }

  return <form className="panel p-4" onSubmit={submit}>
    <div><p className="eyebrow">Step 1</p><h2 className="mt-1 font-medium">Add asset</h2></div>
    <div className="mt-4 grid gap-3">
      <label className="text-xs text-slate-400">Asset name<input required value={assetDraft.name} onChange={(event) => updateAssetDraft("name", event.target.value)} className={inputClass} placeholder="VPN Gateway" /></label>
      <label className="text-xs text-slate-400">Asset type<select value={assetDraft.type} onChange={(event) => updateAssetDraft("type", event.target.value)} className={inputClass}>{ASSET_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
      <label className="text-xs text-slate-400">IP / hostname<input value={assetDraft.ip} onChange={(event) => updateAssetDraft("ip", event.target.value)} className={inputClass} placeholder="10.0.0.10" /></label>
      <label className="text-xs text-slate-400">Zone / segment<select value={assetDraft.zone} onChange={(event) => updateAssetDraft("zone", event.target.value)} className={inputClass}>{DEFAULT_TRUST_BOUNDARIES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</select></label>
      <label className="text-xs text-slate-400">Criticality<select value={assetDraft.criticality} onChange={(event) => updateAssetDraft("criticality", event.target.value)} className={inputClass}>{CRITICALITY_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}</select></label>
      <label className="text-xs text-slate-400">OS / platform <span className="text-slate-600">(optional)</span><input value={assetDraft.os} onChange={(event) => updateAssetDraft("os", event.target.value)} className={inputClass} placeholder="Ubuntu 24.04" /></label>
      <label className="text-xs text-slate-400">Notes <span className="text-slate-600">(optional)</span><textarea value={assetDraft.notes} onChange={(event) => updateAssetDraft("notes", event.target.value)} className={`${inputClass} min-h-20 resize-y`} placeholder="Role, owner, or exposure details" /></label>
    </div>
    {error && <p className="mt-3 text-xs text-critical" role="alert">{error}</p>}
    <button className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-[#4164f0]" type="submit">Add asset</button>
  </form>;
}
