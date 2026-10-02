export type Sentiment = 'positive' | 'negative' | 'neutral';
export type InsightCategory = 'Performance' | 'UX' | 'Feature Request' | 'Bug' | 'Positive';
export type InsightSeverity = 'High' | 'Medium' | 'Low';

export interface Review {
  id: string;
  rating: number;
  content: string;
  date: string;
  appVersion: string;
  sentiment: Sentiment;
  author: string;
}

export interface Insight {
  id: string;
  title: string;
  category: InsightCategory;
  mentions: number;
  severity: InsightSeverity;
  sentiment: Sentiment;
  quotes: string[];
  suggestedAction: string;
}

export interface TrendDataPoint {
  date: string;
  reviews: number;
  avgRating: number;
}

export const mockReviews: Review[] = [
  {
    id: '1',
    rating: 1,
    content: 'The app drains my battery even when I\'m not using it. After the latest update it went from 10% battery usage to over 40% in just a few hours of background running.',
    date: '2024-10-01',
    appVersion: '4.2.1',
    sentiment: 'negative',
    author: 'Sarah K.',
  },
  {
    id: '2',
    rating: 5,
    content: 'Absolutely love this app! It has transformed how I manage my workflow. The UI is clean and intuitive, and performance is smooth.',
    date: '2024-10-01',
    appVersion: '4.2.1',
    sentiment: 'positive',
    author: 'Marcus T.',
  },
  {
    id: '3',
    rating: 2,
    content: 'I have to log in again every time I open the app. It\'s incredibly frustrating and makes the app nearly unusable for daily tasks.',
    date: '2024-09-30',
    appVersion: '4.2.0',
    sentiment: 'negative',
    author: 'Jennifer L.',
  },
  {
    id: '4',
    rating: 4,
    content: 'Great app overall. Please add dark mode! It would make the app much easier to use at night. Everything else works perfectly.',
    date: '2024-09-30',
    appVersion: '4.2.0',
    sentiment: 'positive',
    author: 'David R.',
  },
  {
    id: '5',
    rating: 3,
    content: 'Average experience. Some features work well but there are occasional crashes when switching between tabs quickly.',
    date: '2024-09-29',
    appVersion: '4.1.9',
    sentiment: 'neutral',
    author: 'Amanda P.',
  },
  {
    id: '6',
    rating: 5,
    content: 'Best app in its category by far. Updates keep getting better and the team is clearly listening to user feedback.',
    date: '2024-09-29',
    appVersion: '4.2.1',
    sentiment: 'positive',
    author: 'Chris M.',
  },
  {
    id: '7',
    rating: 1,
    content: 'Crashes constantly on my Pixel 7. Tried reinstalling multiple times. This is unacceptable for a paid subscription.',
    date: '2024-09-28',
    appVersion: '4.2.0',
    sentiment: 'negative',
    author: 'Robert W.',
  },
  {
    id: '8',
    rating: 4,
    content: 'Really solid app. Would be perfect with offline mode support. Otherwise the sync is fast and reliable.',
    date: '2024-09-28',
    appVersion: '4.1.9',
    sentiment: 'positive',
    author: 'Emily H.',
  },
  {
    id: '9',
    rating: 2,
    content: 'The notification system is broken. I\'m getting duplicate alerts and missing important ones. Really disruptive to my workflow.',
    date: '2024-09-27',
    appVersion: '4.2.1',
    sentiment: 'negative',
    author: 'Tom B.',
  },
  {
    id: '10',
    rating: 5,
    content: 'Incredible app. The recent redesign made everything so much more intuitive. Customer support is also very responsive.',
    date: '2024-09-27',
    appVersion: '4.2.1',
    sentiment: 'positive',
    author: 'Lisa N.',
  },
  {
    id: '11',
    rating: 3,
    content: 'Decent but the loading times have gotten worse with each update. Hope they optimize the performance soon.',
    date: '2024-09-26',
    appVersion: '4.2.0',
    sentiment: 'neutral',
    author: 'Kevin S.',
  },
  {
    id: '12',
    rating: 4,
    content: 'Love the app! One suggestion: the widget needs more customization options. But overall it\'s great.',
    date: '2024-09-26',
    appVersion: '4.1.8',
    sentiment: 'positive',
    author: 'Rachel G.',
  },
];

