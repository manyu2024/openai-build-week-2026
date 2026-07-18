import type { AnalysisResult, Architecture } from "@/types/domain";

export interface AnalyzeRequest {
  architecture: Architecture;
  rawLogs: string;
}

export type AnalyzeResponse = AnalysisResult;

export interface ApiError {
  error: string;
}
