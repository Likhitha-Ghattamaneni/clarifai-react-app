# ClarifyAI — Company Document Insight Assistant

## Abstract
ClarifAI is an internal, role-aware question-answering system designed for organizations that maintain controlled knowledge bases. The application allows employees to pose natural-language questions and receive precise, citation-backed responses derived exclusively from sanctioned documents. The solution adopts a Retrieval-Augmented Generation (RAG) pattern on AWS, coupling managed retrieval (Bedrock Knowledge Bases over OpenSearch Serverless) with lightweight generation via Bedrock foundation models. A React interface, hosted on Amplify and secured with Amazon Cognito, ensures simple access control (Admin vs Employee), rapid deployment, and low operational overhead.

---

## List of Figures
- System Architecture Overview — ClarifAI data flow and components (ClarifAI-FLowchart.jpeg)
- Cognito — User Pool Configuration — pool settings and app client
- Cognito — Groups — Admins and Users with descriptions
- Cognito — Hosted UI Domain — domain configuration page
- Identity Pool — Role Mapping — mapping Admins to Admin role
- S3 — Documents Bucket — bucket layout, prefixes, encryption
- OpenSearch Serverless — Vector Collection — collection overview screen
- Bedrock Knowledge Base — Data Source — S3 connector and configuration
- Bedrock Knowledge Base — Sync Status — successful sync with timestamps
- API Gateway — /query Method — method integration and Cognito authorizer
- Lambda — Function Configuration & Logs — handler, role, and a successful invocation log
- Amplify Hosting — Build & Domain — build settings, SPA rewrite rule, deployed app

---

## Introduction
Traditional enterprise chat/search tools are brittle. They expect exact phrasing, don’t reveal where answers came from, and can drift from policy. ClarifAI addresses this issue by grounding every answer in a curated corpus and displaying citations, thereby enhancing trust, usability, and auditability.

ClarifAI is an internal Question-Answering (Q&A) assistant for organizations that need trustworthy, citation-backed answers sourced only from their approved documents. It pairs a simple React UI with a retrieval-augmented backend so employees can ask natural questions and immediately see the sources that support each response.

---

## Existing System
Most legacy enterprise bots rely on keyword search or rule-based patterns to match questions to predefined answers. Some newer systems call a general LLM directly without constraining it to internal knowledge.

### Drawbacks
- Prompt fragility: Users must guess the “right” wording; minor phrasing changes produce inconsistent results.
- No provenance: Answers rarely include citations, reducing trust and auditability.
- Domain drift & hallucinations: General LLMs may invent facts or pull from non-approved sources.
- Operational friction: Pipelines are not designed for frequent document updates and re-indexing.

---

## Proposed System
ClarifAI is a serverless, role-aware, retrieval-augmented assistant that confines answers to an approved document corpus. Curated files live in Amazon S3 and are indexed by Bedrock Knowledge Bases into OpenSearch Serverless for semantic retrieval. A React UI hosted on Amplify authenticates users with Amazon Cognito and calls a secured API (API Gateway → Lambda). Lambda orchestrates Bedrock’s retrieve-and-generate to compose grounded responses and returns citation-backed answers. The objective is to deliver reliable, policy-aligned outputs with minimal operational overhead and clear access controls.

### Key Features (detailed)
- Grounded responses with citations: Retrieve relevant passages before generation; show sources for transparency.
- Role-based access: Admins can upload and sync; Employees can only query. UI adapts based on group.
- Secure, low-ops stack: Cognito for auth; API Gateway + Lambda for a thin, auditable API; OpenSearch Serverless for vectors; Amplify Hosting for fast deployments.
- Observability: CloudWatch logs for API/Lambda; visible KB Sync status.

---

## Users
**Admin**

- Sign in via Cognito Hosted UI.  
- Upload documents in the Admin panel (S3 via Amplify Storage).  
- Open the Bedrock Knowledge Base and click Sync; wait for “successful” status.  
- Run a smoke-test query that should reference the new content.

**Employee**

