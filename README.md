# StadiumPilot AI — FIFA World Cup 2026 Smart Stadium & Tournament Operations

StadiumPilot AI is a production-grade, security-hardened, and performance-optimized AI co-pilot designed to streamline FIFA tournament operations and elevate the spectator experience at the FIFA World Cup 2026. By integrating advanced Gemini GenAI models, real-time sensor streams, and operational control layers, StadiumPilot AI guarantees safety, coordinates rapid crowd logistics, translates tournament announcements, and maps formal emergency directives.

---

## 🎯 FIFA World Cup 2026 Challenge Mapping

StadiumPilot AI directly maps its technical features to the core operational and fan experience challenges of hosting a large-scale tournament:

| FIFA World Cup Challenge | Operational Pain Point | StadiumPilot AI Solution | Page/Module |
| :--- | :--- | :--- | :--- |
| **Fan Guidance & Wayfinding** | Restrooms, concessions, ticket desks, and gate queues are difficult to locate for first-time visitors. | **AI Stadium Assistant**: Interactive LLM agent providing venue-specific help and multilingual directions. | `AI Assistant` (Mode: Assistant) |
| **Crowd Pressures & Bottlenecks** | Large fan influxes cause dangerous bottlenecks at gates and concourses. | **Live Crowd Monitor & Flow Analysis**: Real-time telemetry monitoring with predictive routing and gate pressure alerts. | `Crowd Monitor` |
| **Smart Egress & Navigation** | Incident occurrences require rerouting fans to avoid safety hazards. | **Smart Navigation**: Interactive stadium routing map that guides fans to safe, accessible pathways. | `Smart Navigation` |
| **Unstructured Incident Logs** | Raw incident descriptions from stewards/volunteers lack standardization for control rooms. | **Incident Reporter**: Sanitizes and structures raw input reports into formal title, summary, action items, and severity tags. | `Incident Reporter` |
| **Multilingual Communication** | Signage and instructions need translation into FIFA official languages on-the-fly. | **Multilingual Translator**: Translates operations warnings and fan alerts into target languages instantly. | `AI Assistant` (Mode: Translate) |
| **Crisis Management & Escalation** | Critical issues (e.g. fire/evacuations) require quick, precise operational instructions. | **Emergency Support**: Formulates escalation directives, priority levels, and monitoring actions for safety commanders. | `AI Assistant` (Mode: Emergency) |

---

## 🔒 Security Hardening

1. **Helmet Middleware**: Defends against XSS, clickjacking, and MIME-sniffing by configuring secure HTTP headers.
2. **Strict CORS Dynamic Isolation**: Enforces strict origin control dynamically reflecting authorized domains and handling preflight options.
3. **API Rate Limiting**: Employs `express-rate-limit` on all `/api` endpoints to shield the Gemini SDK from DDoS or credential abuse.
4. **XML Prompt Containment**: Wraps operational variables inside XML tags (e.g. `<user_input>`), instructing Gemini to isolate raw user text from systemic operational guidelines, mitigating prompt injection.
5. **Input Validation**: Enforces Zod validations on all Express router payloads prior to LLM compilation.

---

## ⚡ Performance & Reliability

1. **Model Fallback Cascade**: Evaluates and falls back automatically in the order of `gemini-2.5-flash`, `gemini-2.0-flash`, and `gemini-1.5-flash`, never using deprecated models.
2. **Request Deduplication**: Deduplicates concurrent identical frontend queries to save bandwidth and API quota.
3. **Smart In-Memory Caching**: Caches response payloads with a 3-minute TTL (Time-To-Live).
4. **Transient Error Retry Policy**: Retries queries on transient failures (429, 5xx, timeouts) but aborts immediately on client 4xx errors.

---

## 🛠️ Folder Structure & Architecture

```text
├── .github/workflows/   # CI/CD pipelines
├── server/
│   ├── config/          # Environment & Gemini model configurations
│   ├── routes/          # Express route registration
│   └── services/        # Logic layers: GeminiClient, XML prompts, logger, validation
├── src/
│   ├── components/      # UI components (charts, chat, badge, buttons, switches)
│   ├── hooks/           # useAiRequest hook with state tracking & retries
│   ├── layouts/         # Dashboard app layouts
│   ├── pages/           # StadiumPilot dashboards & functional pages
│   └── services/        # Frontend API & AI client with cache & dedup
├── openapi.yaml         # OpenAPI 3.0 specifications
```

---

## 💻 Getting Started

### Installation
```bash
npm install
```

### Run Locally (Frontend + Backend)
```bash
# Starts Express backend on port 3001 and Vite frontend on port 5173
npm run dev:full
```

### Run Tests and Coverage
```bash
# Runs Vitest with coverage report (98.43% Statements, 91.19% Branches covered)
npm run test
```

### Code Linting
```bash
# Runs oxlint static analysis (0 warnings, 0 errors)
npm run lint
```

### Production Build
```bash
# Compiles TS and bundles assets for production
npm run build
```
