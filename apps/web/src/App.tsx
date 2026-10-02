import { useState } from 'react';
import type { Review } from '@reviewlens/shared';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { Overview } from './pages/Overview.tsx';
import { AppReviews } from './pages/AppReviews.tsx';
import { AIInsights } from './pages/AIInsights.tsx';
import { Settings } from './pages/Settings.tsx';
import type { Page } from './components/layout/Sidebar.tsx';

export interface FetchedData {
  packageName: string;
  reviews: Review[];
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('overview');
  const [fetched, setFetched] = useState<FetchedData | null>(null);

  const handleFetchSuccess = (packageName: string, reviews: Review[]) => {
    setFetched({ packageName, reviews });
    setCurrentPage('reviews');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview onNavigate={setCurrentPage} onFetchSuccess={handleFetchSuccess} />;
      case 'reviews':
        return <AppReviews fetched={fetched} onFetchSuccess={handleFetchSuccess} />;
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
