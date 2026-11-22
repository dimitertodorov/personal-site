// Cards behind the tower's pieces, keyed "<floor>/<piece>" (piece names are set in src/tower.ts).
// Source: github.com/dimitertodorov/todorov-skillz (public-safe parts only: no 🔒 metrics, internal names or hosts)
// and the personal-site questionnaire. Project titles are descriptive until employer approval for codenames.
import type { PropStory } from 'popfold';

const LINKEDIN = 'https://www.linkedin.com/in/dimiter-todorov-94248213/';

export const STORIES: Record<string, PropStory> = {
  // ---------- now building ----------
  // Source: the CheriBase showcase package; client and НЗОК may be named,
  // results stay qualitative.
  'now/project-1': {
    kicker: 'Now building', title: 'CheriBase: НЗОК rights for a prosthetics center', meta: '2026, ongoing · architect and lead developer',
    text: 'Allegro, a prosthetics and orthotics center in Bulgaria, ran on two legacy Windows programs and a shared Firebird database that could not say which patients were due a prosthesis, repair or consumables paid by НЗОК, the national health insurer. I led a web app that works next to those programs with byte-for-byte parity: an НЗОК rights engine with versioned rule sets the center\'s experts confirm, each entitlement explained in plain language, and a worklist that turns it into a call, a case and a claim. Microsoft Entra ID sign-in keeps every legacy change under a real legacy user. AI coding agents wrote most of the code, one per component, under contracts and build-enforced boundaries I reviewed. The first version is in use and has already brought real business results.',
    tags: ['Kotlin', 'Ktor', 'React', 'TypeScript', 'Firebird', 'Entra ID', 'Azure', 'GitHub Actions', 'AI agents'],
  },
  'now/project-2': {
    kicker: 'Now building', title: 'Remedy ↔ ServiceNow integration re-platform', meta: 'Oct – Nov 2026 · sole developer',
    text: 'A scoped ServiceNow app that brings Remedy incidents, CMDB, people and groups into ServiceNow through IRE, and sends Security Incident changes back. Built in 8 days with Claude Code: about 24K lines, 320 unit tests and 3 ATF suites, with the wiki written in the same commits. "Pure core, thin adapters": transform logic is platform-free TypeScript, tested against captured IRE contracts.',
    tags: ['ServiceNow SDK / Fluent', 'TypeScript', 'IRE', 'BMC Remedy', 'Claude Code'],
  },
  'now/project-3': {
    kicker: 'Now building', title: 'Explainable vulnerability risk scoring', meta: 'Nov 2026 · Vulnerability Response / USEM',
    text: 'Replaces raw scanner severity with a business-aware, seven-component risk model (severity, threat intel, asset criticality, data sensitivity, exposure, business impact, controls) where every score comes with a human-readable reason. A Risk Model Workbench lets you edit, validate, diff and preview a model on real CIs before activating it. New CI lookup rules substantially improved scanner-to-CMDB matching.',
    tags: ['ServiceNow VR', 'USEM', 'Vue 3', 'Vitest', 'ATF'],
  },
  'now/project-4': {
    kicker: 'Now building', title: 'Klide: a local ServiceNow emulator', meta: 'Sep – Oct 2026 · personal tooling',
    text: 'A Kotlin/Ktor service that runs ServiceNow server-side JavaScript on Rhino against PostgreSQL. It emulates GlideRecord, business rules, scheduled jobs, Scripted REST and IRE, verified against live responses, so apps can be built and tested offline with AI in the loop. 141 tests.',
    tags: ['Kotlin', 'Ktor', 'Rhino', 'PostgreSQL', 'Vue 3'],
  },
  'now/project-5': {
    kicker: 'Now building', title: 'AI-assisted engineering, done safely', meta: 'Nov 2026 · team enablement',
    text: 'The team handbook for agentic ServiceNow, Azure DevOps and Remedy work: AGENTS.md conventions, guardrails, reusable prompts and MCP usage, with one delivery path: prompt → human review → pull request → DEV install and ATF → evidence.',
    tags: ['Claude Code', 'GitHub Copilot', 'MCP', 'Azure DevOps', 'GitHub Actions'],
  },

  // ---------- integrations ----------
  'integrations/source-1': {
    kicker: 'Integrations', title: 'Remedy as the enterprise CMDB',
    text: 'Incidents, CIs, relationships, people, groups and the product catalog flow from BMC Remedy into ServiceNow through the Identification & Reconciliation Engine, with watermarks, paging and reconciliation jobs.',
    tags: ['BMC Remedy', 'Atrium CMDB', 'IRE', 'MID Server'],
  },
  'integrations/source-2': {
    kicker: 'Integrations', title: 'Microsoft Defender into ServiceNow',
    text: 'Defender TVM, XDR and Defender for Cloud findings land in Vulnerability Response and SIR. Pre-persistence filtering in the import pipeline projects about 40% less volume; a read-only Graph and KQL Advanced Hunting app enriches device context.',
    tags: ['Defender TVM', 'Defender XDR', 'Microsoft Graph', 'KQL'],
  },
  'integrations/source-3': {
    kicker: 'Integrations', title: 'SIEM into incident response',
    text: 'Splunk and Microsoft Sentinel ingestion into ServiceNow Security Incident Response, with Sentinel playbooks and phishing email-to-incident automation. Also Recorded Future threat intel, Qualys, IBM Guardium and BitSight.',
    tags: ['Splunk ES', 'Microsoft Sentinel', 'Recorded Future', 'Qualys'],
  },
  'integrations/mid-server': {
    kicker: 'Integrations', title: 'The plumbing, as code',
    text: 'Azure-hosted MID Servers deployed with Bicep, managed identity and Key Vault, with certificate registration. Entra app registrations and GitHub OIDC federated credentials managed as code, so there are no long-lived secrets.',
    tags: ['MID Server', 'Bicep', 'Entra ID', 'Key Vault', 'GitHub OIDC'],
  },
  'integrations/servicenow-hub': {
    kicker: 'Integrations', title: 'One place for security operations',
    meta: 'Ontario Treasury Board Secretariat · Cyber Security Division',
    text: 'Every finding lands on the right asset, with a risk score analysts can explain and an owner who can fix it. ServiceNow SIR, Vulnerability Response and USEM, connected to the tools the SOC already runs.',
    tags: ['ServiceNow SIR', 'Vulnerability Response', 'USEM / CTEM', 'CMDB & CSDM'],
  },
  'integrations/risk-model': {
    kicker: 'Integrations', title: 'Context feeds the risk model',
    text: 'Asset criticality, data sensitivity, exposure and ownership come from the CMDB integrations, including database CIs modelled from Guardium, and become explainable risk scores refreshed daily.',
    tags: ['Risk model', 'CMDB data quality', 'CI lookup rules'],
  },

  // ---------- threat intel / security ----------
  'security/threat-map': {
    kicker: 'Threat intelligence', title: 'Threat intel where analysts work',
    text: 'Recorded Future feeds into Splunk and CTEM enrichment, mapped to MITRE ATT&CK, so incidents and exposures arrive with context.',
    tags: ['Recorded Future', 'Splunk', 'MITRE ATT&CK'],
  },
  'security/incident-queue': {
    kicker: 'Cyber security', title: 'Led Security Incident Response, end to end',
    meta: 'Platform assessment (2023) → production',
    text: 'SIEM ingestion from Splunk and Sentinel, phishing automation, Remedy ticket synchronization, the SOC dashboard architecture, a critical-incident portal, and the SIR escalation integration with an external cyber partner.',
    tags: ['ServiceNow SIR', 'Sentinel playbooks', 'Phishing automation'],
  },
  'security/soc-desk': {
    kicker: 'Offensive security', title: 'Started on the red team',
    meta: '2020 →',
    text: 'Red-team exercises, penetration tests and web/network vulnerability assessments across province-wide I&IT, with custom tooling, C2 and Splunk apps, and reports for senior management.',
    tags: ['Penetration testing', 'Red team', 'Custom tooling'],
  },
  'security/shield': {
    kicker: 'Cloud security', title: 'Microsoft 365 and Cloudflare',
    text: 'Microsoft 365 security and compliance configuration, and a full Cloudflare tenant set up and integrated with Entra ID for a medium-sized business operating in an EU jurisdiction.',
    tags: ['Microsoft 365', 'Cloudflare', 'Entra ID'],
  },

  // ---------- AI ----------
  'ai/model': {
    kicker: 'AI', title: 'Agentic engineering with evidence',
    text: 'Heavy, disciplined use of Claude Code and GitHub Copilot agents: guardrails in the repo, human review on every change, and tests as proof. That is how an 8-day integration re-platform shipped with 320 tests.',
    tags: ['Claude Code', 'GitHub Copilot', 'MCP', 'AGENTS.md'],
  },
  'ai/prompt-screen': {
    kicker: 'AI', title: 'Prompt → review → evidence',
    text: 'The delivery path from the AI engineering handbook: a prompt becomes a reviewed pull request, then a DEV install with ATF, and the evidence is kept. Also: Microsoft Security Copilot for phishing triage.',
    tags: ['Azure DevOps', 'GitHub Actions', 'Security Copilot'],
  },
  'ai/agent-1': {
    kicker: 'AI', title: 'Popfold, built with AI',
    text: 'This site runs on Popfold, a scroll-driven 3D engine built with Claude Code: the tower, the pipes, the studio and the Blender pipeline behind it.',
    tags: ['three.js', 'TypeScript', 'Claude Code', 'Blender'],
  },

  // ---------- design ----------
  'design/architecture-board': {
    kicker: 'Design', title: 'Architecture first',
    text: 'Solution design documents, integration architecture, risk-model design and stakeholder workshops with ServiceNow, Splunk, Microsoft and IBM.',
    tags: ['Solution architecture', 'Integration design', 'Workshops'],
  },
  'design/drafting-table': {
    kicker: 'Design', title: 'Interfaces for analysts',
    text: 'Vue 3 consoles that make complex systems usable: an 11-view integration admin console, the Risk Model Workbench, and per-CI risk context panels.',
    tags: ['Vue 3', 'UX', 'ServiceNow UI pages'],
  },
  'design/popfold': {
    kicker: 'Design', title: 'Popfold: one engine, many sites',
    text: 'The 3D engine behind this tower is portable: the same code runs a decorator’s showcase with a folding compact, a consulting site in a modelled room, and this building, each with its own look, story and studio.',
    tags: ['three.js', 'Design systems', 'Portability'],
  },

  // ---------- foundations ----------
  'foundations/timeline': {
    kicker: 'Career', title: '15+ years of integration and automation',
    meta: 'Ontario Public Service · 2009 – now',
    text: 'From datacenter operations (HP Server Automation across 8,000+ servers, runbook automation, closed-loop incidents) to the government’s first Azure hosting (GoCloud), to ServiceNow security operations. One thread: integration and automation around ITSM and the CMDB.',
    tags: ['Treasury Board Secretariat', 'Ministry of Government Services', 'Georgian College'],
    links: [{ label: 'LinkedIn', href: LINKEDIN }],
  },
  'foundations/tech-board': {
    kicker: 'Foundations', title: 'The toolbox',
    text: 'ServiceNow (SecOps and platform, SDK/Fluent, ATF, IRE), Microsoft Defender, Sentinel and Splunk, Azure (Bicep, Entra ID, Key Vault, Graph), Azure DevOps and GitHub Actions, Microsoft 365, Cloudflare. Languages: TypeScript, JavaScript, Kotlin, Python, PowerShell, KQL, SQL, Ruby, ClojureScript.',
    tags: ['ServiceNow', 'Azure', 'Defender', 'Splunk', 'TypeScript', 'Kotlin'],
  },
  'foundations/cv': {
    kicker: 'Resume', title: 'CV coming soon', text: 'A downloadable CV is on its way. Until then, LinkedIn has the full history.',
    tags: ['Open to consulting', 'Speaking'],
    links: [{ label: 'LinkedIn', href: LINKEDIN }],
  },
};
