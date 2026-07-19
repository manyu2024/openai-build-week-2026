"use client";

import { ChangeEvent, useEffect, useState } from "react";

const scenarios = [
  { id: "credential-compromise", title: "Data Exfiltration via Credential Compromise", detail: "VPN brute force → lateral movement → cloud exfiltration" },
  { id: "ransomware-lateral-movement", title: "Ransomware Lateral Movement", detail: "Phishing → credential access → encryption" },
  { id: "insider-threat-data-staging", title: "Insider Threat Data Staging", detail: "After-hours access → staging → personal cloud" },
];
const steps = ["Parsing log entries", "Identifying anomalies", "Mapping to architecture", "Generating hypotheses", "Identifying evidence gaps", "Building timeline"];

export default function NewInvestigationPage() {
  const [selected, setSelected] = useState(scenarios[0].id);
  const [logs, setLogs] = useState("");
  const [fileName, setFileName] = useState("");
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const running = activeStep !== null;

  useEffect(() => {
    if (activeStep === null) return;
    if (activeStep === steps.length) { window.location.assign(`/investigate/${selected}`); return; }
    const timer = window.setTimeout(() => setActiveStep((current) => (current === null ? null : current + 1)), 520);
    return () => window.clearTimeout(timer);
  }, [activeStep, selected]);

  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setLogs(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  return <main className="min-h-screen bg-canvas px-5 py-8 text-slate-100 sm:px-9 lg:px-14">
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-cyan">ARGUS / Investigation</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Start a new investigation</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-400">Bring raw security telemetry into a focused incident workspace. Choose a demo scenario or provide your own logs.</p>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-xl border border-border bg-panel p-5 shadow-2xl shadow-black/10">
          <label className="text-sm font-medium">Raw logs and alerts</label>
          <textarea value={logs} onChange={(event) => setLogs(event.target.value)} disabled={running} placeholder={'Paste raw logs, SIEM alerts, or event records here…\n\nExample: 2026-07-17 02:14:08 VPN failed login source=185.243.12.44'} className="mt-3 min-h-[300px] w-full resize-y rounded-lg border border-border bg-panel-secondary p-4 font-mono text-xs leading-6 text-slate-300 outline-none placeholder:text-slate-600 focus:border-primary" />
          <label className="mt-4 flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-border bg-panel-secondary/60 px-4 py-3 transition hover:border-border-hover">
            <span><span className="text-sm text-slate-200">Upload log file</span><span className="mt-1 block font-mono text-[10px] text-slate-500">.json, .csv, .txt, .log</span></span>
            <span className="rounded border border-border px-3 py-1.5 text-xs text-cyan">Browse files</span>
            <input type="file" accept=".json,.csv,.txt,.log" onChange={upload} className="hidden" disabled={running} />
          </label>
          {fileName && <p className="mt-2 font-mono text-[10px] text-safe">Loaded: {fileName}</p>}
        </section>
        <section className="rounded-xl border border-border bg-panel p-5">
          <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Demo scenarios</h2><span className="font-mono text-[10px] text-slate-500">STATIC DATA</span></div>
          <div className="mt-4 space-y-3">{scenarios.map((scenario, index) => <button key={scenario.id} onClick={() => setSelected(scenario.id)} disabled={running} className={`w-full rounded-lg border p-3 text-left transition ${selected === scenario.id ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(47,84,235,.12)]" : "border-border bg-panel-secondary hover:border-border-hover"}`}>
            <span className="font-mono text-[10px] text-cyan">0{index + 1}</span><span className="mt-1 block text-sm font-medium">{scenario.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{scenario.detail}</span>
          </button>)}</div>
          <button onClick={() => setActiveStep(0)} disabled={running} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium transition hover:bg-[#3d62ef] disabled:cursor-wait disabled:bg-primary/60">
            {running ? "Analysis in progress" : "Run Analysis"}<span aria-hidden>→</span>
          </button>
        </section>
      </div>
      {running && <section className="mt-5 rounded-xl border border-border bg-panel p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-medium">Analysis pipeline</h2><span className="font-mono text-[10px] text-cyan">{Math.min(activeStep + 1, 6)} / 6</span></div><ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{steps.map((step, index) => { const complete = index < activeStep; const current = index === activeStep; return <li key={step} className={`flex items-center gap-2 rounded border px-3 py-2.5 text-xs ${current ? "border-primary bg-primary/10 text-white" : complete ? "border-safe/40 bg-safe/5 text-slate-300" : "border-border bg-panel-secondary text-slate-600"}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] ${current ? "animate-pulse bg-primary" : complete ? "bg-safe text-canvas" : "bg-border"}`}>{complete ? "✓" : index + 1}</span>{step}{current && <span className="ml-auto animate-pulse text-cyan">…</span>}</li> })}</ol></section>}
    </div>
  </main>;
}
