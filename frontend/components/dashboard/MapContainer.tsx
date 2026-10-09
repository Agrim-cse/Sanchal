"use client";
import React, { useEffect, useRef } from "react";
import { PublicWork } from "@/data/mockData";

interface MapContainerProps {
  works: PublicWork[];
  onSelectWork: (work: PublicWork) => void;
}

function getStatusColor(work: PublicWork): string {
  if (work.status === "CRITICAL_OVERLAP" || work.delay_risk_score > 75) {
    return "#EF4444";
  }
  if (work.status === "MODERATE_RISK" || work.delay_risk_score >= 40) {
    return "#F59E0B";
  }
  return "#10B981";
}

function getStatusGlow(work: PublicWork): string {
  if (work.status === "CRITICAL_OVERLAP" || work.delay_risk_score > 75) {
    return "0 0 12px rgba(239,68,68,0.7)";
  }
  if (work.status === "MODERATE_RISK" || work.delay_risk_score >= 40) {
    return "0 0 12px rgba(245,158,11,0.6)";
  }
  return "0 0 10px rgba(16,185,129,0.5)";
}

export default function MapContainer({ works, onSelectWork }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues
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

      // Custom zoom control (top-right)
      L.control.zoom({ position: "topright" }).addTo(map);

      // Attribution (bottom-right, minimal)
      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addAttribution('© <a href="https://carto.com">CartoDB</a>')
        .addTo(map);

      // Plot works as polylines
      works.forEach((work) => {
        const color = getStatusColor(work);
        const latlngs = work.coordinates.map(
          ([lng, lat]) => [lat, lng] as [number, number]
        );

        // Shadow line for glow effect
        L.polyline(latlngs, {
          color,
          weight: 12,
          opacity: 0.12,
        }).addTo(map);

        // Main line
        const line = L.polyline(latlngs, {
          color,
          weight: 4,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        // Start/end dot markers
        const dotIcon = (size: number, opacity = 1) =>
          L.divIcon({
            html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};opacity:${opacity};box-shadow:${getStatusGlow(work)};border:2px solid rgba(255,255,255,0.25)"></div>`,
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

        L.marker(latlngs[0], { icon: dotIcon(10) }).addTo(map);
        L.marker(latlngs[latlngs.length - 1], {
          icon: dotIcon(8, 0.7),
        }).addTo(map);

        // Popup
        const popupContent = `
          <div style="font-family:'Inter',sans-serif;min-width:220px;padding:4px 0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;box-shadow:0 0 6px ${color}"></span>
              <strong style="font-size:12px;color:#F9FAFB;line-height:1.3">${work.road_name}</strong>
            </div>
            <div style="display:grid;gap:4px">
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:#6B7280">Department</span>
                <span style="color:#D1D5DB">${work.department}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:#6B7280">Contractor</span>
                <span style="color:#D1D5DB">${work.contractor}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:#6B7280">Delay Risk</span>
                <strong style="color:${color}">${work.delay_risk_score}%</strong>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:#6B7280">Status</span>
                <span style="color:${color};font-weight:600">${work.status.replace(/_/g, " ")}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:#6B7280">ID</span>
                <span style="color:#9CA3AF;font-family:monospace">${work.id}</span>
              </div>
            </div>
          </div>
        `;

        line.bindPopup(popupContent, {
          className: "sanchal-popup",
          maxWidth: 280,
        });

        line.on("click", () => {
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
  }, [works, onSelectWork]);

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

      {/* Works count badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#0D0F14]/90 backdrop-blur border border-[#1E2330] rounded-md px-2.5 py-1.5">
        <p className="text-[10px] text-[#6B7280]">
          <span className="text-white font-semibold">{works.length}</span> active excavations
        </p>
      </div>
    </div>
  );
}
