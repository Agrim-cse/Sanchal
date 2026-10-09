// ─────────────────────────────────────────────────────────────────────────────
// Sanchal — Mock Data (TypeScript)
// All data mirrors the SQLite seeded data exactly.
// Used by all UI components before Phase 2 API wiring.
// ─────────────────────────────────────────────────────────────────────────────

export type WorkStatus = "CRITICAL_OVERLAP" | "MODERATE_RISK" | "ON_SCHEDULE";
export type UrgencyTier = "HIGH" | "MEDIUM" | "LOW";
export type EscrowStatus = "Locked - Awaiting Visual Audit" | "Released";

export interface PublicWork {
  id: string;
  road_name: string;
  department: string;
  contractor: string;
  start_date: string;
  end_date: string;
  delay_risk_score: number;
  status: WorkStatus;
  description: string;
  estimated_cost_cr: number;
  cpgrams_count: number;
  coordinates: number[][];
}

export interface Contractor {
  id: number;
  name: string;
  cri_score: number;
  active_tender_id: string;
  active_project: string;
  department: string;
  escrow_status: EscrowStatus;
  escrow_amount_cr: number;
  projects_completed: number;
  avg_delay_days: number;
}

export interface SocialGrievance {
  id: number;
  platform: string;
  user_handle: string;
  user_avatar_seed: string;
  content: string;
  related_project_id: string;
  urgency_tier: UrgencyTier;
  location_mention: string;
  likes: number;
  retweets: number;
  cpgrams_filed: number;
  timestamp: string;
}

export interface ConflictAlert {
  id: string;
  road_name: string;
  departments: string[];
  project_ids: string[];
  severity: "CRITICAL" | "HIGH";
  description: string;
}

// ── Public Works ──────────────────────────────────────────────────────────────
export const mockPublicWorks: PublicWork[] = [
  {
    id: "PRJ-CHE-101",
    road_name: "OMR Service Road, Perungudi",
    department: "Chennai Metro Water",
    contractor: "L&T Infrastructure",
    start_date: "2026-10-01",
    end_date: "2026-11-20",
    delay_risk_score: 82,
    status: "CRITICAL_OVERLAP",
    description: "Underground pipeline replacement — 900mm DI main",
    estimated_cost_cr: 14.5,
    cpgrams_count: 38,
    coordinates: [
      [80.2459, 12.9685],
      [80.2481, 12.9701],
      [80.2503, 12.9718],
      [80.2527, 12.9734],
    ],
  },
  {
    id: "PRJ-CHE-102",
    road_name: "OMR Service Road, Sholinganallur",
    department: "TNEB Electricity Board",
    contractor: "KEC International",
    start_date: "2026-09-25",
    end_date: "2026-11-15",
    delay_risk_score: 88,
    status: "CRITICAL_OVERLAP",
    description: "Underground HT cable laying — 33 KV feeder line",
    estimated_cost_cr: 9.2,
    cpgrams_count: 51,
    coordinates: [
      [80.2465, 12.969],
      [80.2487, 12.9706],
      [80.2509, 12.9723],
      [80.2531, 12.9739],
    ],
  },
  {
    id: "PRJ-CHE-103",
    road_name: "Velachery Main Road, Taramani",
    department: "CMRL Metro",
    contractor: "Afcons Infrastructure",
    start_date: "2026-10-05",
    end_date: "2026-12-31",
    delay_risk_score: 61,
    status: "MODERATE_RISK",
    description: "Metro Phase 2 utility diversion — water & sewerage",
    estimated_cost_cr: 22.8,
    cpgrams_count: 24,
    coordinates: [
      [80.2244, 12.9824],
      [80.2267, 12.9839],
      [80.2291, 12.9852],
      [80.2315, 12.9864],
    ],
  },
  {
    id: "PRJ-CHE-104",
    road_name: "GST Road, Chromepet Junction",
    department: "BSNL Telecom",
    contractor: "Sterlite Technologies",
    start_date: "2026-10-08",
    end_date: "2026-10-30",
    delay_risk_score: 45,
    status: "MODERATE_RISK",
    description: "OFC duct laying — 96F single mode fibre",
    estimated_cost_cr: 3.6,
    cpgrams_count: 11,
    coordinates: [
      [80.1348, 12.951],
      [80.1369, 12.9523],
      [80.1391, 12.9534],
      [80.1413, 12.9545],
    ],
  },
  {
    id: "PRJ-CHE-105",
    road_name: "GST Road, Tambaram",
    department: "Chennai Metro Water",
    contractor: "NCC Limited",
    start_date: "2026-09-20",
    end_date: "2026-10-25",
    delay_risk_score: 28,
    status: "ON_SCHEDULE",
    description: "Sewerage network upgrade — SPS outfall main",
    estimated_cost_cr: 7.1,
    cpgrams_count: 7,
    coordinates: [
      [80.1198, 12.9237],
      [80.1219, 12.9248],
      [80.124, 12.9259],
      [80.1262, 12.927],
    ],
  },
  {
    id: "PRJ-CHE-106",
    road_name: "Anna Salai, Nandanam",
    department: "TNEB Electricity Board",
    contractor: "Tata Projects Limited",
    start_date: "2026-10-03",
    end_date: "2026-11-28",
    delay_risk_score: 55,
    status: "MODERATE_RISK",
    description: "Underground cabling — 110 KV grid substation feeder",
    estimated_cost_cr: 18.4,
    cpgrams_count: 19,
    coordinates: [
      [80.2332, 13.0314],
      [80.2341, 13.0329],
      [80.2352, 13.0345],
      [80.2363, 13.0361],
    ],
  },
  {
    id: "PRJ-CHE-107",
    road_name: "ECR, Thiruvanmiyur",
    department: "CMRL Metro",
    contractor: "Larsen & Toubro",
    start_date: "2026-10-10",
    end_date: "2026-12-15",
    delay_risk_score: 15,
    status: "ON_SCHEDULE",
    description: "Utility relocation for coastal metro corridor",
    estimated_cost_cr: 31.2,
    cpgrams_count: 4,
    coordinates: [
      [80.2567, 12.9897],
      [80.2583, 12.9912],
      [80.2601, 12.9928],
      [80.2619, 12.9943],
    ],
  },
  {
    id: "PRJ-CHE-108",
    road_name: "Poonamallee High Road, Koyambedu",
    department: "BSNL Telecom",
    contractor: "Bharti Infratel",
    start_date: "2026-09-28",
    end_date: "2026-11-05",
    delay_risk_score: 77,
    status: "CRITICAL_OVERLAP",
    description: "5G backbone duct installation — transit hub connectivity",
    estimated_cost_cr: 5.9,
    cpgrams_count: 33,
    coordinates: [
      [80.1956, 13.0694],
      [80.1973, 13.0708],
      [80.1991, 13.0722],
      [80.2009, 13.0736],
    ],
  },
];

