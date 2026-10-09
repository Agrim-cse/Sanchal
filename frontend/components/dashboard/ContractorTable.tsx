"use client";
import React from "react";
import { Award, TrendingUp, TrendingDown, Lock, CheckCircle } from "lucide-react";
import { Contractor } from "@/data/mockData";
import clsx from "clsx";

interface ContractorTableProps {
  contractors: Contractor[];
}

function CRIBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10B981" : score >= 65 ? "#F59E0B" : "#EF4444";
  const bg =
    score >= 80 ? "#0A1410" : score >= 65 ? "#141209" : "#1A0F0F";
  const border =
    score >= 80 ? "#0D2F20" : score >= 65 ? "#3D2E0A" : "#3D1515";

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      <Award size={11} style={{ color }} />
      {score}
      <span className="text-[8px] font-normal opacity-60">/100</span>
    </div>
  );
}

function EscrowBadge({ status }: { status: string }) {
  const isLocked = status.includes("Locked");
  return (
    <div
      className={clsx(
        "flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-md",
        isLocked
          ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/25"
          : "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25"
      )}
    >
      {isLocked ? <Lock size={9} /> : <CheckCircle size={9} />}
      {isLocked ? "Locked" : "Released"}
    </div>
  );
}

export default function ContractorTable({ contractors }: ContractorTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#1E2330]">
            {[
              "Contractor",
              "Dept",
              "Tender ID",
              "CRI Score",
              "Avg Delay",
              "Escrow",
              "₹ (Cr)",
            ].map((h) => (
              <th
                key={h}
                className="pb-2 pr-4 text-[9.5px] font-semibold text-[#4B5563] uppercase tracking-widest whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contractors.map((c, idx) => (
            <tr
              key={c.id}
              className={clsx(
                "border-b border-[#1E2330]/60 transition-colors hover:bg-[#13161D]",
                idx % 2 === 0 ? "" : "bg-[#0D0F14]/30"
              )}
            >
              {/* Name */}
              <td className="py-2.5 pr-4">
                <div>
                  <p className="text-[12px] font-semibold text-[#D1D5DB] whitespace-nowrap">
                    {c.name}
                  </p>
                  <p className="text-[9px] text-[#374151] font-mono">
                    {c.active_project}
                  </p>
                </div>
              </td>

              {/* Department */}
              <td className="py-2.5 pr-4">
                <span className="text-[10px] text-[#6B7280] whitespace-nowrap">
                  {c.department.replace("Chennai ", "").replace(" Board", "")}
                </span>
              </td>

              {/* Tender ID */}
              <td className="py-2.5 pr-4">
                <span className="text-[10px] font-mono text-[#4B5563]">
                  {c.active_tender_id}
                </span>
              </td>

              {/* CRI Score */}
              <td className="py-2.5 pr-4">
                <CRIBadge score={c.cri_score} />
              </td>

              {/* Avg Delay */}
              <td className="py-2.5 pr-4">
                <div className="flex items-center gap-1">
                  {c.avg_delay_days <= 7 ? (
                    <TrendingDown size={11} color="#10B981" />
                  ) : (
                    <TrendingUp size={11} color={c.avg_delay_days > 15 ? "#EF4444" : "#F59E0B"} />
                  )}
                  <span
                    className="text-[11px] font-medium"
                    style={{
                      color:
                        c.avg_delay_days <= 7
                          ? "#10B981"
                          : c.avg_delay_days > 15
                          ? "#EF4444"
                          : "#F59E0B",
                    }}
                  >
                    {c.avg_delay_days}d
                  </span>
                </div>
              </td>

              {/* Escrow Status */}
              <td className="py-2.5 pr-4">
                <EscrowBadge status={c.escrow_status} />
              </td>

              {/* Amount */}
              <td className="py-2.5">
                <span className="text-[11px] font-semibold text-[#9CA3AF]">
                  ₹{c.escrow_amount_cr}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
