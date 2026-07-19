"use client";

import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { DEFAULT_TRUST_BOUNDARIES } from "@/lib/constants";
import type { Architecture, Asset, AssetType, Connection, Criticality, Organization, Severity } from "@/types";

type AssetDraft = { name: string; type: AssetType | ""; ip: string; zone: string; criticality: Criticality | ""; os: string; notes: string };
type ConnectionDraft = { from: string; to: string; label: string };
export type StoredInvestigation = { id: string; title: string; severity: Severity; createdAt: string; rawInput: string; scenarioId: string; result: unknown };
type AppContextValue = {
  organization: Organization | null; architecture: Architecture; investigations: StoredInvestigation[]; hydrated: boolean;
  createOrganization: (name: string, description: string) => void; addInvestigation: (investigation: StoredInvestigation) => void; getInvestigation: (id: string) => StoredInvestigation | undefined;
  assetDraft: AssetDraft; connectionDraft: ConnectionDraft; selectedAssetId: string | null;
  updateAssetDraft: (field: keyof AssetDraft, value: string) => void; updateConnectionDraft: (field: keyof ConnectionDraft, value: string) => void;
  addAsset: () => boolean; addConnection: () => boolean; deleteAsset: (id: string) => void; deleteConnection: (id: string) => void; isAssetDraftComplete: boolean; isAssetIpDuplicate: boolean; selectAsset: (id: string | null) => void;
};
const storageKey = "argus-app-state-v1";
const blankArchitecture: Architecture = { assets: [], connections: [], trustBoundaries: DEFAULT_TRUST_BOUNDARIES };
const initialAssetDraft: AssetDraft = { name: "", type: "", ip: "", zone: "", criticality: "", os: "", notes: "" };
const initialConnectionDraft: ConnectionDraft = { from: "", to: "", label: "" };
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [architecture, setArchitecture] = useState<Architecture>(blankArchitecture);
  const [investigations, setInvestigations] = useState<StoredInvestigation[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [assetDraft, setAssetDraft] = useState<AssetDraft>(initialAssetDraft);
  const [connectionDraft, setConnectionDraft] = useState<ConnectionDraft>(initialConnectionDraft);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  useEffect(() => { try { const saved = localStorage.getItem(storageKey); if (saved) { const state = JSON.parse(saved) as { organization?: Organization; architecture?: Architecture; investigations?: StoredInvestigation[] }; setOrganization(state.organization ?? null); setArchitecture(state.architecture ?? state.organization?.architecture ?? blankArchitecture); setInvestigations(state.investigations ?? []); } } catch { localStorage.removeItem(storageKey); } finally { setHydrated(true); } }, []);
  useEffect(() => { if (!hydrated) return; localStorage.setItem(storageKey, JSON.stringify({ organization: organization ? { ...organization, architecture } : null, architecture, investigations })); }, [architecture, hydrated, investigations, organization]);

  const normalizedDraftIp = assetDraft.ip.trim().toLowerCase();
  const isAssetIpDuplicate = Boolean(normalizedDraftIp) && architecture.assets.some((asset) => asset.ip?.trim().toLowerCase() === normalizedDraftIp);
  const isAssetDraftComplete = Boolean(assetDraft.name.trim() && assetDraft.type && assetDraft.zone && assetDraft.criticality);
  const value = useMemo<AppContextValue>(() => ({
    organization, architecture, investigations, hydrated,
    createOrganization: (name, description) => setOrganization({ name: name.trim(), ...(description.trim() ? { description: description.trim() } : {}), architecture }),
    addInvestigation: (investigation) => setInvestigations((current) => [investigation, ...current.filter((item) => item.id !== investigation.id)]),
    getInvestigation: (id) => investigations.find((item) => item.id === id),
    assetDraft, connectionDraft, selectedAssetId,
    updateAssetDraft: (field, nextValue) => setAssetDraft((draft) => ({ ...draft, [field]: nextValue })), updateConnectionDraft: (field, nextValue) => setConnectionDraft((draft) => ({ ...draft, [field]: nextValue })),
    addAsset: () => { if (!isAssetDraftComplete || isAssetIpDuplicate) return false; const asset: Asset = { id: `asset-${crypto.randomUUID()}`, name: assetDraft.name.trim(), type: assetDraft.type as AssetType, ...(assetDraft.ip.trim() ? { ip: assetDraft.ip.trim() } : {}), zone: assetDraft.zone, criticality: assetDraft.criticality as Criticality, ...(assetDraft.os.trim() ? { os: assetDraft.os.trim() } : {}), ...(assetDraft.notes.trim() ? { notes: assetDraft.notes.trim() } : {}) }; setArchitecture((current) => ({ ...current, assets: [...current.assets, asset], trustBoundaries: Array.from(new Set([...current.trustBoundaries, asset.zone])) })); setAssetDraft(initialAssetDraft); setSelectedAssetId(asset.id); return true; },
    addConnection: () => { if (!connectionDraft.from || !connectionDraft.to || connectionDraft.from === connectionDraft.to || !connectionDraft.label.trim()) return false; const connection: Connection = { id: `connection-${crypto.randomUUID()}`, from: connectionDraft.from, to: connectionDraft.to, label: connectionDraft.label.trim() }; setArchitecture((current) => ({ ...current, connections: [...current.connections, connection] })); setConnectionDraft(initialConnectionDraft); return true; },
    deleteAsset: (id) => { setArchitecture((current) => ({ ...current, assets: current.assets.filter((asset) => asset.id !== id), connections: current.connections.filter((connection) => connection.from !== id && connection.to !== id) })); setConnectionDraft((draft) => ({ ...draft, from: draft.from === id ? "" : draft.from, to: draft.to === id ? "" : draft.to })); setSelectedAssetId((current) => current === id ? null : current); },
    deleteConnection: (id) => setArchitecture((current) => ({ ...current, connections: current.connections.filter((connection) => connection.id !== id) })),
    isAssetDraftComplete, isAssetIpDuplicate, selectAsset: setSelectedAssetId,
  }), [architecture, assetDraft, connectionDraft, hydrated, investigations, isAssetDraftComplete, isAssetIpDuplicate, organization, selectedAssetId]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useAppContext() { const context = useContext(AppContext); if (!context) throw new Error("useAppContext must be used inside AppProvider"); return context; }