// ── Contractors ───────────────────────────────────────────────────────────────
export const mockContractors: Contractor[] = [
  {
    id: 5,
    name: "NCC Limited",
    cri_score: 91,
    active_tender_id: "TND-2026-TMB-105",
    active_project: "PRJ-CHE-105",
    department: "Chennai Metro Water",
    escrow_status: "Released",
    escrow_amount_cr: 1.8,
    projects_completed: 67,
    avg_delay_days: 3.1,
  },
  {
    id: 3,
    name: "Afcons Infrastructure",
    cri_score: 85,
    active_tender_id: "TND-2026-VLY-103",
    active_project: "PRJ-CHE-103",
    department: "CMRL Metro",
    escrow_status: "Released",
    escrow_amount_cr: 5.7,
    projects_completed: 58,
    avg_delay_days: 6.2,
  },
  {
    id: 1,
    name: "L&T Infrastructure",
    cri_score: 78,
    active_tender_id: "TND-2026-OMR-101",
    active_project: "PRJ-CHE-101",
    department: "Chennai Metro Water",
    escrow_status: "Locked - Awaiting Visual Audit",
    escrow_amount_cr: 3.6,
    projects_completed: 42,
    avg_delay_days: 12.4,
  },
  {
    id: 4,
    name: "Sterlite Technologies",
    cri_score: 71,
    active_tender_id: "TND-2026-GST-104",
    active_project: "PRJ-CHE-104",
    department: "BSNL Telecom",
    escrow_status: "Released",
    escrow_amount_cr: 0.9,
    projects_completed: 24,
    avg_delay_days: 9.8,
  },
  {
    id: 6,
    name: "Tata Projects Limited",
    cri_score: 68,
    active_tender_id: "TND-2026-ANS-106",
    active_project: "PRJ-CHE-106",
    department: "TNEB Electricity Board",
    escrow_status: "Locked - Awaiting Visual Audit",
    escrow_amount_cr: 4.6,
    projects_completed: 39,
    avg_delay_days: 14.5,
  },
  {
    id: 2,
    name: "KEC International",
    cri_score: 62,
    active_tender_id: "TND-2026-OMR-102",
    active_project: "PRJ-CHE-102",
    department: "TNEB Electricity Board",
    escrow_status: "Locked - Awaiting Visual Audit",
    escrow_amount_cr: 2.3,
    projects_completed: 31,
    avg_delay_days: 19.7,
  },
  {
    id: 7,
    name: "Bharti Infratel",
    cri_score: 54,
    active_tender_id: "TND-2026-KYB-108",
    active_project: "PRJ-CHE-108",
    department: "BSNL Telecom",
    escrow_status: "Locked - Awaiting Visual Audit",
    escrow_amount_cr: 1.5,
    projects_completed: 18,
    avg_delay_days: 22.3,
  },
];

