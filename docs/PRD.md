# ARGUS — Product Requirements Document
### OpenAI Build Week 2026 | Developer Tools Track
### Version 1.0 — July 18, 2026

---

## 1. Overview

**ARGUS** is an AI-powered security incident reasoning platform. It takes an organization's infrastructure context and raw security incident data (logs, alerts, events) and uses GPT-5.6 to reconstruct attack narratives, generate competing hypotheses with confidence levels, identify evidence gaps, and present everything as an interactive visual timeline and attack graph.

**Tagline:** "See the attack. Understand the story."

**Core insight:** Existing security tools show you WHAT happened (logs, alerts, dashboards). ARGUS shows you WHY it happened, HOW the attack progressed, and WHAT YOU'RE STILL MISSING — presented as a visual story, not a wall of text.

---

## 2. Target Users

- Security operations analysts investigating incidents
- Incident response teams reconstructing attack timelines
- Security engineers at small-to-mid companies without a dedicated SOC
- CISOs and security leads who need to understand and communicate incidents to non-technical stakeholders

---

## 3. Core Value Propositions

1. **Competing hypotheses** — Not one answer. Multiple attack theories ranked by confidence, with reasoning exposed.
2. **Evidence gap analysis** — Tells you what's MISSING and what to look for next.
3. **Visual attack narrative** — Attack path animated on YOUR infrastructure, not a generic diagram.
4. **Architecture-aware reasoning** — GPT understands your specific infrastructure, trust boundaries, and critical assets when reasoning about incidents.

---

## 4. User Experience — Blank Slate to Investigation

ARGUS starts completely empty. No pre-loaded data. The user builds everything from scratch.

### Flow 1: Organization Setup (First-time)

1. User opens ARGUS → sees a clean welcome screen with "Create Your First Organization"
2. User enters:
   - Organization name
   - (Optional) description
3. Organization is created → user is taken to the Architecture Builder

### Flow 2: Architecture Definition

1. User defines their infrastructure by adding assets:
   - **Asset name** (e.g., "VPN Gateway", "Production DB")
   - **Asset type** (dropdown: Server, Database, Firewall, Workstation, Cloud Service, Network Device, Application, Other)
   - **IP / Hostname** (text input)
   - **Zone / Segment** (dropdown + custom: Perimeter, DMZ, Internal, Core, Cloud, Custom)
   - **Criticality** (Low, Medium, High, Critical)
   - **OS / Platform** (optional text)
   - **Notes** (optional)
2. User defines connections between assets:
   - Select source asset → destination asset → protocol/port label (e.g., "RDP 3389", "HTTPS 443")
3. Trust boundaries are automatically inferred from zones (Perimeter → DMZ → Internal → Core) but can be manually adjusted
4. The architecture renders as an interactive node graph in real-time as assets are added
5. GPT-5.6 assist (optional): After the user adds a few assets, a "Suggest missing components" button asks GPT to analyze the architecture and suggest commonly expected assets that might be missing (e.g., "You have a web server and database but no load balancer or WAF — are these present?")
6. Architecture can be edited at any time

### Flow 3: New Investigation (Core Flow)

1. User clicks "+ New Investigation" from the dashboard
2. User selects which organization/architecture this investigation is for (or uses the only one if just one exists)
3. User inputs incident data via ONE of these methods:
   - **Paste raw logs/alerts** into a text area (most common)
   - **Upload a log file** (.json, .csv, .txt, .log)
   - **Use a sample scenario** for demo/learning purposes (2-3 built-in sample datasets)
4. User clicks "Run Analysis"
5. **Processing sequence** (visible to user as a stepped progress indicator):
   - Step 1: "Parsing log entries..." (show count: "Found 847 entries")
   - Step 2: "Identifying anomalous events..." (show count: "6 anomalies detected")
   - Step 3: "Mapping events to architecture..."
   - Step 4: "Generating hypotheses..."
   - Step 5: "Identifying evidence gaps..."
   - Step 6: "Building attack timeline..."
6. Investigation view opens with full results