export const mockInsights: Insight[] = [
  {
    id: '1',
    title: 'Battery drain after latest update',
    category: 'Performance',
    mentions: 342,
    severity: 'High',
    sentiment: 'negative',
    quotes: [
      'The app drains my battery even when I\'m not using it.',
      'Battery usage jumped from 8% to 35% after the v4.2 update.',
      'Had to uninstall because it was killing my battery life.',
    ],
    suggestedAction: 'Investigate background processes introduced in v4.2.1. Consider adding battery usage optimization and reviewing wake locks.',
  },
  {
    id: '2',
    title: 'Login experience needs improvement',
    category: 'UX',
    mentions: 186,
    severity: 'Medium',
    sentiment: 'negative',
    quotes: [
      'I have to log in again every time I open the app.',
      'Session keeps expiring after 10 minutes, very annoying.',
      'Why do I need to authenticate every single time?',
    ],
    suggestedAction: 'Review session token persistence and expiry settings. Implement remember-me functionality and biometric authentication.',
  },
  {
    id: '3',
    title: 'Users are requesting dark mode',
    category: 'Feature Request',
    mentions: 124,
    severity: 'Low',
    sentiment: 'neutral',
    quotes: [
      'Please add dark mode. It would make the app much easier to use.',
      'Dark mode would be a game changer, especially at night.',
      'Every modern app has dark mode except this one.',
    ],
    suggestedAction: 'Prioritize dark mode implementation in next release cycle. This is a high-visibility feature that drives positive reviews.',
  },
  {
    id: '4',
    title: 'Frequent crashes on Android 14',
    category: 'Bug',
    mentions: 98,
    severity: 'High',
    sentiment: 'negative',
    quotes: [
      'Crashes constantly on my Pixel 7.',
      'App closes randomly when switching tabs on Android 14.',
      'Force closes every 20 minutes. Completely unusable.',
    ],
    suggestedAction: 'Prioritize Android 14 compatibility testing. Review crash logs for common stack traces and release a hotfix.',
  },
  {
    id: '5',
    title: 'Users love the redesigned UI',
    category: 'Positive',
    mentions: 215,
    severity: 'Low',
    sentiment: 'positive',
    quotes: [
      'The new design is beautiful and much easier to navigate.',
      'Recent redesign made everything so much more intuitive.',
      'Love the cleaner interface in the latest update.',
    ],
    suggestedAction: 'Continue investing in UI/UX improvements. Highlight the redesign in app store screenshots and release notes.',
  },
  {
    id: '6',
    title: 'Offline mode is highly requested',
    category: 'Feature Request',
    mentions: 87,
    severity: 'Medium',
    sentiment: 'neutral',
    quotes: [
      'Would be perfect with offline mode support.',
      'Need to be able to use this on the subway without data.',
      'Offline functionality would make this a 5-star app.',
    ],
    suggestedAction: 'Evaluate technical feasibility of offline mode. Start with read-only offline access as an MVP.',
  },
];

// Generate 30 days of trend data
export const mockTrendData: TrendDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseReviews = 380;
  const variance = Math.sin(i * 0.4) * 60 + Math.random() * 40;
  const reviews = Math.round(baseReviews + variance);
  const baseRating = 3.9;
  const ratingVariance = Math.sin(i * 0.3) * 0.2 + (Math.random() - 0.5) * 0.15;
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    reviews,
    avgRating: parseFloat((baseRating + ratingVariance).toFixed(2)),
  };
});