// ── Grievances ────────────────────────────────────────────────────────────────
export const mockGrievances: SocialGrievance[] = [
  {
    id: 7,
    platform: "Twitter",
    user_handle: "@koyambedu_hub",
    user_avatar_seed: "hub7",
    content:
      "5G duct work near Koyambedu bus terminus has zero safety measures. Open trench overnight. Accident waiting to happen. @ChennaiCorpn please act!",
    related_project_id: "PRJ-CHE-108",
    urgency_tier: "HIGH",
    location_mention: "Poonamallee High Road, Koyambedu",
    likes: 678,
    retweets: 234,
    cpgrams_filed: 1,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 1,
    platform: "Twitter",
    user_handle: "@chennai_commuter",
    user_avatar_seed: "commuter1",
    content:
      "Unannounced trench dug on OMR causing major traffic bottleneck near Perungudi junction. No barricades, dangerous at night! #Chennai #RoadWorks",
    related_project_id: "PRJ-CHE-101",
    urgency_tier: "HIGH",
    location_mention: "OMR, Perungudi",
    likes: 312,
    retweets: 89,
    cpgrams_filed: 1,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    platform: "Twitter",
    user_handle: "@annaroad_daily",
    user_avatar_seed: "daily6",
    content:
      "Anna Salai near Nandanam flyover dug up again! This is the 3rd time in 18 months. When will the govt implement Dig-Once policy? #SingleWindowExcavation",
    related_project_id: "PRJ-CHE-106",
    urgency_tier: "HIGH",
    location_mention: "Anna Salai, Nandanam",
    likes: 1203,
    retweets: 489,
    cpgrams_filed: 1,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    platform: "Twitter",
    user_handle: "@omr_resident_blr",
    user_avatar_seed: "resident2",
    content:
      "TNEB digging and Metro Water also digging on the SAME stretch of OMR Sholinganallur. What is CMDA doing? This is madness! @CMOTamilNadu",
    related_project_id: "PRJ-CHE-102",
    urgency_tier: "HIGH",
    location_mention: "OMR, Sholinganallur",
    likes: 547,
    retweets: 203,
    cpgrams_filed: 1,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    platform: "Facebook",
    user_handle: "Velachery Residents Forum",
    user_avatar_seed: "forum3",
    content:
      "Metro Phase 2 utility diversion work on Velachery Main Road has been going on for 3 weeks. Dust, noise, and blocked footpaths. Residents need immediate action.",
    related_project_id: "PRJ-CHE-103",
    urgency_tier: "MEDIUM",
    location_mention: "Velachery Main Road",
    likes: 189,
    retweets: 44,
    cpgrams_filed: 0,
    timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    platform: "Twitter",
    user_handle: "@gst_road_watch",
    user_avatar_seed: "watch4",
    content:
      "BSNL fibre digging on GST Chromepet junction blocking entry to Pallavaram market. Small businesses suffering. Week 3 of disruption.",
    related_project_id: "PRJ-CHE-104",
    urgency_tier: "MEDIUM",
    location_mention: "GST Road, Chromepet",
    likes: 94,
    retweets: 31,
    cpgrams_filed: 0,
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    platform: "Twitter",
    user_handle: "@namma_chennai_cares",
    user_avatar_seed: "cares5",
    content:
      "Kudos to NCC Limited for completing Tambaram sewer work well within schedule with proper barricading. Rare sight! Hope other contractors follow.",
    related_project_id: "PRJ-CHE-105",
    urgency_tier: "LOW",
    location_mention: "GST Road, Tambaram",
    likes: 423,
    retweets: 117,
    cpgrams_filed: 0,
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Conflict Alerts ───────────────────────────────────────────────────────────
export const mockConflicts: ConflictAlert[] = [
  {
    id: "CONF-001",
    road_name: "OMR Service Road, Perungudi–Sholinganallur",
    departments: ["Chennai Metro Water", "TNEB Electricity Board"],
    project_ids: ["PRJ-CHE-101", "PRJ-CHE-102"],
    severity: "CRITICAL",
    description:
      "Metro Water pipeline & TNEB HT cable works overlap on 400m stretch. Combined delay risk: 85%. Issue Dig-Once Joint Permit to consolidate.",
  },
  {
    id: "CONF-002",
    road_name: "Poonamallee High Road, Koyambedu",
    departments: ["BSNL Telecom"],
    project_ids: ["PRJ-CHE-108"],
    severity: "HIGH",
    description:
      "BSNL 5G duct work within 200m of planned CMRL Metro Phase 2 corridor. Pre-emptive joint permit can save 3 months of re-excavation.",
  },
];

// ── Dashboard Summary ─────────────────────────────────────────────────────────
export const mockDashboardSummary = {
  total_projects: 8,
  critical_overlaps: 3,
  moderate_risk: 3,
  on_schedule: 2,
  total_grievances: 7,
  high_urgency_grievances: 4,
  avg_contractor_cri: 72.7,
};
