"use client";

import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { DEFAULT_TRUST_BOUNDARIES } from "@/lib/constants";
import type { Architecture, Asset, AssetType, Connection, Criticality } from "@/types";

type AssetDraft = {
  name: string;
  type: AssetType;
  ip: string;
  zone: string;
  criticality: Criticality;
  os: string;
  notes: string;
};

type ConnectionDraft = { from: string; to: string; label: string };

type AppContextValue = {
  architecture: Architecture;
  assetDraft: AssetDraft;
  connectionDraft: ConnectionDraft;
  selectedAssetId: string | null;
  updateAssetDraft: (field: keyof AssetDraft, value: string) => void;
  updateConnectionDraft: (field: keyof ConnectionDraft, value: string) => void;
  addAsset: () => boolean;
  addConnection: () => boolean;
  selectAsset: (id: string | null) => void;
};

const initialAssetDraft: AssetDraft = {
  name: "",
  type: "Server",
  ip: "",
  zone: "Internal",
  criticality: "Medium",
  os: "",
  notes: "",
};

const initialConnectionDraft: ConnectionDraft = { from: "", to: "", label: "" };

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [architecture, setArchitecture] = useState<Architecture>({
    assets: [],
    connections: [],
    trustBoundaries: DEFAULT_TRUST_BOUNDARIES,
  });
  const [assetDraft, setAssetDraft] = useState<AssetDraft>(initialAssetDraft);
  const [connectionDraft, setConnectionDraft] = useState<ConnectionDraft>(initialConnectionDraft);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const value = useMemo<AppContextValue>(() => ({
    architecture,
    assetDraft,
    connectionDraft,
    selectedAssetId,
    updateAssetDraft: (field, value) => setAssetDraft((draft) => ({ ...draft, [field]: value })),
    updateConnectionDraft: (field, value) => setConnectionDraft((draft) => ({ ...draft, [field]: value })),
    addAsset: () => {
      if (!assetDraft.name.trim()) return false;

      const asset: Asset = {
        id: `asset-${crypto.randomUUID()}`,
        name: assetDraft.name.trim(),
        type: assetDraft.type,
        ...(assetDraft.ip.trim() ? { ip: assetDraft.ip.trim() } : {}),
        zone: assetDraft.zone,
        criticality: assetDraft.criticality,
        ...(assetDraft.os.trim() ? { os: assetDraft.os.trim() } : {}),
        ...(assetDraft.notes.trim() ? { notes: assetDraft.notes.trim() } : {}),
      };

      setArchitecture((current) => ({
        ...current,
        assets: [...current.assets, asset],
        trustBoundaries: Array.from(new Set([...current.trustBoundaries, asset.zone])),
      }));
      setAssetDraft(initialAssetDraft);
      setSelectedAssetId(asset.id);
      return true;
    },
    addConnection: () => {
      if (!connectionDraft.from || !connectionDraft.to || connectionDraft.from === connectionDraft.to || !connectionDraft.label.trim()) return false;

      const connection: Connection = {
        id: `connection-${crypto.randomUUID()}`,
        from: connectionDraft.from,
        to: connectionDraft.to,
        label: connectionDraft.label.trim(),
      };
      setArchitecture((current) => ({ ...current, connections: [...current.connections, connection] }));
      setConnectionDraft(initialConnectionDraft);
      return true;
    },
    selectAsset: setSelectedAssetId,
  }), [architecture, assetDraft, connectionDraft, selectedAssetId]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used inside AppProvider");
  return context;
}
