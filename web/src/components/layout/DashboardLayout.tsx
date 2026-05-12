"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  FolderOpen,
  MessageSquare,
  User,
  UserRound,
  Newspaper,
  BookmarkCheck,
  Menu,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const Logo = () => (
  <div className="flex items-center px-2">
    <span 
      className="text-xl font-black text-slate-900 tracking-tighter"
      style={{ fontFamily: 'var(--font-logo)' }}
    >
      OneClickSathi
    </span>
  </div>
);

const SidebarItem = ({ href, icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-[14px] transition-all duration-300 group ${
      active
        ? "bg-slate-900 text-white"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }`}
  >
    <Icon size={20} className={active ? "text-white" : "text-slate-400 group-hover:text-slate-900 transition-colors"} />
    <span className={`font-bold text-sm ${active ? "text-white" : "text-slate-500 group-hover:text-slate-900"}`}>{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isConsultant = user?.role === "CONSULTANT";
  const menuItems = isConsultant
    ? [
        { href: "/consultant/dashboard", icon: LayoutDashboard, label: "CA Dashboard" },
        { href: "/consultant/assignments", icon: FileText, label: "Client Requests" },
        { href: "/consultant/profile", icon: UserRound, label: "CA Profile" },
      ]
    : [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/news", icon: Newspaper, label: "Smart Feed" },
        { href: "/schemes", icon: FileText, label: "Schemes" },
        { href: "/compliance", icon: ShieldCheck, label: "Compliance" },
        { href: "/consultant", icon: UserRound, label: "Consultant Hub" },
        { href: "/documents", icon: FolderOpen, label: "Documents" },
        { href: "/ai", icon: MessageSquare, label: "AI Assistant" },
        { href: "/schemes/saved", icon: BookmarkCheck, label: "Saved Schemes" },
        { href: "/news/bookmarks", icon: BookmarkCheck, label: "News Bookmarks" },
        { href: "/profile", icon: User, label: "Profile" },
      ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="mb-10">
            <Logo />
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-auto pt-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-brand-200 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs uppercase overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name.substring(0, 2) : (user === null ? "..." : "??")
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {user ? (
                    <>
                      <p className="text-xs font-black text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 truncate">
                        {user.email}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-2 w-16 bg-slate-200 rounded" />
                      <div className="h-1.5 w-24 bg-slate-100 rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm group"
            >
              <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30 lg:hidden">
          <button
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Logo />
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