- Sign in via Cognito Hosted UI.  
- Enter a natural-language question and submit.  
- Read the answer and review the citations (open the source if needed).

**Maintenance** - When documents change, repeat: upload → Sync → quick test.

---

## System Requirement Specifications

### Software Requirements
- Cloud services: Amazon S3, OpenSearch Serverless (Vector), Bedrock Knowledge Bases + Foundation Models, AWS Lambda (Python 3.11), Amazon API Gateway, Amazon Cognito (User Pool & Identity Pool), AWS Amplify Hosting.
- Frontend stack: React, aws-amplify, @aws-amplify/ui-react.
- DevOps: Git repository integrated with Amplify CI/CD; environment variables for endpoints/ids.

### Hardware Requirements
- No dedicated on-premise hardware. End-users require a modern web browser and a stable internet connection.

### Functional Requirements
- Authentication: Users authenticate via Cognito Hosted UI and can sign out.
- Document Upload (Admin): Admins can upload documents to a designated S3 prefix using the UI.
- Indexing Control (Admin): Admins can trigger and monitor Knowledge Base Sync operations after uploads.
- Authenticated Query: Authenticated users can enter a natural-language question and submit it to the API.
- Respond to Query: System returns an answer with citations derived from internal documents.
- Role Enforcement: Only Admins receive temporary S3 write credentials; Employees cannot upload.
- API Protection: API Gateway validates Cognito tokens and rejects unauthenticated requests.
- Provenance: Responses must include links/titles identifying the supporting sources.

---

## System Architecture
ClarifAI follows a layered RAG architecture that separates concerns for robustness and security:

- **Storage layer** — Amazon S3 is the source of truth for curated documents (encrypted at rest). Uploads are intentional and traceable.
- **Retrieval layer** — Bedrock Knowledge Base ingests from S3, performs chunking and embeddings, and stores vectors in OpenSearch Serverless for semantic retrieval. A manual Sync ensures admins control when new content becomes queryable.
- **Application/API layer** — A minimal AWS Lambda function, fronted by API Gateway, validates tokens, orchestrates retrieval-and-generation with Bedrock, and formats the response as `{ text, citations[] }`.
- **Presentation/Auth layer** — A React single-page app hosted on Amplify uses Cognito for sign-in/sign-out and a group-aware UI (Admin vs Employee).

### Architecture Diagram
*(ClarifAI-FLowchart.jpeg)*

---

## System Implementation
ClarifAI consists of a controlled content onboarding path and a secure query path. Admins onboard content to S3, then explicitly sync the Knowledge Base so vectors in OpenSearch reflect the current corpus. End-users authenticate via Cognito; the UI calls the API with an ID token; Lambda invokes Bedrock retrieve-and-generate, constrained by the Knowledge Base, and returns an answer plus citations. This flow balances freshness, control, and transparency.

---

## Project Modules ( WE NEED TO UPDATE THIS SECTION WITH OUR WORK AND PICTURES)

### Amplify-Hosted React UI
A single-page application deployed via AWS Amplify Hosting.  
**Purpose here:** Provides sign-in, query form, results with citations, and Admin upload. Uses Amplify UI `<Authenticator/>` for quick and secure authentication integration.

### Amazon Cognito (User Pool + Identity Pool)
Managed user directory (User Pool) and scoped AWS credentials (Identity Pool).  
**Purpose here:** Authenticate users, assign them to Admins or Users, and grant temporary S3 write-only to Admins.

### Amazon API Gateway
Managed API front door supporting authorizers and CORS.  
**Purpose here:** Exposes POST /query secured by a Cognito authorizer; enforces token checks and CORS for the Amplify domain.

### AWS Lambda (Python 3.11)
Serverless compute for short functions.  
**Purpose here:** Validates identity context and calls Bedrock retrieve-and-generate against the Knowledge Base; formats `{ text, citations[] }`.

### Bedrock Knowledge Base
Managed ingestion/chunking/embedding pipeline that connects to vector stores.  
**Purpose here:** Reads from S3, generates embeddings, stores/retrieves vectors in OpenSearch Serverless, and exposes retrieval for RAG.

