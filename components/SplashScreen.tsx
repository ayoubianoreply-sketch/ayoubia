'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLeaving(true), 800);
    const hideTimer = window.setTimeout(() => setVisible(false), 1000);
    return () => { window.clearTimeout(fadeTimer); window.clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;
  return <div className={`splash-screen${leaving ? ' is-leaving' : ''}`} role="status" aria-label="جاري تحميل AYOUBIA">
    <img src="/logo.png" alt="AYOUBIA Logo" />
    <span className="splash-dots" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => <i key={index} />)}
    </span>
  </div>;
}
