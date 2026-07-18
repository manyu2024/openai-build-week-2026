import type { AssetType, Criticality } from "@/types";

export const ASSET_TYPES: AssetType[] = ["Server", "Database", "Firewall", "Workstation", "Cloud Service", "Network Device", "Application", "Other"];
export const CRITICALITY_LEVELS: Criticality[] = ["Low", "Medium", "High", "Critical"];
export const DEFAULT_TRUST_BOUNDARIES = ["Perimeter", "DMZ", "Internal", "Core", "Cloud"];
