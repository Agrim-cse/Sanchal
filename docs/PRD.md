# Product Requirements Document (PRD): Sanchal

**Project Name:** Sanchal (CivicTech Track)  
**Event:** 24-Hour Web Development Hackathon, IIITDM Kancheepuram  
**Jurisdiction / Context:** Greater Chennai Corporation (GCC), Tamil Nadu  
**Document Purpose:** Master technical specification, architectural reference, design system guideline, and phase-execution standard across all developer environments.  
**UI/UX Standard:** Warm Minimalist Editorial & High-Craft Architectural Design System  
**Version:** 2.0.0 (Approved Visual & Functional Specification — Single Source of Truth)

---

## 1. Project Overview & Problem Statement

Residents and commuters across urban centers regularly experience severe disruptions due to uncoordinated public works. Roadways are repeatedly dug up in rapid succession by independent utility and municipal authorities (e.g., Chennai Metro Water, Tamil Nadu Electricity Board — TNEB, Public Works Department — PWD, and telecom operators).

Key manifestations of this breakdown include:
* **Fragmented Information:** Project timelines, contractor assignments, and excavation schedules reside in siloed departmental databases or paper tenders without public visibility.
* **Compounding Delays:** Without predictive intelligence, initial contractor slippage goes unnoticed until deadlines have long expired.
* **Wasted Public Funds & Road Destruction:** Freshly resurfaced bitumen roads are excavated within weeks by another department, causing recurring budget drains and road safety hazards.
* **Citizen Frustration & Disempowerment:** Citizens face traffic bottlenecks and hazardous trenches without an accessible channel to verify schedules or hold contractors and authorities accountable.

---

## 2. Core Objective

**Sanchal** is an AI-powered municipal intelligence and spatial conflict resolution platform engineered to enforce the **"Dig-Once" doctrine** across municipal works. It unifies disparate infrastructure projects onto an interactive geospatial map, utilizes Machine Learning to forecast project completion slippage, resolves inter-departmental spatial overlaps with automated joint execution permits, ingests real-time civic grievances from social media via NLP, and empowers citizens through multilingual WhatsApp inquiry bots and one-click official grievance (CPGRAMS/RTI) drafting.

---

## 3. Target Audience & Stakeholders

| Stakeholder Persona | Core Needs & Frustrations | Value Delivered by Sanchal |
| :--- | :--- | :--- |
| **Citizens & Commuters** | Lack visibility into why roads are excavated; have no simple escalation mechanism when projects stall. | Real-time map visibility, WhatsApp chatbot updates in native languages (Tamil, Hindi, English), and 1-click CPGRAMS grievance generation. |
| **Municipal Authorities (GCC / Ward Engineers)** | Lack unified operational visibility across utility agencies; difficult to penalize failing contractors. | Mission Control Dashboard, aggregated KPI metrics, Contractor Reliability Index (CRI), and automated escrow freeze controls. |
| **Utility Departments (Metro Water, TNEB, PWD, Telecom)** | Work on conflicting schedules; suffer costly repairs when accidentally cutting other utility cables. | Automated "Dig-Once" spatial conflict engine that alerts on overlapping coordinate buffers and facilitates joint execution permits. |

---

## 4. UI/UX Design System & Layout Architecture (Master Visual Spec)

> **MANDATORY DIRECTIVE FOR ALL PHASES:**  
> The approved visual design system transitions away from generic dashboard aesthetics into a **Warm Minimalist, Editorial High-Craft Architectural Design Language** (modeled directly on bespoke atelier and luxury craftsmanship design systems). All pages, cards, modals, and navigation components must strictly adhere to the tokens, typography, grid proportions, and micro-interactions detailed below.

