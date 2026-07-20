"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useAppContext } from "@/components/providers/AppProvider";
import credentialCompromise from "@/data/scenarios/credential-compromise.json";
import ransomware from "@/data/scenarios/ransomware-lateral-movement.json";
import insiderThreat from "@/data/scenarios/insider-threat-data-staging.json";

const scenarios = [
  { id: "credential-compromise", title: "Data Exfiltration via Credential Compromise", detail: "VPN brute force → lateral movement → cloud exfiltration" },
  { id: "ransomware-lateral-movement", title: "Ransomware Lateral Movement", detail: "Phishing → credential access → encryption" },
  { id: "insider-threat-data-staging", title: "Insider Threat Data Staging", detail: "After-hours access → staging → personal cloud" },
];
const steps = ["Parsing log entries", "Identifying anomalies", "Mapping to architecture", "Generating hypotheses", "Identifying evidence gaps", "Building timeline"];
const sampleLogs: Record<string, string> = {
  "credential-compromise": `2026-07-19T02:14:08Z vpn-gateway auth failure user=a.chen source=185.220.101.47 count=1 reason=invalid_password
2026-07-19T02:18:41Z vpn-gateway credential-attempt burst user=a.chen source=185.220.101.47 failures=47 window=4m
2026-07-19T02:21:16Z vpn-gateway auth success user=a.chen source=185.220.101.47 failures_before_success=47 mfa=not_triggered policy=legacy-vpn
2026-07-19T02:27:03Z ad-controller kerberos-tgt user=a.chen source=10.44.18.92 result=success
2026-07-19T02:31:49Z file-server rdp-logon user=CORP\\a.chen source=10.44.18.92 logon_type=10 after_hours=true
2026-07-19T02:36:22Z file-server edr process=radminsvc.exe signer=unsigned user=a.chen action=remote_access_utility_detected
2026-07-19T02:42:11Z file-server powershell remote=true command="Get-SmbShare; query database connection strings" user=a.chen
2026-07-19T02:48:37Z db-server rdp-logon user=CORP\\a.chen source=10.20.5.14 service=file-server result=success
2026-07-19T02:56:19Z db-audit user=a.chen operation=bulk_select tables=CustomerRecords,PaymentProfiles,ContactHistory
2026-07-19T03:04:52Z file-server edr process=7z.exe archive=backup_20260719.7z encrypted=true size=8.4GB source=customer_exports
2026-07-19T03:10:28Z firewall outbound_tls source=file-server destination=storage-sync.cloudfilescdn.com port=443 bytes=8.4GB
2026-07-19T03:14:47Z file-server security event=1102 action=clear_event_log; delete_file=backup_20260719.7z user=CORP\\a.chen`,
  "ransomware-lateral-movement": `2026-07-19T09:42:17Z email-gateway delivered sender=invoices@newly-registered.example recipient=j.williams@corp.example attachment=Invoice_Q3_Review.docm
2026-07-19T09:44:03Z workstation-edr host=EMP-WS-014 process=WINWORD.EXE document=Invoice_Q3_Review.docm child_process=macro
2026-07-19T09:45:26Z powershell-operational parent=WINWORD.EXE hidden=true command="download hxxps://cdn-updates-storage.example/assets/a.dat"
2026-07-19T09:47:11Z proxy host=EMP-WS-014 destination=198.51.100.84 protocol=HTTPS interval=60s event=beacon_traffic
2026-07-19T09:51:42Z workstation-edr host=EMP-WS-014 process=rundll32.exe payload=cobalt_strike_beacon path=%TEMP%
2026-07-19T10:02:18Z workstation-security host=EMP-WS-014 process=mimikatz.exe action=lsass_memory_access output=credential_dump
2026-07-19T10:11:55Z domain-controller ntlm-auth user=CORP\\svc_domainadmin source=EMP-WS-014 result=success atypical_source=true
2026-07-19T10:19:34Z domain-controller service-create tool=PsExec source=EMP-WS-014 user=CORP\\svc_domainadmin action=remote_command
2026-07-19T10:28:09Z group-policy audit policy=endpoint-security change=disable_defender_realtime_monitoring scope=CORP
2026-07-19T10:39:47Z domain-controller gpo scheduled-task-create targets=file_servers:14,workstations:217
2026-07-19T11:04:21Z file-server monitor event=rapid_encryption extension=.locked backup_server_contacted=true
2026-07-19T11:15:08Z endpoint-edr fleet event=ransomware_task_execution artifact=README_RESTORE_FILES.txt source=gpo_scheduled_task`,
  "insider-threat-data-staging": `2026-07-17T23:07:14Z vpn auth success user=CORP\\d.patel source=assigned-workstation after_hours=true; db-auth result=success
2026-07-17T23:24:39Z db-audit user=d.patel query=SELECT tables=CustomerContact,CustomerAddress baseline=atypical
2026-07-18T00:11:52Z workstation telemetry process=sqlcmd.exe export=C:\\Users\\d.patel\\Documents\\customer_contacts.csv records=18420
2026-07-18T00:47:26Z file-audit process=7z.exe archive=Q1_archive.7z password_protected=true input=customer_contacts.csv
2026-07-18T23:36:08Z hr-portal auth user=d.patel source=assigned-workstation document=employee_severance-policy
2026-07-18T23:58:44Z db-audit user=d.patel query=SELECT tables=CustomerPII,PaymentProfile,AccountHistory permissions=DBA
2026-07-19T00:43:17Z workstation telemetry user=d.patel action=create_csv_exports files=3 size=2.7GB path=user_staging_folder
2026-07-19T01:31:29Z proxy source=d.patel-workstation destination=drive.google.com protocol=HTTPS bytes=2.8GB account=personal_cloud
2026-07-19T00:14:06Z file-audit user=d.patel action=enumerate_export_directories; copy_to=C:\\Users\\d.patel\\AppData\\Local\\Temp\\staging
2026-07-19T00:52:41Z db-audit user=d.patel operation=full_extract dataset=active_customer_records fields=PII unauthorized_scope=true
2026-07-19T01:46:33Z workstation telemetry process=7z.exe archive=personal_backup.7z encrypted=true size=8.1GB input=customer_csv_files
2026-07-19T02:38:57Z proxy source=d.patel-workstation destination=drive.google.com bytes=8.1GB account=personal_cloud; daytime_activity=job_board_searches`,
};

