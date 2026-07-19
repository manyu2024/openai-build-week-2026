# ARGUS

**See the attack. Understand the story.**

ARGUS is an AI-powered security incident reasoning platform built for [OpenAI Build Week 2026](https://openai.devpost.com/). It transforms raw security logs into interactive visual investigations with competing hypotheses, evidence mapping, and actionable intelligence gaps.

![Track](https://img.shields.io/badge/Track-Developer%20Tools-blue)
![Built With](https://img.shields.io/badge/Built%20With-GPT--5.6%20%2B%20Codex-brightgreen)
![Framework](https://img.shields.io/badge/Framework-Next.js%2014-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## The Problem

When a security incident occurs, analysts face a wall of raw logs, disconnected alerts, and ambiguous signals. Existing tools like SIEMs and log aggregators show you what happened, but not why, not how the attack progressed, and not what evidence you are still missing.

Reconstructing the attack story, generating hypotheses, and identifying investigation gaps requires senior expertise that most teams simply do not have available at 3 AM when the alert fires.

## The Solution

ARGUS takes two inputs:

1. Your organization's infrastructure: assets, connections, and trust boundaries
2. Raw incident data: logs, alerts, and events

GPT-5.6 reasons through all the evidence and produces:

- Multiple competing hypotheses ranked by confidence, not just a single verdict
- An interactive visual timeline of the attack progression with MITRE ATT&CK mapping
- An attack graph showing the attack path animated across your actual infrastructure
- Evidence gap analysis identifying what is missing and what to investigate next
- Exportable investigation reports formatted for stakeholders

## What Makes ARGUS Different

| Feature | Traditional Tools | ARGUS |
|---------|------------------|-------|
| Output format | Tables, dashboards, alert lists | Visual attack narrative |
| Analysis depth | Single verdict or alert triage | Multiple competing hypotheses |
| Evidence gaps | Not identified | Explicitly listed with priorities |
| Attack visualization | Generic kill chain diagrams | Animated paths on your infrastructure |
| Expertise required | Senior analyst | Accessible to any security team member |

## Demo Scenarios

ARGUS ships with three pre-built investigation scenarios, each fully analyzed by GPT-5.6:

**1. Data Exfiltration via Credential Compromise**
VPN brute force, lateral movement through RDP, data staging, cloud exfiltration, and anti-forensic log clearing.

**2. Ransomware Lateral Movement**
Phishing delivery, Cobalt Strike beacon, credential dumping with Mimikatz, domain takeover via PsExec, and GPO-based ransomware deployment across 200+ systems.

**3. Insider Threat: Data Staging**
Authorized after-hours database access, unusual query patterns against PII tables, encrypted archive creation, and upload to personal cloud storage.

## Architecture

```
+------------------------------------------+
|              FRONTEND                    |
|         Next.js 14 + React              |
|                                          |
|  Dashboard | Architecture | Investigation|
|            |   Builder    |    View      |
|                                          |
|  +--------------------------------------+|
|  |    Interactive Visualizations         ||
|  |  SVG Timeline  -  Attack Graph        ||
|  +------------------+-------------------+|
|                     |                    |
|          State Management                |
|       (React Context + localStorage)     |
+---------------------+-------------------+
                      |
               +------+------+
               |   GPT-5.6   |
               |  Reasoning  |
               |   Engine    |
               +-------------+
```

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS with a custom dark theme
- **Visualizations:** SVG with CSS animations
- **AI Engine:** GPT-5.6 for scenario analysis and reasoning
- **Development Tool:** OpenAI Codex
- **State Management:** React Context with localStorage persistence
- **Typography:** Inter for UI, JetBrains Mono for technical data

## Getting Started

```bash
# Clone the repository
git clone https://github.com/manyu2024/openai-build-week-2026.git
cd openai-build-week-2026

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to launch ARGUS.

## Usage

1. **Create an organization.** Give it a name to get started.
2. **Define your architecture.** Add assets such as servers, databases, and firewalls. Assign zones and criticality levels. Define the connections between them.
3. **Start an investigation.** Paste raw logs or select one of the built-in sample scenarios.
4. **Explore the analysis.** Browse evidence items, click hypotheses to filter all panels to that theory, switch between the timeline and attack graph views, and review the evidence gaps checklist.
5. **Export a report.** Download a Markdown report ready to share with your team or stakeholders.

## How Codex Accelerated This Build

ARGUS was built by a solo developer in under two days using OpenAI Codex as the primary development tool.

- **Scaffolding:** Codex generated the full Next.js project structure, TypeScript interfaces, and component architecture from a detailed PRD.
- **UI Components:** The architecture builder, three-panel investigation view, SVG timeline, and attack graph were each built through focused Codex tasks.
- **State Management:** Codex implemented the AppProvider with localStorage persistence and cross-page navigation flow.
- **Analysis Pipeline:** The GPT-5.6 reasoning API route with structured JSON output was generated by Codex from the schema specification in the PRD.
- **Iterative Refinement:** Bug fixes, form validation, visual polish, and animation tuning were handled through targeted follow-up tasks.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── architecture/      # Architecture Builder
│   └── investigate/       # New Investigation + Investigation View
├── components/
│   ├── architecture/      # Asset form, connection form, graph
│   ├── investigation/     # Evidence feed, timeline, attack graph
│   ├── dashboard/         # Dashboard cards, stats
│   ├── layout/            # Navigation
│   └── providers/         # App state provider
├── data/
│   └── scenarios/         # GPT-5.6 generated analysis data
├── types/                 # TypeScript interfaces
└── lib/                   # Constants, theme, utilities
```

## Key Features

- Blank-slate workflow: start from nothing, build your org, investigate incidents
- Interactive architecture builder with live topology graph
- Three-panel investigation view: evidence feed, timeline/attack graph, hypotheses/gaps
- Hypothesis filtering: click any theory to filter all panels to its evidence and path
- MITRE ATT&CK technique mapping on every timeline event
- Evidence gap analysis with an actionable investigation checklist
- Attack path visualization with entry, compromised, and target node indicators
- Downloadable Markdown investigation reports
- Persistent state across page refreshes

## Built For

**OpenAI Build Week 2026**, Developer Tools Track

Built by [Manyu](https://github.com/manyu2024)
Final-year B.E. Computer Science and Cyber Security, Dayananda Sagar College of Engineering, Bengaluru

---

*ARGUS does not just show you what happened. It shows you why, presents competing theories, and tells you what you are still missing.*