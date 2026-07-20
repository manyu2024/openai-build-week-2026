"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useAppContext } from "@/components/providers/AppProvider";
import { ASSET_TYPES, CRITICALITY_LEVELS, DEFAULT_TRUST_BOUNDARIES } from "@/lib/constants";

const inputClass = "mt-1 w-full rounded-md border border-border bg-panel-secondary px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary";

function isValidIpv4(value: string) {
  const octets = value.split(".");
  return octets.length === 4 && octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) <= 255);
}

function isValidIpv6(value: string) {
  let normalized = value;
  if (value.includes(".")) {
    const separator = value.lastIndexOf(":");
    if (separator < 0 || !isValidIpv4(value.slice(separator + 1))) return false;
    normalized = `${value.slice(0, separator)}:0:0`;
  }
  if ((normalized.match(/::/g) ?? []).length > 1) return false;
  const compressed = normalized.includes("::");
  const groups = normalized.split("::").flatMap((side) => side ? side.split(":") : []);
  return groups.every((group) => /^[0-9a-fA-F]{1,4}$/.test(group)) && (compressed ? groups.length < 8 : groups.length === 8);
}

function isValidHostname(value: string) {
  const labels = value.split(".");
  return value.length <= 253 && !(labels.length === 4 && labels.every((label) => /^\d+$/.test(label))) && labels.every((label) => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label));
}

function isValidAddress(value: string) {
  return isValidIpv4(value) || isValidIpv6(value) || isValidHostname(value);
}

export function AssetForm() {
  const { assetDraft, updateAssetDraft, addAsset, isAssetDraftComplete, isAssetIpDuplicate } = useAppContext();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const nameError = (submitted || nameTouched || assetDraft.name.length > 0) && !assetDraft.name.trim() ? "Asset name cannot be empty or contain only spaces." : "";
  const ipValue = assetDraft.ip.trim();
  const ipError = ipValue && !isValidAddress(ipValue) ? "Enter a valid IPv4 address, IPv6 address, or hostname." : "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (nameError || ipError) return;
    if (!isAssetDraftComplete) {
      setError("Complete the name, type, zone, and criticality fields before adding an asset.");
      return;
    }
    setError(addAsset() ? "" : "This IP / hostname is already assigned to an asset.");
  }

  function ignoreIncompleteEnter(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter" && !isAssetDraftComplete) event.preventDefault();
  }

  return <form className="panel p-4" onSubmit={submit} onKeyDown={ignoreIncompleteEnter}>
    <div><p className="eyebrow">Step 1</p><h2 className="mt-1 font-medium">Add asset</h2></div>
    <div className="mt-4 grid gap-3">
      <label className="text-xs text-slate-400">Asset name<input value={assetDraft.name} onChange={(event) => updateAssetDraft("name", event.target.value)} onBlur={(event) => { setNameTouched(true); updateAssetDraft("name", event.target.value.trim()); }} className={inputClass} placeholder="VPN Gateway" /></label>
      {nameError && <p className="-mt-1 text-xs text-critical" role="alert">{nameError}</p>}
      <label className="text-xs text-slate-400">Asset type<select required value={assetDraft.type} onChange={(event) => updateAssetDraft("type", event.target.value)} className={inputClass}><option value="" disabled>Select asset type</option>{ASSET_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
      <label className="text-xs text-slate-400">IP / hostname<input value={assetDraft.ip} onChange={(event) => updateAssetDraft("ip", event.target.value)} onBlur={(event) => updateAssetDraft("ip", event.target.value.trim())} className={inputClass} placeholder="10.0.0.10" /></label>
      {ipError && <p className="-mt-1 text-xs text-critical" role="alert">{ipError}</p>}
      {isAssetIpDuplicate && <p className="-mt-1 text-xs text-critical" role="alert">This IP / hostname is already assigned to another asset.</p>}
      <label className="text-xs text-slate-400">Zone / segment<select required value={assetDraft.zone} onChange={(event) => updateAssetDraft("zone", event.target.value)} className={inputClass}><option value="" disabled>Select zone</option>{DEFAULT_TRUST_BOUNDARIES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</select></label>
      <label className="text-xs text-slate-400">Criticality<select required value={assetDraft.criticality} onChange={(event) => updateAssetDraft("criticality", event.target.value)} className={inputClass}><option value="" disabled>Select criticality</option>{CRITICALITY_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}</select></label>
      <label className="text-xs text-slate-400">OS / platform <span className="text-slate-600">(optional)</span><input value={assetDraft.os} onChange={(event) => updateAssetDraft("os", event.target.value)} className={inputClass} placeholder="Ubuntu 24.04" /></label>
      <label className="text-xs text-slate-400">Notes <span className="text-slate-600">(optional)</span><textarea value={assetDraft.notes} onChange={(event) => updateAssetDraft("notes", event.target.value)} className={`${inputClass} min-h-20 resize-y`} placeholder="Role, owner, or exposure details" /></label>
    </div>
    {error && <p className="mt-3 text-xs text-critical" role="alert">{error}</p>}
    <button disabled={!isAssetDraftComplete || isAssetIpDuplicate || Boolean(ipError)} className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-[#4164f0] disabled:cursor-not-allowed disabled:opacity-45" type="submit">Add asset</button>
  </form>;
}