### Flow 4: Investigation View (The Core Screen)

Three-panel layout:

**Left Panel — Evidence Feed (30%)**
- Scrollable list of evidence items extracted from the raw input
- Each item shows:
  - Type badge (AUTH LOG, NETWORK LOG, DATA LOG, SYSTEM LOG, ENDPOINT LOG — color-coded)
  - Timestamp
  - Content summary (the relevant log entry, human-readable)
  - Which hypothesis/hypotheses it's linked to
- Clicking an evidence item highlights the corresponding point on the timeline
- When a hypothesis is selected, unrelated evidence items dim

**Center Panel — Visual Timeline + Attack Graph (45%)**
Two tabs:

*Tab 1: Timeline View*
- Horizontal timeline with event nodes
- Nodes color-coded by evidence type
- MITRE ATT&CK technique labels above relevant nodes
- Connected by a flowing line showing chronological progression
- Selecting a hypothesis highlights only its relevant nodes; others dim
- Clicking a node shows a detailed tooltip

*Tab 2: Attack Graph View*
- The organization's architecture rendered as a node graph
- Attack path overlaid as animated red arrows tracing through the infrastructure
- Each hop labeled with the action taken
- Compromised nodes glow red
- Trust boundary crossings highlighted with warning indicators
- Hypothesis selector (pills/tabs) to switch between different attack path theories on the same infrastructure
- Non-involved nodes dim

**Right Panel — Hypotheses + Evidence Gaps (25%)**

*Top section: Hypotheses*
- Each hypothesis displayed as a card:
  - Title (e.g., "External Attacker — Credential Compromise")
  - Confidence percentage with visual bar
  - Summary paragraph explaining the theory
  - Evidence supporting count (with green indicator)
  - Evidence conflicting count (with red indicator)
  - MITRE ATT&CK technique tags
  - Expandable "Full Reasoning" section showing GPT's step-by-step logic
  - (If applicable) Weakening factors — what makes this hypothesis less likely
- Clicking a hypothesis filters the entire view (evidence + timeline + attack graph) to show only that hypothesis's story

*Bottom section: Evidence Gaps*
- Header: "Missing Evidence — What to check next"
- List of items GPT identified as missing, each showing:
  - What to look for (e.g., "Check MFA logs for the VPN session")
  - Which hypothesis it would strengthen or weaken if found
  - Checkable — user can mark items as "checked" or "found"

### Flow 5: Report Export

- Button: "Export Report"
- Generates a downloadable markdown or PDF file containing:
  - Investigation summary
  - Architecture context
  - All hypotheses with reasoning
  - Evidence timeline
  - Evidence gaps / recommended next steps
  - MITRE ATT&CK mapping
- This report can be shared with stakeholders or fed into other tools

---

## 5. Feature Scope

### In Scope (MVP — Must ship)

| Feature | Priority | Notes |
|---------|----------|-------|
| Organization creation | P0 | Name + description |
| Architecture builder — add assets | P0 | Form-based, renders to graph |
| Architecture builder — add connections | P0 | Source → destination → label |
| Architecture graph visualization | P0 | Interactive node graph with zones |
| New investigation — paste logs | P0 | Text area input |
| New investigation — upload file | P1 | .json, .csv, .txt, .log |
| GPT-5.6 reasoning pipeline | P0 | THE core feature |
| Evidence feed panel | P0 | Dynamic from GPT output |
| Timeline visualization | P0 | Dynamic from GPT output |
| Attack graph visualization | P0 | Animated paths on architecture |
| Hypothesis cards with confidence | P0 | Dynamic from GPT output |
| Evidence gap identification | P0 | Dynamic from GPT output |
| Hypothesis filtering (click to focus) | P0 | Filters all three panels |
| MITRE ATT&CK mapping | P1 | Tags on hypotheses + timeline |
| Sample incident scenarios | P1 | 2-3 built-in for demo |
| Report export (markdown) | P1 | Downloadable investigation report |
| Processing progress sequence | P1 | Stepped loading with real counts |
| Responsive layout | P2 | Functional on smaller screens |