```
+------------------------------------------------------------------------------------------------------------------------+
| TOP ANNOUNCEMENT TICKER: [Pre-Christmas Cut-Off / Public Advisory Banner — #D6CEBE]                                 [x]|
+------------------------------------------------------------------------------------------------------------------------+
| HEADER: [BRAND LOGO (Serif/Tracked)]   [NAV: DASHBOARD · MAP · CONFLICTS · GRIEVANCES · AUDIT]   [ICONS: User · Search]|
+------------------------------------------------------------------------------------------------------------------------+
| SECTION 1: EDITORIAL STORY & SPATIAL TAXONOMY (Asymmetric 40 / 60 Split)                                              |
|   LEFT COLUMN (40%):                                         |   RIGHT COLUMN (60%):                                  |
|   - Serif Statement Headline (Generational Craft/Civic Trust)|   - Full-Bleed Architectural / Field Drone Photography |
|   - Underlined Link ("Explore our active projects")          |     (Site engineers, urban topography, road surveys)   |
|   - Numbered Index Category Menu:                            |                                                        |
|       01 METRO WATER INFRASTRUCTURE                          |                                                        |
|       02 TNEB POWER CONDUITS                                 |                                                        |
|       03 SMART CITY OPTICAL FIBRE                            |                                                        |
+------------------------------------------------------------------------------------------------------------------------+
| SECTION 2: ENTITY SHOWCASE & DELAY INTELLIGENCE (Asymmetric 60 / 40 Split)                                            |
|   LEFT COLUMN (60%):                                         |   RIGHT COLUMN (40%):                                  |
|   - Warm studio/cartographic view of corridor                |   - Serif Project Title ("OMR Express Corridor")       |
|   - Minimal spatial status info line at base                 |   - Refined Narrative Scope & Contractor Details       |
|                                                              |   - Underlined Action Link ("Explore further")         |
+------------------------------------------------------------------------------------------------------------------------+
| SECTION 3: FEATURED CONFLICT & DUAL-MEDIA STAGING                                                                     |
|   LEFT TOP: Tag [FEATURED] · Title · Resolution Summary      |   RIGHT COLUMN:                                        |
|   LEFT BASE: Inset vector map / trench diagram crop          |   - High-impact landscape scene of roadway             |
+------------------------------------------------------------------------------------------------------------------------+
| FLOATING WIDGET (Bottom Right): Rounded Dark Pebble Action Button (#1A1A1A with White Emblem)                          |
+------------------------------------------------------------------------------------------------------------------------+
```

### 4.1. Color Palette

The interface is built upon a warm organic foundation of unbleached parchment, warm limestone, charcoal typography, and subtle natural wood/stone accents:

| Token Name | Hex Code | Visual Swatch Role & Usage |
| :--- | :--- | :--- |
| `--color-canvas-base` | `#FFFFFF` | Crisp pure white canvas for high-contrast image cutouts and clean editorial sections. |
| `--color-canvas-warm` | `#FBFBFA` / `#F8F6F0` | Warm alabaster / linen primary page background; delivers a calm, tactile reading atmosphere. |
| `--color-surface-tint`| `#F4F0EB` / `#EFECE6` | Warm sandstone / light putty surface for secondary cards, table alternating rows, and modals. |
| `--color-banner-sand` | `#D6CEBE` / `#CDC5B4` | Earthy sand taupe used for top announcement banners, alert ribbons, and subtle tag fills. |
| `--color-text-primary`| `#1A1A1A` / `#20201E` | Deep warm charcoal for headlines, body copy, and primary interactions (avoids harsh pure `#000`). |
| `--color-text-muted`  | `#666660` / `#757470` | Earthy graphite for narrative descriptions, metadata, designer credits, and project descriptions. |
| `--color-text-faint`  | `#9E9D98` / `#B0AEA7` | Subtle stone gray for numbered index prefixes (`01`, `02`), image captions, and subtext. |
| `--color-border-hair` | `#E5E0D8` / `#DCD6CD` | Delicate hairline borders separating sections, table rows, and modal headers. |
| `--color-accent-wood` | `#8C6239` / `#4A3525` | Warm walnut/timber accent representing grounded civic permanence and craft. |
| `--color-status-alert`| `#A83E38` / `#C24138` | Muted terracotta red for critical overlap alerts and high-urgency delay warnings (no jarring neon). |
| `--color-status-warn` | `#C88A36` / `#B87B2E` | Warm amber ochre for moderate risk projects and escrow hold states. |
| `--color-status-safe` | `#3D7858` / `#4E8A68` | Deep forest sage green for completed excavations, joint permits issued, and on-schedule works. |
| `--color-widget-dark` | `#1A1A1A` | Dark rounded pill container for floating citizen chat and inquiry assistance. |

