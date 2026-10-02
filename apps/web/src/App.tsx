import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { Overview } from './pages/Overview.tsx';
import { AppReviews } from './pages/AppReviews.tsx';
import { AIInsights } from './pages/AIInsights.tsx';
import { Settings } from './pages/Settings.tsx';
import type { Page } from './components/layout/Sidebar.tsx';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview onNavigate={setCurrentPage} />;
      case 'reviews':
        return <AppReviews />;
      case 'insights':
        return <AIInsights />;
      case 'settings':
        return <Settings />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  );
}

export default App;
