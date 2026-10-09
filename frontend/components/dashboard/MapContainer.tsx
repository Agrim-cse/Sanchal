"use client";
import React, { useEffect, useRef, useState } from "react";
import { PublicWork, ConflictAlert } from "@/data/mockData";
import { getGeoJSON, ApiGeoJSONFeature } from "@/lib/api";

interface MapContainerProps {
  works: PublicWork[];
  conflicts: ConflictAlert[];
  onSelectWork: (work: PublicWork) => void;
  loading?: boolean;
}

// Set of project IDs that appear in any conflict
function buildConflictSet(conflicts: ConflictAlert[]): Set<string> {
  const ids = new Set<string>();
  conflicts.forEach((c) => c.project_ids.forEach((id) => ids.add(id)));
  return ids;
}

function getFeatureColor(
  props: ApiGeoJSONFeature["properties"],
  conflictIds: Set<string>
): string {
  if (conflictIds.has(props.id) || props.delay_risk_score > 75) return "#EF4444";
  if (props.delay_risk_score >= 40) return "#F59E0B";
  return "#10B981";
}

function getFeatureGlow(color: string): string {
  const glowMap: Record<string, string> = {
    "#EF4444": "0 0 12px rgba(239,68,68,0.7)",
    "#F59E0B": "0 0 12px rgba(245,158,11,0.6)",
    "#10B981": "0 0 10px rgba(16,185,129,0.5)",
  };
  return glowMap[color] ?? "none";
}

// ---------------------------------------------------------------------------
// MapSkeleton inside the component for graceful degradation
// ---------------------------------------------------------------------------
function InternalSkeleton() {
  return (
    <div className="w-full h-full rounded-xl bg-[#0D0F14] border border-[#1E2330] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[#3B82F6]/40 border-t-[#3B82F6] rounded-full animate-spin mx-auto" />
        <p className="text-[11px] text-[#4B5563]">Fetching spatial data…</p>
      </div>
    </div>
  );
}

function MapError() {
  return (
    <div className="w-full h-full rounded-xl bg-[#0D0F14] border border-[#EF4444]/30 flex items-center justify-center">
      <div className="text-center space-y-2 px-6">
        <p className="text-[13px] font-semibold text-[#EF4444]">Spatial endpoint unavailable</p>
        <p className="text-[10px] text-[#6B7280]">
          Ensure the FastAPI backend is running at{" "}
          <span className="font-mono text-[#4B5563]">localhost:8000</span>
        </p>
      </div>
    </div>
  );
}