### 4.2. Typography & Styling System

* **Primary Display & Headings (Editorial Serif):**
  * **Typefaces:** *Newsreader*, *Cormorant Garamond*, *Playfair Display*, or *Canela*.
  * **Characteristics:** High x-height, refined roman proportions, generous letterform elegance, and organic serif details.
  * **Hierarchy:**
    * Hero / Editorial Statement: `text-[26px]` to `text-[36px]`, `font-normal leading-[1.3] tracking-[-0.01em]`.
    * Section Titles (`Ebb Bar Stool`, `Oliver Modular Sofa`): `text-[28px]` to `text-[34px]`, `font-normal tracking-tight`.
    * Body Prose: `text-[13px]` to `text-[15px]`, `leading-[1.7] text-[#666660] font-light`.
* **Functional Navigation & Utility (Tracked Minimalist Sans):**
  * **Typefaces:** *Inter*, *Satoshi*, or *Cabinet Grotesk*.
  * **Characteristics:** Clean geometric structure, neutral curves, uppercase tracking.
  * **Hierarchy:**
    * Top Navigation Links: `text-[11px] uppercase tracking-[0.18em] font-medium text-[#1A1A1A] hover:opacity-70`.
    * Section Category Tags (`FEATURED`, `BROWSE BY SPACE`): `text-[10px] uppercase tracking-[0.2em] font-semibold text-[#666660]`.
    * Numbered Index Items (`01 LIVING ROOM` / `01 METRO WATER`): `text-[11px] font-medium tracking-[0.14em] text-[#1A1A1A]`.
    * Tabular Numbers (`01`, `02`, `03`): `text-[10.5px] font-mono text-[#9E9D98] mr-6`.
* **Signature Micro-Interactions & Action Links:**
  * **Underlined Editorial Links:** Replaces generic rounded CTA buttons with refined text links accompanied by a continuous offset underline:
    * CSS Rule: `underline underline-offset-[6px] decoration-[1px] decoration-[#1A1A1A] hover:decoration-[#666660] transition-colors`.
    * Examples: `"Explore our collection"`, `"Explore further"`, `"Browse Collection"`.
* **Border Radii & Spatial Treatment:**
  * Zero-radius sharp architectural geometry (`rounded-none`) for editorial imagery, category grids, and split layout columns.
  * Subtle `rounded-sm` (2px) or `rounded-md` (4px) only on small utility tags or input fields.
  * Smooth `rounded-2xl` (16px) or organic pebble shape exclusively on the floating corner chat/inquiry pill.
* **Layout Spacing & Padding Density:**
  * Unhurried, generous whitespace (`py-16` to `py-24`, `px-8` to `px-16`) allowing typography and photography to breathe.
  * High-contrast negative space balancing dense data tables with editorial calm.

### 4.3. Component Breakdown & Asymmetric Grid Architectures

The UI features four distinct structural patterns extracted directly from the reference design:

1. **Top Announcement Ribbon & Transparent Navigation (`Header.tsx`):**
   * Slim top announcement strip with warm taupe background (`#D6CEBE`) and minimal close glyph (`✕`), communicating urgent alerts (e.g., *"Active Excavation Window Closes 23 October"*).
   * Floating, spacious navbar featuring centered uppercase menu items (`SHOP / WORKS`, `MATERIALS / TENDERS`, `ABOUT`, `JOURNAL / PERMITS`, `SHOWROOM / MAP`, `CONTACT`), flanked by delicate utility icons (`User`, `Search`, `Bag/Briefcase`).
2. **Editorial Craft Narrative & Spatial Menu Split (Section 1):**
   * **Left Column (40% width):** Generous left and right padding. Features a deep editorial thesis statement, an underlined primary call-to-action, and a bottom-anchored numbered category navigation:
     ```
     BROWSE BY JURISDICTION
     01    ZONE 13 - ADYAR
     02    ZONE 14 - PERUNGUDI
     03    ZONE 15 - SHOLINGANALLUR
     ```
   * **Right Column (60% width):** Full-bleed vertical photographic panel showcasing hands-on field operations, structural engineering, or aerial geospatial surveying.
