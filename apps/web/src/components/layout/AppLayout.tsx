import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import type { Page } from './Sidebar.tsx';

interface AppLayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <Header currentPage={currentPage} sidebarCollapsed={collapsed} />
      <main
        className={`pt-14 min-h-screen transition-all duration-300 ${
          collapsed ? 'pl-16' : 'pl-56'
        }`}
      >
        <div className="p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
