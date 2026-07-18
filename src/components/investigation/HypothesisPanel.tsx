import { EvidenceGaps } from "./EvidenceGaps";
import { HypothesisCard } from "./HypothesisCard";
export function HypothesisPanel() { return <aside className="space-y-3"><section className="panel p-4"><h2 className="text-sm font-semibold">Hypotheses</h2><div className="mt-3"><HypothesisCard /></div></section><EvidenceGaps /></aside>; }