3. **Product / Infrastructure Entity Showcase (Section 2):**
   * **Left Column (60% width):** Clean studio staging with warm backdrop showcasing the specific asset or interactive spatial vector.
   * **Right Column (40% width):** Centered vertical stack comprising the serif entity title (e.g., *"Ebb Corridor"*, *"Velachery Main Pipeline"*), an explanatory narrative detailing materials, contractor craftsmanship, and technical specifications, followed by an underlined `"Explore further"` link.
4. **Featured Spotlight with Dual-Media Insets (Section 3):**
   * **Left Top Column:** Tracked `FEATURED` tag, serif headline (*"Oliver Modular Excavation Scheme"*), descriptive paragraph, designer/contractor collaboration credit, and underlined action link.
   * **Left Bottom Inset:** Secondary cutout studio rendering against pure white.
   * **Right Column:** Expansive landscape photography capturing the completed environmental context.
5. **Floating Pebble Assistance Widget:**
   * Pinned to bottom-right (`fixed bottom-6 right-6 z-50`).
   * Deep charcoal/black squircle button (`w-12 h-12 bg-[#1A1A1A] rounded-2xl flex items-center justify-center shadow-lg`).
   * Houses a clean white chat bubble icon with friendly smiling curve, triggering citizen inquiries or the WhatsApp interactive drawer.

---

## 5. Core Features & Functional Requirements

### 5.1. "Dig-Once" Spatial Conflict Engine

* **Functional Need:** Detect when two or more public utility departments plan excavations along identical or intersecting road segments within overlapping project schedules.
* **Mechanism & Algorithm:**
  * Ingests GeoJSON LineString coordinates representing proposed utility trenches.
  * Uses `GeoPandas` and `Shapely` in Python to calculate a **15-meter buffer polygon** surrounding each road vector.
  * Executes spatial intersection tests (`geometry1.intersects(geometry2)`) cross-referenced against temporal windows (`start_date_1 <= end_date_2 AND start_date_2 <= end_date_1`).
  * Intersecting segments are assigned `status: "CRITICAL_OVERLAP"` and pushed to `/api/conflicts`.
* **Visual Styling & Interaction:**
  * Represented within the warm editorial canvas as high-contrast terracotta and sage line drawings with architectural linework and clean hairline callout banners.
  * The Joint Execution Permit workflow presents an official editorial certificate with serif headers and refined action links (*"Issue Unified Dig-Once Permit"*).

### 5.2. Machine Learning Slippage & Delay Predictor

* **Functional Need:** Prevent unmonitored project delays by calculating the empirical risk of a public works project missing its tender completion date.
* **Mechanism & Algorithm:**
  * Tabular Gradient Boosting model trained using **LightGBM** (`scikit-learn`, `joblib`).
  * Features evaluated:
    * `contractor_historical_delay_avg`: Prior performance track record.
    * `project_length_km` & `estimated_cost_cr`: Scope and complexity.
    * `monsoon_seasonality_index`: Meteorological risk factors in the region.
    * `department_coordination_penalty`: Penalty score if spatial conflict is detected.
  * Outputs a continuous `delay_risk_score` (0–100%) and projected slippage in days (`delay_days = Math.round((score / 100) * totalDays * 0.4)`).
* **Visual Styling & Interaction:**
  * Elegantly typeset project cards with serif project names, subtle hairline dividers, tabular completion dates, and terracotta/ochre/sage progress indicators that integrate harmoniously with the warm linen background.

### 5.3. Automated Social Grievance Ingestion & NLP Engine