export default function MapContainer({
  works,
  conflicts,
  onSelectWork,
  loading = false,
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);

  const [geoFeatures, setGeoFeatures] = useState<ApiGeoJSONFeature[]>([]);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  // Fetch GeoJSON from backend
  useEffect(() => {
    getGeoJSON()
      .then((data) => {
        setGeoFeatures(data.features);
        setActiveCount(data.features.length);
        setGeoLoading(false);
      })
      .catch(() => {
        // Graceful fallback: derive features from the works prop
        if (works.length > 0) {
          const fallback: ApiGeoJSONFeature[] = works
            .filter((w) => w.coordinates && w.coordinates.length > 0)
            .map((w) => ({
              type: "Feature" as const,
              properties: {
                id: w.id,
                road_name: w.road_name,
                department: w.department,
                contractor: w.contractor,
                start_date: w.start_date,
                end_date: w.end_date,
                delay_risk_score: w.delay_risk_score,
                status: w.status,
                description: w.description,
                estimated_cost_cr: w.estimated_cost_cr,
                cpgrams_count: w.cpgrams_count,
              },
              geometry: {
                type: "LineString" as const,
                coordinates: w.coordinates as [number, number][],
              },
            }));
          setGeoFeatures(fallback);
          setActiveCount(fallback.length);
        } else {
          setGeoError(true);
        }
        setGeoLoading(false);
      });
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build Leaflet map once GeoJSON is ready
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (geoLoading || geoError) return;
    if (mapInstanceRef.current) {
      // Map already initialised — remove and rebuild with fresh data
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const conflictIds = buildConflictSet(conflicts);

    (async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths for Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [12.97, 80.22],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      // CartoDB Dark Matter tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "© CartoDB © OpenStreetMap contributors",
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);
      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addAttribution('© <a href="https://carto.com">CartoDB</a>')
        .addTo(map);

      // Plot each GeoJSON feature as a polyline
      geoFeatures.forEach((feature) => {
        const props = feature.properties;
        const color = getFeatureColor(props, conflictIds);
        const glow = getFeatureGlow(color);

        const latlngs = feature.geometry.coordinates.map(
          ([lng, lat]) => [lat, lng] as [number, number]
        );

        if (latlngs.length < 2) return;

        // Shadow glow line
        L.polyline(latlngs, { color, weight: 12, opacity: 0.12 }).addTo(map);

        // Main line
        const line = L.polyline(latlngs, {
          color,
          weight: 4,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        // Start / end dot markers
        const dotIcon = (size: number, opacity = 1) =>
          L.divIcon({
            html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};opacity:${opacity};box-shadow:${glow};border:2px solid rgba(255,255,255,0.25)"></div>`,
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

        L.marker(latlngs[0], { icon: dotIcon(10) }).addTo(map);
        L.marker(latlngs[latlngs.length - 1], { icon: dotIcon(8, 0.7) }).addTo(map);

        // Popup
        const isConflict = conflictIds.has(props.id);
        const popupContent = `
          <div style="font-family:'Inter',sans-serif;min-width:220px;padding:4px 0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;box-shadow:0 0 6px ${color}"></span>
              <strong style="font-size:12px;color:#F9FAFB;line-height:1.3">${props.road_name}</strong>
            </div>
            <div style="display:grid;gap:4px">
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:#6B7280">Department</span>
                <span style="color:#D1D5DB">${props.department}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:#6B7280">Contractor</span>
                <span style="color:#D1D5DB">${props.contractor}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:#6B7280">AI Delay Risk</span>
                <strong style="color:${color}">${props.delay_risk_score}%</strong>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:#6B7280">Status</span>
                <span style="color:${color};font-weight:600">${props.status.replace(/_/g, " ")}</span>
              </div>
              ${isConflict ? `<div style="margin-top:4px;padding:4px 8px;background:#EF444415;border:1px solid #EF444430;border-radius:6px;font-size:10px;color:#EF4444;font-weight:600">⚠ SPATIAL CONFLICT</div>` : ""}
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:#6B7280">ID</span>
                <span style="color:#9CA3AF;font-family:monospace">${props.id}</span>
              </div>
            </div>
          </div>
        `;

        line.bindPopup(popupContent, {
          className: "sanchal-popup",
          maxWidth: 280,
        });

        line.on("click", () => {
          // Build a compatible PublicWork from GeoJSON properties
          const work: PublicWork = {
            ...props,
            coordinates: feature.geometry.coordinates,
          };
          onSelectWork(work);
        });

        line.on("mouseover", function () {
          line.setStyle({ weight: 6, opacity: 1 });
        });
        line.on("mouseout", function () {
          line.setStyle({ weight: 4, opacity: 0.95 });
        });
      });
    })();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [geoFeatures, geoLoading, geoError, conflicts, onSelectWork]);

  if (loading || geoLoading) return <InternalSkeleton />;
  if (geoError) return <MapError />;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#1E2330]">
      {/* Map element */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#0D0F14]/90 backdrop-blur border border-[#1E2330] rounded-lg px-3 py-2.5 space-y-1.5">
        <p className="text-[9px] uppercase tracking-widest text-[#4B5563] font-semibold mb-2">
          Risk Level
        </p>
        {[
          { color: "#EF4444", label: "Critical Overlap", glow: "0 0 8px rgba(239,68,68,0.6)" },
          { color: "#F59E0B", label: "Moderate Risk", glow: "0 0 8px rgba(245,158,11,0.5)" },
          { color: "#10B981", label: "On Schedule", glow: "0 0 8px rgba(16,185,129,0.5)" },
        ].map(({ color, label, glow }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: color, boxShadow: glow }}
            />
            <span className="text-[10px] text-[#9CA3AF]">{label}</span>
          </div>
        ))}
      </div>

      {/* Works count badge — shows live GeoJSON count */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#0D0F14]/90 backdrop-blur border border-[#1E2330] rounded-md px-2.5 py-1.5">
        <p className="text-[10px] text-[#6B7280]">
          <span className="text-white font-semibold">{activeCount}</span>{" "}
          active excavations
          {conflicts.length > 0 && (
            <span className="ml-2 text-[#EF4444] font-semibold">
              · {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
