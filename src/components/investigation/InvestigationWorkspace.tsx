import { EvidenceFeed } from "./EvidenceFeed";
import { HypothesisPanel } from "./HypothesisPanel";
import { VisualWorkspace } from "./VisualWorkspace";
import { ExportReportButton } from "./ExportReportButton";
export function InvestigationWorkspace({ investigationId }: { investigationId: string }) { return <section><header className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Investigation {investigationId}</p><h1 className="text-xl font-semibold">Incident analysis</h1></div><ExportReportButton /></header><div className="grid min-h-[calc(100vh-7rem)] gap-3 xl:grid-cols-[30fr_45fr_25fr]"><EvidenceFeed /><VisualWorkspace /><HypothesisPanel /></div></section>; }
