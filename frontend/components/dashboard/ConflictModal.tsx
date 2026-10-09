"use client";
import React, { useState } from "react";
import {
  AlertTriangle,
  X,
  GitMerge,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { ConflictAlert, mockPublicWorks } from "@/data/mockData";
import clsx from "clsx";

interface ConflictModalProps {
  conflicts: ConflictAlert[];
}

export default function ConflictModal({ conflicts }: ConflictModalProps) {
  const [selectedConflict, setSelectedConflict] = useState<ConflictAlert | null>(null);
  const [permitIssued, setPermitIssued] = useState<Set<string>>(new Set());

  const handleIssuePerm = (id: string) => {
    setPermitIssued((prev) => new Set([...prev, id]));
    setSelectedConflict(null);
  };

  return (
    <>
      {/* Conflict banner list */}
      <div className="space-y-2">
        {conflicts.map((conflict) => {
          const issued = permitIssued.has(conflict.id);
          return (
            <button
              key={conflict.id}
              onClick={() => !issued && setSelectedConflict(conflict)}
              className={clsx(
                "w-full text-left rounded-xl border p-3.5 transition-all duration-200 group",
                issued
                  ? "bg-[#0A1410] border-[#0D2F20] cursor-default"
                  : conflict.severity === "CRITICAL"
                  ? "bg-[#1A0F0F] border-[#3D1515] hover:border-[#EF4444]/60 hover:bg-[#200F0F]"
                  : "bg-[#141209] border-[#3D2E0A] hover:border-[#F59E0B]/60 hover:bg-[#1A160A]"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={clsx(
                    "flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center mt-0.5",
                    issued
                      ? "bg-[#10B981]/15"
                      : conflict.severity === "CRITICAL"
                      ? "bg-[#EF4444]/15"
                      : "bg-[#F59E0B]/15"
                  )}
                >
                  {issued ? (
                    <CheckCircle2 size={14} color="#10B981" />
                  ) : (
                    <AlertTriangle
                      size={14}
                      color={
                        conflict.severity === "CRITICAL" ? "#EF4444" : "#F59E0B"
                      }
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={clsx(
                        "text-[9px] font-bold tracking-widest uppercase",
                        issued
                          ? "text-[#10B981]"
                          : conflict.severity === "CRITICAL"
                          ? "text-[#EF4444]"
                          : "text-[#F59E0B]"
                      )}
                    >
                      {issued ? "Permit Issued" : conflict.severity} ·{" "}
                      {conflict.id}
                    </span>
                    {!issued && (
                      <ChevronRight
                        size={12}
                        className="text-[#374151] group-hover:text-[#6B7280] transition-colors flex-shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-[12px] font-semibold text-white mt-0.5 leading-tight">
                    {conflict.road_name}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {conflict.departments.map((dept) => (
                      <span
                        key={dept}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-[#1E2330] text-[#9CA3AF] font-medium"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#6B7280] mt-1.5 leading-relaxed">
                    {conflict.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal overlay */}
      {selectedConflict && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedConflict(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#0D0F14] border border-[#1E2330] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2330]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 flex items-center justify-center">
                  <GitMerge size={16} color="#EF4444" />
                </div>
                <div>
                  <h2 className="text-[13px] font-semibold text-white">
                    Spatial Conflict Resolution
                  </h2>
                  <p className="text-[10px] text-[#4B5563]">
                    Dig-Once Joint Permit Generator
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConflict(null)}
                className="w-7 h-7 rounded-md bg-[#13161D] flex items-center justify-center text-[#4B5563] hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            </div>

            {/* Conflict details */}
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] text-[#EF4444] font-bold tracking-widest uppercase mb-1">
                  {selectedConflict.severity} Overlap Detected
                </p>
                <h3 className="text-[15px] font-semibold text-white leading-tight">
                  {selectedConflict.road_name}
                </h3>
              </div>

              {/* Overlapping projects */}
              <div className="space-y-2">
                {selectedConflict.project_ids.map((pid) => {
                  const work = mockPublicWorks.find((w) => w.id === pid);
                  if (!work) return null;
                  return (
                    <div
                      key={pid}
                      className="flex items-center gap-3 bg-[#13161D] rounded-lg p-3"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background:
                            work.delay_risk_score > 75 ? "#EF4444" : "#F59E0B",
                          boxShadow: `0 0 6px ${work.delay_risk_score > 75 ? "#EF4444" : "#F59E0B"}`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-[#D1D5DB]">
                          {work.department}
                        </p>
                        <p className="text-[10px] text-[#6B7280] truncate">
                          {work.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-[12px] font-bold"
                          style={{ color: "#EF4444" }}
                        >
                          {work.delay_risk_score}%
                        </p>
                        <p className="text-[9px] text-[#4B5563]">risk</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommendation */}
              <div className="bg-[#0A1B2E] border border-[#1E3A5F] rounded-lg p-3">
                <p className="text-[10px] text-[#60A5FA] font-semibold mb-1">
                  AI Recommendation
                </p>
                <p className="text-[11px] text-[#93C5FD] leading-relaxed">
                  {selectedConflict.description}
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#1E2330] bg-[#090B0F]">
              <button
                onClick={() => setSelectedConflict(null)}
                className="text-[12px] text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleIssuePerm(selectedConflict.id)}
                className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/30"
              >
                <GitMerge size={14} />
                Issue Joint Permit (Dig-Once)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
