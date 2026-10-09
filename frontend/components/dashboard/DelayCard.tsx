"use client";
import React from "react";
import { TrendingUp, TrendingDown, Calendar, Clock } from "lucide-react";
import { PublicWork } from "@/data/mockData";
import clsx from "clsx";

interface DelayCardProps {
  work: PublicWork;
}

function getRiskColor(score: number): string {
  if (score > 75) return "#EF4444";
  if (score >= 40) return "#F59E0B";
  return "#10B981";
}

function getRiskBg(score: number): string {
  if (score > 75) return "bg-[#1A0F0F] border-[#3D1515]";
  if (score >= 40) return "bg-[#141209] border-[#3D2E0A]";
  return "bg-[#0A1410] border-[#0D2F20]";
}

function getRiskLabel(score: number): string {
  if (score > 75) return "HIGH RISK";
  if (score >= 40) return "MODERATE";
  return "ON TRACK";
}

function daysBetween(d1: string, d2: string): number {
  return Math.ceil(
    (new Date(d2).getTime() - new Date(d1).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function estimatedDelay(score: number, totalDays: number): number {
  return Math.round((score / 100) * totalDays * 0.4);
}

export default function DelayCard({ work }: DelayCardProps) {
  const color = getRiskColor(work.delay_risk_score);
  const totalDays = daysBetween(work.start_date, work.end_date);
  const delayDays = estimatedDelay(work.delay_risk_score, totalDays);
  const projectedEnd = new Date(work.end_date);
  projectedEnd.setDate(projectedEnd.getDate() + delayDays);

  const elapsed = daysBetween(
    work.start_date,
    new Date().toISOString().split("T")[0]
  );
  const progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));

  return (
    <div
      className={clsx(
        "rounded-xl border p-4 space-y-3 transition-all duration-200",
        getRiskBg(work.delay_risk_score)
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-mono text-[#4B5563] mb-0.5">{work.id}</p>
          <h3 className="text-[12px] font-semibold text-white leading-tight truncate">
            {work.road_name}
          </h3>
          <p className="text-[10px] text-[#6B7280] mt-0.5">{work.department}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full border"
            style={{
              color,
              borderColor: color + "40",
              background: color + "15",
            }}
          >
            {getRiskLabel(work.delay_risk_score)}
          </span>
          {delayDays > 0 ? (
            <TrendingUp size={12} style={{ color }} />
          ) : (
            <TrendingDown size={12} color="#10B981" />
          )}
        </div>
      </div>

      {/* Risk Score */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-[#6B7280]">AI Delay Risk Score</span>
          <span className="text-[15px] font-bold" style={{ color }}>
            {work.delay_risk_score}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="relative h-2 bg-[#1E2330] rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${work.delay_risk_score}%`,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
              boxShadow: `0 0 8px ${color}60`,
            }}
          />
        </div>
        <p className="text-[9px] text-[#374151]">
          Work progress: {progress}% elapsed ({elapsed}/{totalDays} days)
        </p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0D0F14]/60 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <Calendar size={10} className="text-[#4B5563]" />
            <span className="text-[9px] text-[#4B5563]">Planned End</span>
          </div>
          <p className="text-[11px] font-medium text-[#D1D5DB]">
            {new Date(work.end_date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })}
          </p>
        </div>
        <div
          className="rounded-lg p-2"
          style={{ background: color + "10", border: `1px solid ${color}25` }}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <Clock size={10} style={{ color }} />
            <span className="text-[9px]" style={{ color: color + "CC" }}>
              Est. Completion
            </span>
          </div>
          <p className="text-[11px] font-medium" style={{ color }}>
            {projectedEnd.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })}
            {delayDays > 0 && (
              <span className="text-[9px] ml-1 opacity-70">+{delayDays}d</span>
            )}
          </p>
        </div>
      </div>

      {/* Cost */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1E2330]">
        <span className="text-[10px] text-[#4B5563]">Project Value</span>
        <span className="text-[11px] font-semibold text-[#9CA3AF]">
          ₹{work.estimated_cost_cr} Cr
        </span>
      </div>
    </div>
  );
}
