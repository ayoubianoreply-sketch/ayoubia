import type { Metadata } from 'next';
import './globals.css';
import SplashScreen from '../components/SplashScreen';
import StorefrontOverlays from '../components/StorefrontOverlays';
import Providers from './providers';
import VisitorTracker from '@/components/VisitorTracker';

export const metadata: Metadata = {
  title: 'AYOUBIA',
  description: 'أجود أنواع الأفرشة والديوكورات العصرية بلمسة تجمع بين الفخامة والبساطة.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body><Providers><SplashScreen />{children}<StorefrontOverlays /><VisitorTracker /></Providers></body></html>;
}
