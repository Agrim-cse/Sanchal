"use client";
import React, { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, Calendar, Clock, Cpu } from "lucide-react";
import { PublicWork } from "@/data/mockData";
import { predictDelay, DelayPredictResponse } from "@/lib/api";
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

// Shimmer skeleton while the ML call is in-flight
function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-[#141209] border-[#3D2E0A] p-4 space-y-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="h-2 bg-[#1E2330] rounded w-24" />
          <div className="h-3 bg-[#1E2330] rounded w-40" />
          <div className="h-2 bg-[#1E2330] rounded w-20" />
        </div>
        <div className="h-5 bg-[#1E2330] rounded w-16" />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <div className="h-2 bg-[#1E2330] rounded w-28" />
          <div className="h-4 bg-[#1E2330] rounded w-10" />
        </div>
        <div className="h-2 bg-[#1E2330] rounded-full w-full" />
        <div className="h-2 bg-[#1E2330] rounded w-36" />
      </div>
      <p className="text-[9px] text-[#374151] flex items-center gap-1">
        <Cpu size={9} className="animate-spin" /> Running LightGBM inference…
      </p>
    </div>
  );
}

export default function DelayCard({ work }: DelayCardProps) {
  const [prediction, setPrediction] = useState<DelayPredictResponse | null>(null);
  const [predLoading, setPredLoading] = useState(true);
  // null = not attempted yet, false = used mock/fallback, true = live
  const [isLive, setIsLive] = useState<boolean | null>(null);

  // Animated display score counts up from 0 to target
  const [displayScore, setDisplayScore] = useState(0);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effective values — always fall back to static data
  const effectiveScore = prediction?.delay_risk_score ?? work.delay_risk_score;
  const estimatedDelayDays = prediction?.estimated_delay_days ?? 0;
  const modelUsed = prediction?.model_used ?? null;
  const riskLabel = prediction?.risk_label ?? getRiskLabel(effectiveScore);

  const color = getRiskColor(effectiveScore);
  const totalDays = daysBetween(work.start_date, work.end_date);
  const delayDays =
    estimatedDelayDays > 0
      ? estimatedDelayDays
      : Math.round((effectiveScore / 100) * totalDays * 0.4);

  const projectedEnd = new Date(work.end_date);
  projectedEnd.setDate(projectedEnd.getDate() + delayDays);

  const today = new Date().toISOString().split("T")[0];
  const elapsed = daysBetween(work.start_date, today);
  const progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));

  // Animate bar when target score is ready
  useEffect(() => {
    if (predLoading) return;
    const target = effectiveScore;
    setDisplayScore(0);
    let current = 0;
    const step = Math.max(1, Math.round(target / 40));

    const tick = () => {
      current = Math.min(current + step, target);
      setDisplayScore(current);
      if (current < target) {
        animRef.current = setTimeout(tick, 18);
      }
    };
    animRef.current = setTimeout(tick, 80);
    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [effectiveScore, predLoading]);

  // Call the LightGBM endpoint; silently fall back to mock score on failure
  useEffect(() => {
    setPredLoading(true);
    setDisplayScore(0);
    setPrediction(null);

    predictDelay({
      project_id: work.id,
      department: work.department,
      start_date: work.start_date,
      end_date: work.end_date,
      estimated_cost_cr: work.estimated_cost_cr,
      project_scope_size: 5.0,
      avg_delay_days: 10.0,
      cpgrams_count: work.cpgrams_count,
      contractor_id: 1,
      status: work.status,
    })
      .then((data) => {
        setPrediction(data);
        setIsLive(true);
      })
      .catch(() => {
        // Silently use the static delay_risk_score already in `work`
        setIsLive(false);
      })
      .finally(() => setPredLoading(false));
  }, [work.id]); // Re-run only when the selected project changes

  if (predLoading) return <CardSkeleton />;

  return (
    <div
      className={clsx(
        "rounded-xl border p-4 space-y-3 transition-all duration-200",
        getRiskBg(effectiveScore)
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
            {riskLabel}
          </span>
          {delayDays > 0 ? (
            <TrendingUp size={12} style={{ color }} />
          ) : (
            <TrendingDown size={12} color="#10B981" />
          )}
        </div>
      </div>

      {/* Animated risk score bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-[#6B7280] flex items-center gap-1">
            <Cpu size={9} />
            AI Delay Risk Score
          </span>
          <span className="text-[15px] font-bold tabular-nums" style={{ color }}>
            {displayScore}%
          </span>
        </div>
        <div className="relative h-2 bg-[#1E2330] rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${displayScore}%`,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
              boxShadow: `0 0 8px ${color}60`,
              transition: "width 75ms linear",
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

      {/* Cost + model attribution */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1E2330]">
        <span className="text-[10px] text-[#4B5563]">Project Value</span>
        <span className="text-[11px] font-semibold text-[#9CA3AF]">
          ₹{work.estimated_cost_cr} Cr
        </span>
      </div>

      {/* Model source tag — only shown, never an error */}
      {isLive !== null && (
        <p className="text-[9px] text-[#374151] flex items-center gap-1">
          <Cpu size={8} />
          {isLive && modelUsed ? `via ${modelUsed}` : "Score from project data"}
        </p>
      )}
    </div>
  );
}