* **Functional Need:** Systematically capture scattered citizen complaints posted across social channels regarding open pits, broken barricades, and stalled excavations.
* **Mechanism & Algorithm:**
  * Ingests citizen reports from simulated social endpoints (Twitter/X and Facebook).
  * Processes textual posts through a Hugging Face `DistilBERT` text classification pipeline.
  * Categorizes urgency into tiers:
    * `HIGH`: Mentions of open hazards, accidents, school zones, hospital access blockages.
    * `MEDIUM`: Severe traffic bottlenecks, broken water mains, power cuts.
    * `LOW`: General dust or noise inconvenience.
  * Automatically links grievances to the corresponding `related_project_id`.
* **Visual Styling & Interaction:**
  * Editorial feed of citizen dispatches featuring understated typography, subtle platform badges, and quiet status indicators with 1-click CPGRAMS escalation links.

### 5.4. Multilingual WhatsApp Citizen Portal

* **Functional Need:** Provide low-friction, universal access for citizens without requiring mobile app installation or high-bandwidth connectivity.
* **Mechanism & Architecture:**
  * Implemented using a Twilio WhatsApp Webhook endpoint (`POST /api/whatsapp/webhook`).
  * Citizen sends a text containing their neighborhood or shares a live GPS WhatsApp location pin.
  * Reverse geocoding via OpenStreetMap (OSM) Nominatim API translates coordinates to road segment identifiers.
  * The backend queries active works in that spatial boundary and translates the status updates into the citizen's preferred native language (Tamil, Hindi, or English) using `deep-translator`.
* **Visual Styling & Interaction:**
  * Triggered on desktop via the floating bottom-right pebble widget (`#1A1A1A`), opening a simulated WhatsApp chat interface styled with warm muted sand tones.

### 5.5. 1-Click Auto-CPGRAMS / RTI Generator

* **Functional Need:** Allow citizens and resident welfare associations (RWAs) to generate legally structured grievance petitions to CPGRAMS and RTI authorities.
* **Mechanism & Workflow:**
  * Bundles citizen complaint text, geo-coordinates, contractor details, tender numbers, and delay metrics into an official standardized Government of India grievance template.
  * Client-side generation with `jsPDF` produces a formal petition complete with reference registration number, timestamp, and mandatory 4-point administrative inspection requests.
* **Visual Styling & Interaction:**
  * Styled as an official architectural document modal with classic serif headlines, structured hairline grid cells, and clean underlined download links.

---

## 6. Technology Stack & API Matrix

| Architectural Domain | Technology / Library | Version | Technical Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (App Router)** | `15.x / React 19` | Server and client component composition, dynamic routing, edge rendering. |
| **Styling & Design Tokens** | **Tailwind CSS v4** | `4.x` | Custom warm palette variables (`--color-canvas-warm`, etc.), precise typography control. |
| **Typography Fonts** | **Google Fonts (Newsreader & Inter)** | Web Fonts | Editorial serif for headlines/narrative; clean tracked sans for UI metadata. |
| **Component Primitives** | **Radix UI / `shadcn/ui`** | Latest | Accessible modal overlays, drawers, and tabs styled with warm minimalism. |
| **Spatial Map Engine** | **`react-leaflet` + Leaflet** | `4.2.1 / 1.9.4` | Smooth 60fps vector linework; custom warm CartoDB / grayscale tile themes. |
| **Map Base Tiles** | **CartoDB Positron / Grayscale** | Web Tile CDN | Clean, high-legibility light base tiles complementing the warm linen canvas. |
| **Backend REST API** | **FastAPI** | `0.110+` | High-speed asynchronous Python framework with auto-generated Swagger OpenAPI docs. |
| **ASGI Server** | **Uvicorn** | `0.28+` | Lightweight, high-performance production server for asynchronous Python. |
| **Database & ORM** | **SQLite + SQLAlchemy** | `2.0+` | Serverless embedded relational database with schema validation and rapid seeding. |
| **Spatial Calculation** | **`GeoPandas` & `Shapely`** | `0.14+ / 2.0+`| Industry-standard geometric polygon buffering and intersection math. |
| **Geocoding Engine** | **OSM Nominatim API** | REST API | Free open-source forward and reverse location-to-coordinate geocoding. |
| **ML Predictive Engine**| **LightGBM & `scikit-learn`**| Latest | Fast, tabular gradient boosting with high accuracy on heterogeneous project data. |
| **NLP Classification**  | **Hugging Face Transformers**| `DistilBERT` | High-throughput zero-shot sentiment, urgency, and grievance tier tagging. |
| **Document Generation** | **`jsPDF` / ReportLab** | Latest | Deterministic client-side and server-side PDF generation for CPGRAMS drafts. |
| **Citizen Messaging**   | **Twilio WhatsApp API** | Sandbox / Cloud | Ubiquitous citizen interaction channel with zero app-download barrier. |
| **Translation Engine**  | **`deep-translator`** | Latest | Rapid multi-language translation layer (Tamil, Hindi, English). |