### Out of Scope (Do NOT build)

| Feature | Reason |
|---------|--------|
| User authentication / login | Not needed for hackathon demo |
| Persistent database | Use local state / session storage; no backend DB |
| Real-time log ingestion / streaming | Scope creep; paste/upload is sufficient |
| OSINT / recon agent | Full project by itself; out of time budget |
| MCP server integration | Nice-to-have but risks core delivery |
| Multiple organizations | Support one org at a time |
| Collaboration / multi-user | Solo tool for hackathon |
| Historical investigation storage | Investigations live in session only |
| Integration with SIEM/Splunk/Sentinel | Post-hackathon feature |

---

## 6. Technical Architecture

### Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14+ (App Router) | React frontend + API routes in one project; easy deployment |
| Styling | Tailwind CSS | Fast, utility-first, consistent with dark theme |
| Visualization | D3.js or React Flow | Node graphs (architecture + attack graph) and timeline |
| AI Engine | OpenAI GPT-5.6 via API | Core reasoning engine |
| State Management | React Context + useReducer | Simple, no external deps needed |
| Deployment | Vercel | One-click deploy from GitHub |
| Export | react-markdown + html2pdf or jsPDF | Report generation |

### System Architecture

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│          (Next.js React Components)          │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │Dashboard │  │Arch      │  │Investigate │  │
│  │View      │  │Builder   │  │View        │  │
│  └──────────┘  └──────────┘  └───────────┘  │
│         │            │             │         │
│         └────────────┼─────────────┘         │
│                      │                       │
│              ┌───────┴────────┐              │
│              │  State Manager │              │
│              │  (Context)     │              │
│              └───────┬────────┘              │
└──────────────────────┼───────────────────────┘
                       │
                       │ API Routes
                       │
