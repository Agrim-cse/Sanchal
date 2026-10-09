"use client";
import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import DelayCard from "@/components/dashboard/DelayCard";
import ConflictModal from "@/components/dashboard/ConflictModal";
import GrievanceFeed from "@/components/dashboard/GrievanceFeed";
import ContractorTable from "@/components/dashboard/ContractorTable";
import CpgramsModal from "@/components/dashboard/CpgramsModal";
import {
  mockPublicWorks,
  mockContractors,
  mockGrievances,
  mockConflicts,
  mockDashboardSummary,
  PublicWork,
  SocialGrievance,
} from "@/data/mockData";
import {
  AlertTriangle,
  Layers,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
} from "lucide-react";

// Leaflet must be client-side only
const MapContainer = dynamic(
  () => import("@/components/dashboard/MapContainer"),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="w-full h-full rounded-xl bg-[#0D0F14] border border-[#1E2330] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[#3B82F6]/40 border-t-[#3B82F6] rounded-full animate-spin mx-auto" />
        <p className="text-[11px] text-[#4B5563]">Loading spatial map…</p>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-[#0D0F14] border border-[#1E2330] rounded-xl p-4 flex items-center gap-3 hover:border-[#2D3748] transition-colors">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: color + "18" }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[#4B5563] font-medium leading-none mb-1">
          {label}
        </p>
        <p className="text-[20px] font-bold text-white leading-none">{value}</p>
        {sub && <p className="text-[9.5px] text-[#374151] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest">
        {title}
      </h2>
      {count !== undefined && (
        <span className="text-[10px] text-[#374151] bg-[#13161D] border border-[#1E2330] px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedWork, setSelectedWork] = useState<PublicWork | null>(null);
  const [cpgramsGrievance, setCpgramsGrievance] =
    useState<SocialGrievance | null>(null);

  const handleSelectWork = useCallback((work: PublicWork) => {
    setSelectedWork(work);
  }, []);

  const handleFileCpgrams = useCallback((g: SocialGrievance) => {
    setCpgramsGrievance(g);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080A0F]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header activeTab={activeTab} />

        {/* Dashboard body */}
        <main className="flex-1 overflow-hidden p-4 gap-4 grid grid-cols-12 grid-rows-[auto_1fr_1fr] min-h-0">
          {/* ── Row 1: Stat cards (full width) ── */}
          <div className="col-span-12 grid grid-cols-6 gap-3">
            <StatCard
              icon={Layers}
              label="Active Excavations"
              value={mockDashboardSummary.total_projects}
              sub="Greater Chennai"
              color="#3B82F6"
            />
            <StatCard
              icon={AlertTriangle}
              label="Critical Overlaps"
              value={mockDashboardSummary.critical_overlaps}
              sub="Requires joint permit"
              color="#EF4444"
            />
            <StatCard
              icon={TrendingUp}
              label="Moderate Risk"
              value={mockDashboardSummary.moderate_risk}
              sub="40–75% delay risk"
              color="#F59E0B"
            />
            <StatCard
              icon={Layers}
              label="On Schedule"
              value={mockDashboardSummary.on_schedule}
              sub="< 40% delay risk"
              color="#10B981"
            />
            <StatCard
              icon={MessageSquare}
              label="Live Grievances"
              value={mockDashboardSummary.total_grievances}
              sub={`${mockDashboardSummary.high_urgency_grievances} HIGH urgency`}
              color="#8B5CF6"
            />
            <StatCard
              icon={Award}
              label="Avg Contractor CRI"
              value={`${mockDashboardSummary.avg_contractor_cri}`}
              sub="Out of 100"
              color="#06B6D4"
            />
          </div>

          {/* ── Row 2: Map (7 cols) + Right panel (5 cols) ── */}
          <div className="col-span-7 row-span-2 min-h-0">
            <MapContainer works={mockPublicWorks} onSelectWork={handleSelectWork} />
          </div>

          {/* Right panel top: Conflict Alerts */}
          <div className="col-span-5 min-h-0 overflow-y-auto bg-[#0D0F14] border border-[#1E2330] rounded-xl p-4">
            <SectionHeader
              title="Spatial Conflict Alerts"
              count={mockConflicts.length}
            />
            <ConflictModal conflicts={mockConflicts} />

            {/* Selected work delay card */}
            {selectedWork && (
              <div className="mt-4">
                <SectionHeader title="Selected Project — Delay Analysis" />
                <DelayCard work={selectedWork} />
              </div>
            )}

            {!selectedWork && (
              <div className="mt-4">
                <SectionHeader title="Highest Risk Project" />
                <DelayCard
                  work={
                    [...mockPublicWorks].sort(
                      (a, b) => b.delay_risk_score - a.delay_risk_score
                    )[0]
                  }
                />
              </div>
            )}
          </div>

          {/* ── Row 3: Grievances (4 cols) + Contractors (8 cols) ── */}
          <div className="col-span-5 min-h-0 overflow-y-auto bg-[#0D0F14] border border-[#1E2330] rounded-xl p-4 flex flex-col">
            <SectionHeader
              title="Live Grievance Feed"
              count={mockGrievances.length}
            />
            <div className="flex-1 min-h-0">
              <GrievanceFeed
                grievances={mockGrievances}
                onFileCpgrams={handleFileCpgrams}
              />
            </div>
          </div>

          {/* Contractors — spans the gap below map */}
          {/* We need a bottom row across full width for contractors */}
        </main>

        {/* Contractor table — fixed bottom bar */}
        <div className="flex-shrink-0 border-t border-[#1E2330] bg-[#0D0F14] px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
              <Users size={12} />
              Contractor Scorecard
            </h2>
            <span className="text-[10px] text-[#374151]">
              {mockContractors.length} contractors · Sorted by CRI
            </span>
          </div>
          <ContractorTable contractors={mockContractors} />
        </div>
      </div>

      {/* CPGRAMS Modal */}
      <CpgramsModal
        grievance={cpgramsGrievance}
        onClose={() => setCpgramsGrievance(null)}
      />
    </div>
  );
}
