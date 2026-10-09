"use client";
import React from "react";
import { Bell, Search, RefreshCw, MapPin } from "lucide-react";
import { mockDashboardSummary } from "@/data/mockData";

interface HeaderProps {
  activeTab: string;
}

const TAB_LABELS: Record<string, string> = {
  dashboard: "Mission Control",
  map: "Spatial Conflict Map",
  conflicts: "Conflict Alerts",
  grievances: "Live Grievance Feed",
  contractors: "Contractor Scorecard",
  cpgrams: "CPGRAMS Portal",
};

export default function Header({ activeTab }: HeaderProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="flex items-center justify-between h-14 px-5 bg-[#0D0F14] border-b border-[#1E2330] flex-shrink-0">
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-[14px] font-semibold text-white">
            {TAB_LABELS[activeTab] || "Dashboard"}
          </h1>
          <p className="text-[10px] text-[#4B5563] flex items-center gap-1">
            <MapPin size={9} />
            Greater Chennai Corporation · Tamil Nadu
          </p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xs mx-6">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#374151]"
          />
          <input
            type="text"
            placeholder="Search projects, roads, contractors..."
            className="w-full bg-[#13161D] border border-[#1E2330] rounded-md pl-8 pr-3 py-1.5 text-[12px] text-[#9CA3AF] placeholder-[#374151] focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>
      </div>

      {/* Right: Stats + Actions */}
      <div className="flex items-center gap-4">
        {/* Live stats pills */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-[#1A1212] border border-[#3D1515] px-2.5 py-1 rounded-full text-[10.5px] text-[#EF4444] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
            {mockDashboardSummary.critical_overlaps} Critical
          </span>
          <span className="flex items-center gap-1.5 bg-[#141A1A] border border-[#1E3A2F] px-2.5 py-1 rounded-full text-[10.5px] text-[#10B981] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            {mockDashboardSummary.on_schedule} On Track
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#1E2330]" />

        {/* Date/Time */}
        <div className="text-right">
          <p className="text-[11px] font-medium text-[#D1D5DB]">{timeStr}</p>
          <p className="text-[9px] text-[#4B5563]">{dateStr}</p>
        </div>

        {/* Refresh */}
        <button className="w-8 h-8 rounded-md bg-[#13161D] border border-[#1E2330] flex items-center justify-center text-[#4B5563] hover:text-[#9CA3AF] hover:border-[#374151] transition-colors">
          <RefreshCw size={13} />
        </button>

        {/* Bell */}
        <button className="relative w-8 h-8 rounded-md bg-[#13161D] border border-[#1E2330] flex items-center justify-center text-[#4B5563] hover:text-[#9CA3AF] hover:border-[#374151] transition-colors">
          <Bell size={13} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
        </button>
      </div>
    </header>
  );
}