---

## 7. Data Models & API Specifications

### 7.1. Relational Data Entities (SQLAlchemy / TypeScript)

```
+------------------------------------+          +------------------------------------+
|            PublicWork              |          |             Contractor             |
+------------------------------------+          +------------------------------------+
| id: String (PK) [PRJ-CHE-101]      |          | id: Integer (PK)                   |
| road_name: String                  |          | name: String                       |
| department: String                 |          | cri_score: Integer (0-100)         |
| contractor: String                 |<-------->| active_tender_id: String           |
| start_date: String (YYYY-MM-DD)    |          | active_project: String             |
| end_date: String (YYYY-MM-DD)      |          | department: String                 |
| delay_risk_score: Integer (0-100)  |          | escrow_status: String              |
| status: Enum (CRITICAL/MOD/OK)     |          | escrow_amount_cr: Float            |
| description: String                |          | projects_completed: Integer        |
| estimated_cost_cr: Float           |          | avg_delay_days: Integer            |
| cpgrams_count: Integer             |          +------------------------------------+
| coordinates: JSON (LineString)     |
+------------------------------------+
                  ^
                  | 1:N
                  v
+------------------------------------+          +------------------------------------+
|          SocialGrievance           |          |           ConflictAlert            |
+------------------------------------+          +------------------------------------+
| id: Integer (PK)                   |          | id: String (PK) [CONF-01]          |
| platform: String (Twitter/FB)      |          | road_name: String                  |
| user_handle: String                |          | departments: JSON [Array]          |
| content: Text                      |          | project_ids: JSON [Array]          |
| related_project_id: FK             |          | severity: Enum (CRITICAL/HIGH)     |
| urgency_tier: Enum (HIGH/MED/LOW)  |          | description: Text                  |
| location_mention: String           |          +------------------------------------+
| likes: Integer | retweets: Integer |
| cpgrams_filed: Boolean             |
| timestamp: DateTime                |
+------------------------------------+
```

### 7.2. Core REST Endpoints

| HTTP Method | Route Path | Parameters / Body | Description & Return Schema |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | None | Service liveness probe (`{"status": "ok"}`). |
| `GET` | `/api/geojson/roadworks` | None | Returns full GeoJSON FeatureCollection of all road segments with geometry and properties. |
| `GET` | `/api/public-works` | `status`, `department` | Lists all public works filtered by agency or risk classification. |
| `GET` | `/api/public-works/{id}` | `id` (path) | Detailed project entity with timeline, contractor, and coordinates. |
| `GET` | `/api/contractors` | None | Returns all contractors ordered descending by Contractor Reliability Index (`cri_score`). |
| `GET` | `/api/grievances` | `urgency_tier` | Returns ingested civic social posts filtered by `HIGH`, `MEDIUM`, or `LOW`. |
| `GET` | `/api/conflicts` | None | Returns spatial overlap incidents flagged by the Shapely buffer engine. |
| `GET` | `/api/dashboard/summary`| None | Aggregated counts: active projects, critical overlaps, average CRI, and grievance metrics. |
| `POST`| `/api/predict-delay` | Project scope JSON | Executes LightGBM inference and returns predicted slippage percentage and days. |
| `POST`| `/api/whatsapp/webhook` | Twilio Webhook payload | Ingests WhatsApp queries, geocodes locations, and responds in Tamil/Hindi/English. |
| `POST`| `/api/cpgrams/generate` | Grievance ID JSON | Produces pre-filled legal PDF draft for administrative escalation. |