┌──────────────────────┼───────────────────────┐
│              BACKEND (API Routes)             │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │         GPT-5.6 Reasoning Pipeline      │  │
│  │                                         │  │
│  │  Input: raw logs + architecture JSON    │  │
│  │                                         │  │
│  │  Step 1: Parse & normalize log entries  │  │
│  │  Step 2: Identify anomalous events      │  │
│  │  Step 3: Map events to architecture     │  │
│  │  Step 4: Generate hypotheses            │  │
│  │  Step 5: Identify evidence gaps         │  │
│  │  Step 6: Build timeline + attack paths  │  │
│  │                                         │  │
│  │  Output: structured JSON                │  │
│  └─────────────────────────────────────────┘  │
│                      │                        │
│              ┌───────┴────────┐               │
│              │  OpenAI API    │               │
│              │  (GPT-5.6)    │               │
│              └────────────────┘               │
└───────────────────────────────────────────────┘
```

### GPT-5.6 Integration — The Core Pipeline

**Single API route: `/api/analyze`**

**Input:**
```json
{
  "architecture": {
    "orgName": "Alpha Corp",
    "assets": [
      {
        "id": "asset-1",
        "name": "VPN Gateway",
        "type": "Firewall",
        "ip": "203.0.113.10",
        "zone": "Perimeter",
        "criticality": "High",
        "os": "pfSense 2.7"
      }
    ],
    "connections": [
      {
        "from": "asset-1",
        "to": "asset-2",
        "label": "SSL VPN 443"
      }
    ],
    "trustBoundaries": ["Perimeter", "DMZ", "Internal", "Core", "Cloud"]
  },
  "rawLogs": "... raw log text or parsed entries ..."
}
```

**Output (structured JSON from GPT-5.6):**
```json
{
  "summary": "Brief incident summary",
  "severity": "critical|high|medium|low",
  "evidenceItems": [
    {
      "id": "ev-1",
      "type": "AUTH_LOG",
      "timestamp": "2026-07-17T02:14:00Z",
      "summary": "47 failed login attempts on VPN Gateway from 185.243.xx.xx",
      "rawContent": "... original log line ...",
      "linkedHypotheses": [1, 2],
      "assetId": "asset-1"
    }
  ],
  "timeline": [
    {
      "evidenceId": "ev-1",
      "timestamp": "2026-07-17T02:14:00Z",
      "label": "Brute Force Attack",
      "mitreTechnique": "T1110",
      "mitreName": "Brute Force"
    }
  ],
  "hypotheses": [
    {
      "id": 1,
      "title": "External Attacker — Credential Compromise",
      "confidence": 82,
      "summary": "An external attacker brute-forced VPN credentials...",
      "reasoning": "Step-by-step reasoning chain...",
      "supportingEvidence": ["ev-1", "ev-2", "ev-3"],
      "conflictingEvidence": [],
      "weakeningFactors": [],
      "mitreTechniques": ["T1110", "T1078", "T1021", "T1041", "T1070"],
      "attackPath": [
        {
          "fromAssetId": "external",
          "toAssetId": "asset-1",
          "action": "Brute Force + Credential Theft"
        },
        {
          "fromAssetId": "asset-1",
          "toAssetId": "asset-3",
          "action": "RDP Lateral Movement"
        }
      ]
    }
  ],
  "evidenceGaps": [
    {
      "id": "gap-1",
      "description": "Check MFA logs for the VPN session",
      "strengthens": [1],
      "weakens": [2],
      "priority": "high"
    }
  ]
}
```

This structured output is what the UI renders. The frontend is entirely driven by this JSON.

### GPT-5.6 Prompt Strategy

The analysis uses a single comprehensive prompt (or a two-stage approach if context requires):

**System prompt establishes:**
- You are a senior incident response analyst
- You reason about security incidents by considering ALL evidence
- You generate MULTIPLE competing hypotheses, not just one
- You identify what evidence is MISSING, not just what's present
- You map findings to MITRE ATT&CK framework
- You output ONLY valid JSON matching the specified schema
- You reason about trust boundaries and architectural context

**User prompt contains:**
- The full architecture JSON
- The raw log data
- The output schema specification
- Instruction to generate 2-4 hypotheses ranked by confidence

---

## 7. Data Models

### Organization
```typescript
interface Organization {
  name: string;
  description?: string;
  architecture: Architecture;
}
```

### Architecture
```typescript
interface Architecture {
  assets: Asset[];
  connections: Connection[];
  trustBoundaries: string[];
}

interface Asset {
  id: string;
  name: string;
  type: 'Server' | 'Database' | 'Firewall' | 'Workstation' | 'Cloud Service' | 'Network Device' | 'Application' | 'Other';
  ip?: string;
  zone: string;
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  os?: string;
  notes?: string;
}