### OpenSearch Serverless (Vector)
Managed vector search for semantic similarity queries.  
**Purpose here:** Stores embeddings produced during KB Sync and serves top-k passages for each query.

### Amazon S3
Durable object storage.  
**Purpose here:** Hosts the authoritative document corpus; policies enforce least privilege for read/write.

---

## Security and IAM
ClarifAI answers policy-relevant questions and exposes internal documents. We must ensure that only approved users access the app, only Admins can change the corpus, and every API call is authenticated and auditable.

AWS Identity and Access Management (IAM) defines who can do what on which resources. We couple IAM roles/policies with Cognito groups and an Identity Pool so Admins receive temporary S3 write permissions while Employees do not. API Gateway fronts the API with a Cognito authorizer that validates ID tokens.

### Controls implemented
- Least Privilege: Dedicated roles for Lambda execution, Knowledge Base access, and S3 operations.
- Group-Based Access: Two Cognito groups — Admins (upload + query) and Users (query-only).
- Credential Isolation: Identity Pool role mapping grants temporary S3 write-only to Admins.
- API Safeguards: API Gateway authorizer validates ID tokens; unauthorized requests are rejected.
- Data Protection: S3 server-side encryption by default; TLS in transit; optional CloudFront; audit trails via CloudTrail.

---

## Operational Runbook
This runbook explains how to keep ClarifAI current, reliable, and cost-efficient.

**Update Cycle:** Upload → Sync → Smoke-test a known query; confirm citations reference the new content.

**Monitoring:**
- Lambda/API metrics and logs in CloudWatch (error rates, duration, throttles).
- OpenSearch collection health, capacity, and throttling indicators.
- Bedrock latency/usage metrics to track cost/performance.

**Failure Handling:**
- 401/403: Re-authenticate; verify group membership and Identity Pool role mapping.
- Empty Retrieval: Confirm content exists and KB Sync completed; refine chunking if needed.
- Sync Required: Trigger KB Sync and re-test.

**Cost Control:** Use budgets/alarms; delete unused collections; shut down non-prod stages when idle.

**Teardown:** Empty S3 prefixes → delete API → remove Lambda → delete KB → remove OpenSearch collection → delete Cognito (Identity then User Pool) → IAM roles.

---

## Testing
- Authentication: Valid token accepted; invalid/missing token rejected.
- RBAC: Admin can upload; Employee cannot; UI hides Admin features for non-Admins.
- Index freshness: New document is not retrievable before Sync; becomes retrievable after Sync.
- Provenance: Answers include citations that resolve to the correct sources.
- API contract: `POST /query` returns `{ text, citations[] }` and HTTP 200 for valid requests.
- UI experience: SPA loads on the Amplify domain; submission state shows progress; errors are human-readable.

**Performance sanity** - Typical answer latency remains within agreed bounds under expected load.

---

## Appendix

### Installations & Guide
A. Cognito — Create User Pool + App Client; configure Hosted UI domain; create groups Admins and Users; create Identity Pool; map groups to IAM roles.  
B. S3 — Create documents bucket; set encryption; define least-privilege bucket policies; create prefixes for data sources.  
C. OpenSearch Serverless — Create a Vector collection; note collection/endpoint identifiers for the KB.  
D. Bedrock Knowledge Base — Create KB; connect S3 data source and vector store; choose embeddings model; run initial Sync; verify status.  
E. Lambda + API Gateway — Implement Python 3.11 handler to call retrieve-and-generate; deploy API with POST /query; enable Cognito authorizer and CORS.  
F. Amplify Hosting + React — Initialize React app; add Amplify libraries; configure aws-exports.js; wrap in `<Authenticator/>`; implement query form and Admin upload; connect repo to Amplify Hosting; set SPA rewrite; deploy; add Amplify domain to API CORS allowlist.

### Technologies Used
AWS S3, OpenSearch Serverless (Vector), Bedrock Knowledge Base + Foundation Model, AWS Lambda, Amazon API Gateway, Amazon Cognito, AWS Amplify Hosting, React, Amplify UI.
