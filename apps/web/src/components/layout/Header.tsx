import { Bell } from 'lucide-react';
import type { Page } from './Sidebar.tsx';

const pageTitles: Record<Page, string> = {
  overview: 'Overview',
  reviews: 'App Reviews',
  insights: 'AI Insights',
  settings: 'Settings',
};

interface HeaderProps {
  currentPage: Page;
  sidebarCollapsed: boolean;
}

export function Header({ currentPage, sidebarCollapsed }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 right-0 z-20 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-56'
      }`}
    >
      <div>
        <h1 className="text-sm font-semibold text-slate-900">{pageTitles[currentPage]}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center cursor-pointer">
          <span className="text-xs font-bold text-white">A</span>
        </div>
      </div>
    </header>
  );
}
