"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/components/providers/AppProvider";
import credentialCompromise from "@/data/scenarios/credential-compromise.json";
import ransomware from "@/data/scenarios/ransomware-lateral-movement.json";
import insiderThreat from "@/data/scenarios/insider-threat-data-staging.json";

type EvidenceType = "AUTH_LOG" | "NETWORK_LOG" | "DATA_LOG" | "SYSTEM_LOG" | "ENDPOINT_LOG";
type Scenario = typeof credentialCompromise;
const scenarios: Record<string, Scenario> = { "credential-compromise": credentialCompromise, "ransomware-lateral-movement": ransomware as Scenario, "insider-threat-data-staging": insiderThreat as Scenario };
const typeStyles: Record<EvidenceType, string> = { AUTH_LOG: "bg-low/15 text-low border-low/30", NETWORK_LOG: "bg-network/15 text-network border-network/30", DATA_LOG: "bg-critical/15 text-critical border-critical/30", SYSTEM_LOG: "bg-medium/15 text-medium border-medium/30", ENDPOINT_LOG: "bg-cyan/15 text-cyan border-cyan/30" };
const typeColors: Record<EvidenceType, string> = { AUTH_LOG: "#4096FF", NETWORK_LOG: "#B37FEB", DATA_LOG: "#FF4D4F", SYSTEM_LOG: "#FFA940", ENDPOINT_LOG: "#13C2C2" };
const severityStyles = { critical: "border-critical/30 bg-critical/15 text-critical", high: "border-medium/30 bg-medium/15 text-medium", medium: "border-low/30 bg-low/15 text-low", low: "border-safe/30 bg-safe/15 text-safe" };

