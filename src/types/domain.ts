export type AssetType =
  | "Server"
  | "Database"
  | "Firewall"
  | "Workstation"
  | "Cloud Service"
  | "Network Device"
  | "Application"
  | "Other";

export type Criticality = "Low" | "Medium" | "High" | "Critical";
export type Severity = "critical" | "high" | "medium" | "low";
export type InvestigationStatus = "analyzing" | "investigating" | "resolved";
export type EvidenceType =
  | "AUTH_LOG"
  | "AUTH_SUCCESS_LOG"
  | "NETWORK_LOG"
  | "DATA_LOG"
  | "SYSTEM_LOG"
  | "ENDPOINT_LOG";
export type EvidenceGapPriority = "high" | "medium" | "low";

export interface Organization {
  name: string;
  description?: string;
  architecture: Architecture;
}

export interface Architecture {
  assets: Asset[];
  connections: Connection[];
  trustBoundaries: string[];
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  ip?: string;
  zone: string;
  criticality: Criticality;
  os?: string;
  notes?: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface Investigation {
  id: string;
  title: string;
  severity: Severity;
  status: InvestigationStatus;
  createdAt: string;
  rawInput: string;
  analysis: AnalysisResult;
}

export interface AnalysisResult {
  summary: string;
  severity: Severity;
  evidenceItems: EvidenceItem[];
  timeline: TimelineEvent[];
  hypotheses: Hypothesis[];
  evidenceGaps: EvidenceGap[];
}

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  timestamp: string;
  summary: string;
  rawContent: string;
  linkedHypotheses: number[];
  assetId?: string;
}

export interface TimelineEvent {
  evidenceId: string;
  timestamp: string;
  label: string;
  mitreTechnique?: string;
  mitreName?: string;
}

export interface AttackPathStep {
  fromAssetId: string;
  toAssetId: string;
  action: string;
}

export interface Hypothesis {
  id: number;
  title: string;
  confidence: number;
  summary: string;
  reasoning: string;
  supportingEvidence: string[];
  conflictingEvidence: string[];
  weakeningFactors: string[];
  mitreTechniques: string[];
  attackPath: AttackPathStep[];
}

export interface EvidenceGap {
  id: string;
  description: string;
  strengthens: number[];
  weakens: number[];
  priority: EvidenceGapPriority;
  status?: "open" | "checked" | "found";
}
