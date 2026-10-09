"use client";
import React, { useState } from "react";
import { Heart, Repeat2, FileText } from "lucide-react";

function TwitterIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DA1F2">
      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
    </svg>
  );
}

function FacebookIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
import { SocialGrievance, UrgencyTier } from "@/data/mockData";
import clsx from "clsx";

interface GrievanceFeedProps {
  grievances: SocialGrievance[];
  onFileCpgrams?: (grievance: SocialGrievance) => void;
}

const URGENCY_CONFIG: Record<
  UrgencyTier,
  { label: string; color: string; bg: string; border: string }
> = {
  HIGH: {
    label: "HIGH",
    color: "#EF4444",
    bg: "bg-[#EF4444]/10",
    border: "border-[#EF4444]/30",
  },
  MEDIUM: {
    label: "MED",
    color: "#F59E0B",
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/30",
  },
  LOW: {
    label: "LOW",
    color: "#10B981",
    bg: "bg-[#10B981]/10",
    border: "border-[#10B981]/30",
  },
};

function Avatar({ seed }: { seed: string }) {
  // Generate a deterministic hue from seed string
  const hue = seed
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const initials = seed.replace(/\d/g, "").slice(0, 2).toUpperCase() || "?";
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
      style={{
        background: `linear-gradient(135deg, hsl(${hue},60%,35%), hsl(${hue + 40},60%,25%))`,
      }}
    >
      {initials}
    </div>
  );
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function GrievanceFeed({
  grievances,
  onFileCpgrams,
}: GrievanceFeedProps) {
  const [filter, setFilter] = useState<UrgencyTier | "ALL">("ALL");

  const filtered =
    filter === "ALL"
      ? grievances
      : grievances.filter((g) => g.urgency_tier === filter);

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-3">
        {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((tier) => {
          const cfg = tier !== "ALL" ? URGENCY_CONFIG[tier] : null;
          return (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={clsx(
                "text-[10px] font-semibold px-2.5 py-1 rounded-md border transition-all",
                filter === tier
                  ? tier === "ALL"
                    ? "bg-[#1E2B4A] border-[#3B82F6]/50 text-[#60A5FA]"
                    : `text-white border-transparent`
                  : "bg-transparent border-[#1E2330] text-[#4B5563] hover:text-[#6B7280]"
              )}
              style={
                filter === tier && cfg
                  ? {
                      background: cfg.color + "20",
                      borderColor: cfg.color + "50",
                      color: cfg.color,
                    }
                  : {}
              }
            >
              {tier}
            </button>
          );
        })}
        <span className="ml-auto text-[10px] text-[#374151]">
          {filtered.length} posts
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1E2330]">
        {filtered.map((g) => {
          const urgency = URGENCY_CONFIG[g.urgency_tier];
          return (
            <div
              key={g.id}
              className="bg-[#13161D] border border-[#1E2330] rounded-xl p-3 hover:border-[#2D3748] transition-colors group"
            >
              <div className="flex items-start gap-2.5">
                <Avatar seed={g.user_avatar_seed} />
                <div className="flex-1 min-w-0">
                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-[#D1D5DB]">
                      {g.user_handle}
                    </span>
                    <div className="flex items-center gap-1">
                      {g.platform === "Twitter" ? (
                        <TwitterIcon size={9} />
                      ) : (
                        <FacebookIcon size={9} />
                      )}
                    </div>
                    <span
                      className={clsx(
                        "text-[8.5px] font-bold tracking-wider px-1.5 py-0.5 rounded border",
                        urgency.bg,
                        urgency.border
                      )}
                      style={{ color: urgency.color }}
                    >
                      {urgency.label}
                    </span>
                    <span className="text-[9px] text-[#374151] ml-auto">
                      {timeAgo(g.timestamp)}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-[11px] text-[#9CA3AF] mt-1.5 leading-relaxed line-clamp-3">
                    {g.content}
                  </p>

                  {/* Location tag */}
                  <p className="text-[9px] text-[#374151] mt-1">
                    📍 {g.location_mention}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-[#374151]">
                      <Heart size={10} />
                      <span>{g.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#374151]">
                      <Repeat2 size={10} />
                      <span>{g.retweets}</span>
                    </div>

                    {g.cpgrams_filed ? (
                      <div className="ml-auto flex items-center gap-1 text-[9.5px] text-[#10B981]">
                        <FileText size={9} />
                        <span>CPGRAMS Filed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onFileCpgrams?.(g)}
                        className="ml-auto text-[9.5px] text-[#4B5563] hover:text-[#60A5FA] transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                      >
                        <FileText size={9} />
                        File CPGRAMS
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