export default function InvestigationView({ params }: { params: { id: string } }) {
  const { architecture, organization, getInvestigation } = useAppContext();
  const stored = getInvestigation(params.id);
  const scenario = scenarios[stored?.scenarioId ?? params.id] ?? credentialCompromise;
  const [selectedHypothesis, setSelectedHypothesis] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [tab, setTab] = useState<"timeline" | "graph">("timeline");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checkedGaps, setCheckedGaps] = useState<string[]>([]);
  const selected = scenario.hypotheses.find((hypothesis) => hypothesis.id === selectedHypothesis);
  const visibleEvidence = useMemo(() => scenario.evidenceItems.filter((item) => !selectedHypothesis || item.linkedHypotheses.includes(selectedHypothesis)), [scenario, selectedHypothesis]);
  const timelineNodes = scenario.evidenceItems.map((item) => {
    const event = scenario.timeline.find((candidate) => candidate.evidenceId === item.id);
    return { evidenceId: item.id, label: event?.label ?? item.summary, technique: event?.technique ?? "OBSERVED", relevant: !selectedHypothesis || item.linkedHypotheses.includes(selectedHypothesis) };
  });
  const graphNodes = selected?.path ?? ["Internet", "VPN Gateway", "File Server", "Cloud Storage"];
  const title = stored?.title ?? scenario.name;
  const severity = stored?.severity ?? "high";
  const createdAt = stored?.createdAt ?? new Date().toISOString();

  function exportReport() {
    const allPathNodes = new Set(scenario.hypotheses.flatMap((hypothesis) => hypothesis.path ?? []));
    const involvedAssets = architecture.assets.filter((asset) => allPathNodes.has(asset.name));
    const involvedAssetIds = new Set(involvedAssets.map((asset) => asset.id));
    const involvedConnections = architecture.connections.filter((connection) => involvedAssetIds.has(connection.from) || involvedAssetIds.has(connection.to));
    const assetName = (id: string) => architecture.assets.find((asset) => asset.id === id)?.name ?? id;
    const supportingEvidence = (hypothesisId: string) => scenario.evidenceItems.filter((item) => item.linkedHypotheses.includes(hypothesisId));
    const markdown = [
      "# ARGUS Incident Investigation Report",
      "",
      `## ${title}`,
      "",
      `- **Severity:** ${severity.toUpperCase()}`,
      `- **Investigation timestamp:** ${new Date(createdAt).toLocaleString()}`,
      `- **Organization:** ${organization?.name ?? "Not specified"}`,
      "",
      "## Executive Summary",
      "",
      scenario.summary,
      "",
      "## Architecture Context",
      "",
      "### Assets involved",
      ...(involvedAssets.length ? involvedAssets.map((asset) => `- **${asset.name}** — ${asset.type}; zone: ${asset.zone}; criticality: ${asset.criticality}${asset.ip ? `; address: ${asset.ip}` : ""}`) : ["- No matching organization assets were identified. Refer to the attack paths below for the observed systems."]),
      "",
      "### Connections involved",
      ...(involvedConnections.length ? involvedConnections.map((connection) => `- ${assetName(connection.from)} → ${assetName(connection.to)} (${connection.label})`) : ["- No matching architecture connections were identified."]),
      "",
      "## Competing Hypotheses",
      "",
      ...scenario.hypotheses.flatMap((hypothesis) => {
        const evidence = supportingEvidence(hypothesis.id);
        return [
          `### ${hypothesis.title} — ${hypothesis.confidence}% confidence`,
          "",
          hypothesis.summary,
          "",
          "**Full reasoning**",
          "",
          hypothesis.reasoning,
          "",
          "**Supporting evidence**",
          ...(evidence.length ? evidence.map((item) => `- ${item.timestamp} — ${item.summary}`) : ["- No linked supporting evidence recorded."]),
          "",
          "**Conflicting evidence**",
          ...(hypothesis.conflicting > 0 ? [`- ${hypothesis.conflicting} conflicting evidence item${hypothesis.conflicting === 1 ? "" : "s"} identified by analysis.`] : ["- No conflicting evidence identified."]),
          "",
          `**MITRE ATT&CK:** ${hypothesis.techniques.map((technique) => `\`${technique}\``).join(", ")}`,
          "",
          "**Attack path**",
          ...(hypothesis.path?.length ? [`- ${hypothesis.path.join(" → ")}`] : ["- No attack path mapped."]),
          "",
        ];
      }),
      "## Evidence Timeline",
      "",
      ...timelineNodes.map((event) => { const item = scenario.evidenceItems.find((evidence) => evidence.id === event.evidenceId)!; return `- **${item.timestamp}** — ${event.label} (${event.technique}); ${item.summary}`; }),
      "",
      "## Evidence Gaps and Recommended Next Steps",
      "",
      ...scenario.evidenceGaps.map((gap) => `- **[HIGH] ${gap.description}**  \n  Strengthens: ${gap.strengthens}; Weakens: ${gap.weakens}`),
      "",
      "---",
      "",
      "*Generated by ARGUS — Security Incident Reasoning Platform*",
      "",
    ].join("\n");
    const fileName = `ARGUS-Report-${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.md`;
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  return <main className="min-h-screen bg-canvas p-4 text-slate-100 lg:p-5">
    <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4"><div><Link href="/" className="font-mono text-[10px] uppercase tracking-[.16em] text-cyan hover:text-slate-100">← Dashboard</Link><p className="mt-2 font-mono text-[10px] uppercase tracking-[.16em] text-slate-500">Investigation / {params.id}</p><div className="mt-1 flex flex-wrap items-center gap-2"><h1 className="text-xl font-semibold">{title}</h1><span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-medium uppercase ${severityStyles[severity]}`}>{severity}</span></div><p className="mt-1 max-w-3xl text-xs text-slate-500">{scenario.summary}</p></div><button onClick={exportReport} className="rounded border border-border bg-panel px-3 py-2 text-xs text-slate-300 hover:border-border-hover">Export report</button></header>
    <div className="grid min-h-[calc(100vh-118px)] gap-4 xl:grid-cols-[30fr_45fr_25fr]">
      <aside className="flex min-h-0 flex-col rounded-xl border border-border bg-panel p-3">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Evidence feed</h2><span className="font-mono text-[10px] text-slate-500">{visibleEvidence.length} ITEMS</span></div>
        <div className="min-h-0 space-y-2 overflow-y-auto pr-1 xl:max-h-[calc(100vh-172px)]">{scenario.evidenceItems.map((item) => { const visible = !selectedHypothesis || item.linkedHypotheses.includes(selectedHypothesis); const active = selectedEvidence === item.id; return <button key={item.id} onClick={() => { setSelectedEvidence(item.id); setTab("timeline"); }} className={`w-full rounded-lg border p-3 text-left transition ${active ? "border-primary bg-primary/10" : "border-border bg-panel-secondary hover:border-border-hover"} ${visible ? "opacity-100" : "opacity-25"}`}><div className="flex items-center justify-between gap-2"><span className={`rounded border px-1.5 py-0.5 font-mono text-[9.5px] ${typeStyles[item.type as EvidenceType]}`}>{item.type}</span><time className="font-mono text-[10px] text-slate-500">{item.timestamp}</time></div><p className="mt-2 text-xs leading-5 text-slate-300">{item.summary}</p><p className="mt-2 font-mono text-[9px] text-slate-600">LINKED: {item.linkedHypotheses.join(" · ").toUpperCase()}</p></button> })}</div>
      </aside>
      <section className="flex min-h-[480px] min-w-0 flex-col rounded-xl border border-border bg-panel p-4">
        <div className="flex gap-5 border-b border-border"><button onClick={() => setTab("timeline")} className={`border-b-2 pb-3 text-sm ${tab === "timeline" ? "border-cyan text-cyan" : "border-transparent text-slate-500"}`}>Timeline</button><button onClick={() => setTab("graph")} className={`border-b-2 pb-3 text-sm ${tab === "graph" ? "border-cyan text-cyan" : "border-transparent text-slate-500"}`}>Attack Graph</button><span className="ml-auto pt-1 font-mono text-[10px] text-slate-600">{selected ? "FILTERED THEORY" : "ALL EVIDENCE"}</span></div>
        {tab === "timeline" ? <Timeline events={timelineNodes} evidence={scenario.evidenceItems} selectedEvidence={selectedEvidence} /> : <AttackGraph hypotheses={scenario.hypotheses} selected={selected} />}
      </section>
      <aside className="min-h-0 min-w-0 space-y-4 xl:max-h-[calc(100vh-118px)] xl:overflow-y-auto xl:pr-1">
        <section className="rounded-xl border border-border bg-panel p-3"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Hypotheses</h2>{selected && <button onClick={() => setSelectedHypothesis(null)} className="font-mono text-[10px] text-cyan">CLEAR</button>}</div><div className="space-y-2">{scenario.hypotheses.map((hypothesis) => { const active = selectedHypothesis === hypothesis.id; return <article key={hypothesis.id} className={`rounded-lg border transition ${active ? "border-primary bg-primary/10" : "border-border bg-panel-secondary"}`}><button onClick={() => setSelectedHypothesis(active ? null : hypothesis.id)} className="w-full p-3 text-left"><div className="flex gap-2"><h3 className="flex-1 text-xs font-semibold leading-5 text-slate-100">{hypothesis.title}</h3><span className="font-mono text-xs text-cyan">{hypothesis.confidence}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded bg-border"><div className="h-full rounded bg-primary" style={{ width: `${hypothesis.confidence}%` }} /></div><p className="mt-2 text-[11px] leading-4 text-slate-400">{hypothesis.summary}</p><div className="mt-2 flex gap-3 font-mono text-[9px]"><span className="text-safe">+ {hypothesis.supporting} SUPPORT</span><span className="text-critical">− {hypothesis.conflicting} CONFLICT</span></div><div className="mt-2 flex flex-wrap gap-1">{hypothesis.techniques.map((technique) => <span key={technique} className="rounded bg-border px-1.5 py-0.5 font-mono text-[9px] text-slate-400">{technique}</span>)}</div></button><button onClick={() => setExpanded(expanded === hypothesis.id ? null : hypothesis.id)} className="w-full border-t border-border px-3 py-2 text-left font-mono text-[10px] text-cyan">{expanded === hypothesis.id ? "− HIDE REASONING" : "+ FULL REASONING"}</button>{expanded === hypothesis.id && <p className="border-t border-border px-3 py-2 text-[11px] leading-5 text-slate-400">{hypothesis.reasoning}</p>}</article> })}</div></section>
        <section className="rounded-xl border border-border bg-panel p-3"><h2 className="text-sm font-semibold">Missing Evidence <span className="font-normal text-slate-500">— What to check next</span></h2><div className="mt-3 space-y-3">{scenario.evidenceGaps.map((gap) => <label key={gap.id} className="flex cursor-pointer gap-2.5 rounded-lg border border-border bg-panel-secondary p-2.5"><input type="checkbox" checked={checkedGaps.includes(gap.id)} onChange={() => setCheckedGaps((current) => current.includes(gap.id) ? current.filter((id) => id !== gap.id) : [...current, gap.id])} className="mt-0.5 accent-cyan" /><span><span className={`block text-[11px] leading-4 ${checkedGaps.includes(gap.id) ? "text-slate-600 line-through" : "text-slate-300"}`}>{gap.description}</span><span className="mt-1 block font-mono text-[9px] leading-4 text-slate-500"><b className="font-normal text-safe">↑ {gap.strengthens}</b> · <b className="font-normal text-critical">↓ {gap.weakens}</b></span></span></label>)}</div></section>
      </aside>
    </div>
  </main>;
}

type TimelineNode = { evidenceId: string; label: string; technique: string; relevant: boolean };
function Timeline({ events, evidence, selectedEvidence }: { events: TimelineNode[]; evidence: Scenario["evidenceItems"]; selectedEvidence: string | null }) {
  const spacing = 150;
  const timelineWidth = Math.max(900, events.length * spacing + 120);
  const truncate = (label: string) => label.length > 20 ? `${label.slice(0, 20)}…` : label;
  const connectingPath = events.slice(1).map((_, index) => { const start = 60 + index * spacing; const end = start + spacing; return `C ${start + spacing / 3} 112, ${end - spacing / 3} 148, ${end} 130`; }).join(" ");
  return <div className="flex min-w-0 flex-1 flex-col justify-center overflow-x-auto py-8"><div className="min-w-max px-3"><svg viewBox={`0 0 ${timelineWidth} 260`} width={timelineWidth} height="260" className="block overflow-visible"><path d={`M 60 130 ${connectingPath}`} fill="none" stroke="#13C2C2" strokeWidth="2" opacity=".9"/>{events.map((event, index) => { const item = evidence.find((entry) => entry.id === event.evidenceId)!; const x = 60 + index * spacing; const isAbove = index % 2 === 0; const active = selectedEvidence === event.evidenceId; const labelY = isAbove ? 54 : 208; const detailY = isAbove ? 74 : 228; return <g key={event.evidenceId} opacity={event.relevant ? 1 : .22}><title>{event.label}</title><circle cx={x} cy="130" r={active ? 15 : 10} fill={typeColors[item.type as EvidenceType]} className={active ? "animate-pulse" : ""} stroke="#0A0E17" strokeWidth="5"/><text x={x} y={isAbove ? 105 : 158} textAnchor="middle" fill="#13C2C2" fontSize="11" fontFamily="monospace">{event.technique}</text><text x={x} y={labelY} textAnchor="middle" fill="#CBD5E1" fontSize="11">{truncate(event.label)}</text><text x={x} y={detailY} textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="monospace">{item.timestamp}</text></g> })}</svg></div><div className="mx-auto mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono text-[9px] text-slate-500">{Object.entries(typeColors).map(([type, color]) => <span key={type}><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />{type.replace("_", " ")}</span>)}</div></div>;
}

function AttackGraph({ hypotheses, selected }: { hypotheses: Scenario["hypotheses"]; selected: Scenario["hypotheses"][number] | undefined }) {
  const allNodes = Array.from(new Set(hypotheses.flatMap((hypothesis) => hypothesis.path ?? [])));
  const columns = Math.max(3, Math.ceil(allNodes.length / 2));
  const width = Math.max(900, columns * 240 + 80);
  const positions = new Map(allNodes.map((node, index) => [node, { x: 130 + (index % columns) * 240, y: 90 + Math.floor(index / columns) * 140 }]));
  const compromised = new Set(selected?.path ?? []);
  const truncate = (name: string) => name.length > 22 ? `${name.slice(0, 22)}…` : name;
  const segments = selected ? selected.path.slice(1).map((to, index) => ({ from: selected.path[index], to, key: `${selected.id}-${index}` })) : [];
  const connectionPath = (from: string, to: string) => { const start = positions.get(from)!; const end = positions.get(to)!; const dx = end.x - start.x; const dy = end.y - start.y; const boundaryRatio = 1 / Math.max(Math.abs(dx) / 90, Math.abs(dy) / 27, 1); const startX = start.x + dx * boundaryRatio * 1.04; const startY = start.y + dy * boundaryRatio * 1.04; const endX = end.x - dx * boundaryRatio * 1.12; const endY = end.y - dy * boundaryRatio * 1.12; const midX = (startX + endX) / 2; const midY = (startY + endY) / 2; const bend = dy === 0 ? -24 : 0; return `M ${startX} ${startY} Q ${midX} ${midY + bend} ${endX} ${endY}`; };
  return <div className="flex flex-1 items-center overflow-x-auto py-8"><div className="min-w-max px-4"><svg viewBox={`0 0 ${width} 280`} width={width} height="280" className="block overflow-visible"><defs><filter id="red-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="blur"/><feFlood floodColor="#FF4D4F" floodOpacity=".9" result="red"/><feComposite in="red" in2="blur" operator="in" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter><marker id="attack-arrow" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L6,3 L0,6" fill="#FF4D4F" stroke="#FF4D4F"/></marker></defs>{segments.map((segment) => <path key={segment.key} d={connectionPath(segment.from, segment.to)} fill="none" stroke="#FF4D4F" strokeWidth="3" strokeDasharray="8 8" markerEnd="url(#attack-arrow)" className="attack-trace"/>)}{allNodes.map((node) => { const point = positions.get(node)!; const isCompromised = compromised.has(node); const role = selected?.path[0] === node ? "ENTRY" : selected?.path[selected.path.length - 1] === node ? "TARGET" : isCompromised ? "COMPROMISED" : "ARCHITECTURE NODE"; const roleColor = role === "ENTRY" ? "#52C41A" : role === "TARGET" || role === "COMPROMISED" ? "#FF4D4F" : "#64748B"; return <g key={node} transform={`translate(${point.x},${point.y})`} opacity={selected && !isCompromised ? .28 : 1}><title>{node}</title><rect x="-90" y="-27" width="180" height="54" rx="8" fill="#151D2E" stroke={isCompromised ? roleColor : "#2A3B57"} strokeWidth="1.5" filter={isCompromised ? "url(#red-glow)" : undefined}/><text textAnchor="middle" y="-3" fill="#E5E7EB" fontSize="12">{truncate(node)}</text><text textAnchor="middle" y="14" fill={roleColor} fontSize="9" fontFamily="monospace" fontWeight="bold">{role}</text></g> })}</svg><p className="text-center font-mono text-[10px] text-slate-500">{selected ? `ACTIVE PATH: ${selected.title.toUpperCase()}` : "SELECT A HYPOTHESIS TO TRACE AN ATTACK PATH"}</p></div></div>;
}
