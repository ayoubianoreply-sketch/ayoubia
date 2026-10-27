'use client';

import { LocaleProvider } from '@/components/LocaleProvider';
import ProfileOnboardingGate from '@/components/ProfileOnboardingGate';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}<ProfileOnboardingGate /></LocaleProvider>;
}