---

## 8. Execution Roadmap (24-Hour Hackathon Scope)

```
[Hours 0-2: Setup & Design Tokens]  -->  [Hours 2-7: Backend/ML Engine]  -->  [Hours 7-13: Warm Editorial UI]
                                                                                       |
[Hours 22-24: Submit & Demo]        <-- [Hours 16-22: Mandatory Rest]   <-- [Hours 13-16: WhatsApp/CPGRAMS]
```

### Phase 1: Setup & Foundations (Hours 0–2)
* [x] Initialize Git repository monorepo structure with `/frontend` (Next.js) and `/backend` (FastAPI).
* [x] Configure the approved warm minimalist design tokens (`--color-canvas-warm`, serif typography, hairline borders) in `globals.css`.
* [x] Formulate `roadworks.geojson` containing coordinate polylines for Chennai arterial roads.
* [x] Initialize and seed embedded SQLite database (`sanchal.db`) with projects, contractors, and grievances.

### Phase 2: Backend, Spatial Solver & ML (Hours 2–7)
* [x] Implement FastAPI REST routes for `/api/public-works`, `/api/contractors`, and `/api/conflicts`.
* [x] Develop `Shapely` 15-meter buffer intersection routine to flag `CRITICAL_OVERLAP` events automatically.
* [x] Implement LightGBM delay prediction script with feature preprocessing and expose `/api/predict-delay`.
* [x] Implement mock grievance ingestion pipeline with DistilBERT zero-shot classification logic.

### Phase 3: Dashboard & Editorial Interface (Hours 7–13)
* [ ] Implement the top announcement ribbon (`#D6CEBE`) and transparent horizontal navigation header.
* [ ] Construct the Asymmetric 40/60 Editorial Craft section with serif statement, underlined CTA, and numbered category index (`01`, `02`, `03`).
* [ ] Build the Entity Showcase section (60/40 split) with studio imagery/vector maps and narrative copy.
* [ ] Integrate Leaflet map using clean warm tiles with hairline polylines and organic status glow.
* [ ] Mount the floating bottom-right pebble button (`#1A1A1A`) with smooth chat trigger.

### Phase 4: Integrations & Document Generator (Hours 13–16)
* [ ] Implement interactive Dig-Once Joint Permit modal with editorial certificate layout.
* [ ] Implement `CpgramsModal.tsx` auto-filled draft generator with print and PDF download support.
* [ ] Wire Twilio WhatsApp webhook listener and integrate `deep-translator` for Tamil, Hindi, and English responses.
* [ ] Connect frontend data hooks to live FastAPI endpoints.

### Phase 5: Mandatory Rest & Code Freeze (Hours 16–22)
* [ ] Enforce complete repository code freeze.
* [ ] 6 hours of mandatory team rest and recharge.

### Phase 6: Polish, Deployment & Submission (Hours 22–24)
* [ ] Deploy Next.js frontend to Vercel.
* [ ] Deploy FastAPI backend to Render / Railway with persistent GeoJSON mounts.
* [ ] Record high-definition 2–5 minute demonstration video highlighting the Warm Minimalist UI, Dig-Once engine, and WhatsApp chatbot.
* [ ] Finalize repository documentation and submit project via the hackathon portal before the 9:00 PM deadline.

---

## 9. Mandatory Hackathon Submission Checklist

- [x] **Code Repository:** Monorepo containing full frontend and backend code cleanly organized in the Sanchal Git folder.
- [x] **Comprehensive Documentation:** Production-ready `README.md` and `docs/PRD.md` detailing problem statement, architecture, approved warm editorial design system, API matrix, and execution plan.
- [ ] **Live Cloud Deployment:** Accessible web application hosted on Vercel with live backend connectivity.
- [ ] **Demonstration Video:** 2–5 minute video explaining urban excavation conflicts, demonstrating Sanchal's Dig-Once engine, ML delay card, and WhatsApp chatbot.
- [ ] **Final Submission Form:** Google Form submitted with live URLs, GitHub repository link, and team details strictly prior to 9:00 PM, Saturday.
