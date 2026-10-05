import { useState } from 'react';
import type { Review, ReviewInsight } from '@reviewlens/shared';
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

export interface AnalyzedData {
  packageName: string;
  insights: ReviewInsight[];
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('overview');
  const [fetched, setFetched] = useState<FetchedData | null>(null);
  const [analyzed, setAnalyzed] = useState<AnalyzedData | null>(null);

  const handleFetchSuccess = (packageName: string, reviews: Review[]) => {
    setFetched({ packageName, reviews });
    // Clear previous analysis when new reviews are fetched
    setAnalyzed(null);
    setCurrentPage('reviews');
  };

  const handleAnalyzeSuccess = (packageName: string, insights: ReviewInsight[]) => {
    setAnalyzed({ packageName, insights });
    setCurrentPage('insights');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview onNavigate={setCurrentPage} onFetchSuccess={handleFetchSuccess} />;
      case 'reviews':
        return (
          <AppReviews
            fetched={fetched}
            analyzed={analyzed}
            onFetchSuccess={handleFetchSuccess}
            onAnalyzeSuccess={handleAnalyzeSuccess}
          />
        );
      case 'insights':
        return (
          <AIInsights
            analyzed={analyzed}
            fetched={fetched}
            onNavigate={setCurrentPage}
          />
        );
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
