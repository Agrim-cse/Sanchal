// ─────────────────────────────────────────────────────────────────────────────
// Sanchal — API Utility (Phase 3)
// All calls target the local FastAPI backend at http://localhost:8000
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE = "http://localhost:8000/api";

// ---------------------------------------------------------------------------
// Types (mirror backend Pydantic models / ORM dicts)
// ---------------------------------------------------------------------------

export interface ApiPublicWork {
  id: string;
  road_name: string;
  department: string;
  contractor: string;
  start_date: string;
  end_date: string;
  delay_risk_score: number;
  status: "CRITICAL_OVERLAP" | "MODERATE_RISK" | "ON_SCHEDULE";
  description: string;
  estimated_cost_cr: number;
  cpgrams_count: number;
}

export interface ApiContractor {
  id: number;
  name: string;
  cri_score: number;
  active_tender_id: string;
  active_project: string;
  department: string;
  escrow_status: string;
  escrow_amount_cr: number;
  projects_completed: number;
  avg_delay_days: number;
}

export interface ApiGrievance {
  id: number;
  platform: string;
  user_handle: string;
  user_avatar_seed: string;
  content: string;
  related_project_id: string | null;
  urgency_tier: "HIGH" | "MEDIUM" | "LOW";
  location_mention: string | null;
  likes: number;
  retweets: number;
  cpgrams_filed: number;
  timestamp: string | null;
}

export interface ApiConflict {
  id: string;
  road_name: string;
  departments: string[];
  project_ids: string[];
  severity: string;
  overlap_area_sqm: number;
  description: string;
}

export interface ApiGeoJSON {
  type: "FeatureCollection";
  features: ApiGeoJSONFeature[];
}

export interface ApiGeoJSONFeature {
  type: "Feature";
  properties: ApiPublicWork;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

export interface DelayPredictRequest {
  project_id?: string;
  department: string;
  start_date: string;
  end_date: string;
  estimated_cost_cr: number;
  project_scope_size: number;
  avg_delay_days: number;
  cpgrams_count: number;
  contractor_id: number;
  status: string;
}

export interface DelayPredictResponse {
  project_id: string | null;
  delay_risk_score: number;
  risk_label: string;
  estimated_delay_days: number;
  model_used: string;
}

export interface DashboardSummary {
  total_projects: number;
  critical_overlaps: number;
  moderate_risk: number;
  on_schedule: number;
  total_grievances: number;
  high_urgency_grievances: number;
  avg_contractor_cri: number;
}

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  timeoutMs = 8000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`[${res.status}] ${path}: ${text}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/** List all active public works projects (optionally filter by status / dept) */
export async function getProjects(
  params?: { status?: string; department?: string }
): Promise<ApiPublicWork[]> {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params ?? {}).filter(([, v]) => v !== undefined)
    ) as Record<string, string>
  ).toString();
  return apiFetch<ApiPublicWork[]>(`/projects${qs ? `?${qs}` : ""}`);
}

/** Fetch the full GeoJSON FeatureCollection for map rendering */
export async function getGeoJSON(): Promise<ApiGeoJSON> {
  const res = await fetch(
    "http://localhost:8000/api/geojson/roadworks",
    { headers: { "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);
  return res.json() as Promise<ApiGeoJSON>;
}

/** Run the Shapely spatial conflict engine */
export async function getConflicts(): Promise<ApiConflict[]> {
  return apiFetch<ApiConflict[]>("/conflicts");
}

/** Send project data to the LightGBM delay prediction endpoint */
export async function predictDelay(
  projectData: DelayPredictRequest
): Promise<DelayPredictResponse> {
  return apiFetch<DelayPredictResponse>("/predict-delay", {
    method: "POST",
    body: JSON.stringify(projectData),
  });
}

/** List all contractors, sorted by CRI descending */
export async function getContractors(): Promise<ApiContractor[]> {
  return apiFetch<ApiContractor[]>("/contractors");
}

/** List social grievances (newest first), optionally filtered by urgency tier */
export async function getGrievances(
  urgencyTier?: "HIGH" | "MEDIUM" | "LOW"
): Promise<ApiGrievance[]> {
  const qs = urgencyTier ? `?urgency_tier=${urgencyTier}` : "";
  return apiFetch<ApiGrievance[]>(`/grievances${qs}`);
}

/** Dashboard KPI summary */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}
