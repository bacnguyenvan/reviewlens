import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type Page = "overview" | "reviews" | "insights" | "settings";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: Array<{
  id: Page;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "reviews", label: "App Reviews", icon: MessageSquare },
  { id: "insights", label: "AI Insights", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  currentPage,
  onNavigate,
  collapsed,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-14 border-b border-slate-100 ${collapsed ? "justify-center px-0" : "px-4 gap-2.5"}`}
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-slate-900">ReviewLens</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`}
              />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div
        className={`border-t border-slate-100 p-3 ${collapsed ? "flex justify-center" : ""}`}
      >
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">A</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                Kita Nguyen
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                Free Plan
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-slate-500" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-slate-500" />
        )}
      </button>
    </aside>
  );
}
