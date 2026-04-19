import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ArrowRightLeft, Users, MessageSquare,
  BarChart3, Shield, Menu, X, ChevronRight, Bot, LogOut, MessageCircle
} from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import FloatingChatbot from "./chatbot/FloatingChatbot";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/handoffs", label: "Handoff Pipeline", icon: ArrowRightLeft },
  { path: "/communications", label: "Communications", icon: MessageSquare },
  { path: "/chatbot", label: "AI Assistant", icon: Bot },
  { path: "/team-capacity", label: "Team Capacity", icon: Users },
  { path: "/reports", label: "Reports & Analytics", icon: BarChart3 },
  { path: "/security", label: "Security & Audit", icon: Shield },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Bot className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-sm text-sidebar-foreground">RenewalIQ</h1>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Solutions Specialist</p>
          </div>
          <button className="lg:hidden text-sidebar-foreground/60" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-sidebar-foreground">
                {user?.full_name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.full_name || "User"}</p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={() => base44.auth.logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-4 lg:px-8 bg-card border-b border-border">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          {/* Microsoft Sales branding in header */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Microsoft Solutions Specialist</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-xs text-muted-foreground">Contract Renewal & NRR Platform</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0078d4]/10 rounded-full">
              <div className="h-2 w-2 rounded-full bg-[#0078d4] animate-pulse" />
              <span className="text-xs font-medium text-[#0078d4]">Copilot Agent Active</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot />
    </div>
  );
}