export default function NewInvestigationPage() {
  const { addInvestigation } = useAppContext();
  const [selected, setSelected] = useState(scenarios[0].id);
  const [logs, setLogs] = useState("");
  const [fileName, setFileName] = useState("");
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const completed = useRef(false);
  const running = activeStep !== null;

  useEffect(() => {
    if (activeStep === null) return;
    if (activeStep === steps.length) { if (completed.current) return; completed.current = true; const result = { "credential-compromise": credentialCompromise, "ransomware-lateral-movement": ransomware, "insider-threat-data-staging": insiderThreat }[selected] ?? credentialCompromise; const id = `inv-${crypto.randomUUID()}`; addInvestigation({ id, title: result.name, severity: selected === "ransomware-lateral-movement" ? "critical" : selected === "credential-compromise" ? "high" : "medium", createdAt: new Date().toISOString(), rawInput: logs, scenarioId: selected, result, analysisSource: "precomputed" }); window.location.assign(`/investigate/${id}`); return; }
    const timer = window.setTimeout(() => setActiveStep((current) => (current === null ? null : current + 1)), 800);
    return () => window.clearTimeout(timer);
  }, [activeStep, addInvestigation, logs, selected]);

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
          <div className="mt-4 space-y-3">{scenarios.map((scenario, index) => <button key={scenario.id} onClick={() => { setSelected(scenario.id); setLogs(sampleLogs[scenario.id]); setFileName(""); }} disabled={running} className={`w-full rounded-lg border p-3 text-left transition ${selected === scenario.id ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(47,84,235,.12)]" : "border-border bg-panel-secondary hover:border-border-hover"}`}>
            <span className="font-mono text-[10px] text-cyan">0{index + 1}</span><span className="mt-1 block text-sm font-medium">{scenario.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{scenario.detail}</span>
          </button>)}</div>
          <button onClick={() => { completed.current = false; setActiveStep(0); }} disabled={running} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium transition hover:bg-[#3d62ef] disabled:cursor-wait disabled:bg-primary/60">
            {running ? "Analysis in progress" : "Run Analysis"}<span aria-hidden>→</span>
          </button>
        </section>
      </div>
      {running && <section className="mt-5 rounded-xl border border-border bg-panel p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-medium">Analysis pipeline</h2><span className="font-mono text-[10px] text-cyan">{Math.min(activeStep + 1, 6)} / 6</span></div><ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{steps.map((step, index) => { const complete = index < activeStep; const current = index === activeStep; return <li key={step} className={`flex items-center gap-2 rounded border px-3 py-2.5 text-xs ${current ? "border-primary bg-primary/10 text-white" : complete ? "border-safe/40 bg-safe/5 text-slate-300" : "border-border bg-panel-secondary text-slate-600"}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] ${current ? "animate-pulse bg-primary" : complete ? "bg-safe text-canvas" : "bg-border"}`}>{complete ? "✓" : index + 1}</span>{step}{current && <span className="ml-auto animate-pulse text-cyan">…</span>}</li> })}</ol><div className="mt-4 h-1 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan transition-all duration-700" style={{ width: `${Math.min(((activeStep + 1) / steps.length) * 100, 100)}%` }} /></div></section>}
    </div>
  </main>;
}
