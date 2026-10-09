"use client";
import React, { useState } from "react";
import {
  LayoutGrid,
  Map,
  AlertTriangle,
  Users,
  MessageSquare,
  FileText,
  Settings,
  ChevronRight,
  Activity,
  Zap,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
  { id: "map", icon: Map, label: "Spatial Map" },
  { id: "conflicts", icon: AlertTriangle, label: "Conflict Alerts" },
  { id: "grievances", icon: MessageSquare, label: "Grievance Feed" },
  { id: "contractors", icon: Users, label: "Contractors" },
  { id: "cpgrams", icon: FileText, label: "CPGRAMS" },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "flex flex-col h-full bg-[#0D0F14] border-r border-[#1E2330] transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1E2330]">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#6366F1] flex items-center justify-center shadow-lg shadow-blue-900/30">
          <Zap size={14} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-white tracking-wide">
              SANCHAL
            </span>
            <span className="text-[9px] text-[#4B5563] uppercase tracking-widest font-medium">
              Municipal Intelligence
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 group",
                isActive
                  ? "bg-[#1E2B4A] text-[#60A5FA]"
                  : "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-[#13161D]"
              )}
            >
              <Icon
                size={16}
                className={clsx(
                  "flex-shrink-0 transition-colors",
                  isActive ? "text-[#60A5FA]" : "text-[#4B5563] group-hover:text-[#9CA3AF]"
                )}
              />
              {!collapsed && (
                <span className="text-[12.5px] font-medium truncate">
                  {item.label}
                </span>
              )}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-[#1E2330] space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#4B5563] hover:text-[#9CA3AF] hover:bg-[#13161D] transition-colors group">
          <Activity size={16} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-[12.5px] font-medium">System Status</span>
          )}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#4B5563] hover:text-[#9CA3AF] hover:bg-[#13161D] transition-colors group">
          <Settings size={16} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-[12.5px] font-medium">Settings</span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center px-3 py-2 rounded-md text-[#374151] hover:text-[#6B7280] hover:bg-[#13161D] transition-colors"
        >
          <ChevronRight
            size={14}
            className={clsx("transition-transform duration-300", collapsed ? "rotate-0" : "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
}