interface Connection {
  id: string;
  from: string;  // asset ID
  to: string;    // asset ID
  label: string;  // e.g., "RDP 3389"
}
```

### Investigation
```typescript
interface Investigation {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'analyzing' | 'investigating' | 'resolved';
  createdAt: string;
  rawInput: string;
  analysis: AnalysisResult;  // GPT output
}
```

### AnalysisResult
```typescript
interface AnalysisResult {
  summary: string;
  severity: string;
  evidenceItems: EvidenceItem[];
  timeline: TimelineEvent[];
  hypotheses: Hypothesis[];
  evidenceGaps: EvidenceGap[];
}
```

---

## 8. Visual Design Specification

### Theme
- **Background:** #0A0E17 (near-black)
- **Panel background:** #111827
- **Panel secondary:** #151D2E
- **Border:** #1E2A3E
- **Border hover:** #2A3B57

### Semantic Colors
- **Critical/High severity:** #FF4D4F (red)
- **Medium severity:** #FFA940 (amber)
- **Low severity:** #4096FF (blue)
- **Safe/Resolved:** #52C41A (green)
- **Primary accent:** #2F54EB (electric blue)
- **Secondary accent:** #13C2C2 (cyan)

### Typography
- **UI text:** Inter
- **Monospace / technical data:** JetBrains Mono
- **Evidence type badges:** 9.5px, uppercase, monospace, color-coded backgrounds

### Evidence Type Colors
- AUTH LOG: Blue (#4096FF background tint)
- AUTH LOG (success): Green (#52C41A background tint)
- NETWORK LOG: Purple (#B37FEB background tint)
- DATA LOG: Red (#FF4D4F background tint)
- SYSTEM LOG: Amber (#FFA940 background tint)
- ENDPOINT LOG: Cyan (#13C2C2 background tint)

### Key Interactions
- Clicking a hypothesis filters all panels to show only that hypothesis's story
- Clicking an evidence item highlights the corresponding timeline node
- Attack graph paths animate with a red trace on load
- Compromised nodes glow with a colored shadow
- Trust boundary crossings show warning indicators
- Timeline has a subtle pulse animation on the most critical event

---

## 9. Sample Incident Scenarios (Built-in for Demo)

### Scenario 1: Data Exfiltration via Credential Compromise
- Brute force → VPN access → lateral movement → data exfil → log clearing
- 3 hypotheses: external attacker (high), insider threat (low), malware (very low)
- Architecture: VPN Gateway, File Server, DB Server, AD Controller, Cloud Storage

### Scenario 2: Ransomware Lateral Movement
- Phishing email → endpoint compromise → credential dumping → lateral spread → encryption
- 2 hypotheses: targeted ransomware (high), worm-like propagation (medium)
- Architecture: Email Gateway, Workstations, File Servers, Domain Controller

### Scenario 3: Insider Threat — Data Staging
- Authorized access → unusual query patterns → data staging to personal cloud → after-hours activity
- 2 hypotheses: malicious insider (high), compromised credentials (medium)
- Architecture: VPN, Application Server, Database, Cloud Storage

Each scenario includes a pre-built architecture JSON and a realistic raw log dataset.

---

## 10. Build Plan — 1.5 Days

### Day 1 — Morning (4 hours): Foundation + GPT Pipeline
- Codex task 1: Scaffold Next.js project with Tailwind, project structure, data models
- Codex task 2: Build the GPT-5.6 analysis API route with structured output
- Codex task 3: Test the pipeline with sample logs → verify structured JSON output
- Manual: Refine the GPT prompt until output quality is consistently good

### Day 1 — Afternoon (4 hours): Core UI
- Codex task 4: Dashboard view — welcome state, investigation list, quick stats
- Codex task 5: Architecture builder — asset form, connection form, interactive graph visualization
- Codex task 6: New investigation form — text input, file upload, sample scenario selector, processing animation

### Day 2 — Morning (4 hours): Investigation View + Polish
- Codex task 7: Investigation view — three-panel layout, evidence feed, hypothesis cards, evidence gaps
- Codex task 8: Timeline visualization (D3 or SVG-based)
- Codex task 9: Attack graph visualization with animated paths on architecture
- Codex task 10: Hypothesis filtering — click hypothesis to filter all panels

### Day 2 — Afternoon (4 hours): Testing + Submission
- Test all 3 sample scenarios end-to-end
- Bug fixes and edge cases
- Report export feature (markdown download)
- Demo video recording
- README, documentation
- Deploy to Vercel
- Submit to Devpost with Codex session ID

---

## 11. Success Criteria

The submission is successful if:
1. A user can create an organization and define its architecture from scratch
2. A user can paste raw logs and receive a GPT-5.6 generated analysis
3. The analysis includes multiple hypotheses with confidence levels and reasoning
4. The analysis includes evidence gap identification
5. The evidence, timeline, and attack graph are rendered dynamically from GPT output
6. Clicking a hypothesis filters all three panels to show only that theory's story
7. The attack graph shows animated attack paths on the user's actual architecture
8. At least 2 sample scenarios work end-to-end for demo reliability
9. A downloadable report can be exported
10. The application is deployed and accessible via URL

---

## 12. What Judges Should Take Away

"ARGUS doesn't just show you what happened — it shows you WHY, presents competing theories, and tells you what you're still missing. It's the first incident response tool that reasons like a senior analyst and communicates like a storyteller."