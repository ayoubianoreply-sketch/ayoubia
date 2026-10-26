'use client';

import { useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function VisitorTracker() {
  useEffect(() => {
    try {
      let key = localStorage.getItem('ayoubia-visitor-key');
      if (!key) {
        key = crypto.randomUUID();
        localStorage.setItem('ayoubia-visitor-key', key);
      }
      void createBrowserSupabaseClient().rpc('log_store_visit', { p_visitor_key: key }).then(({ error }) => {
        if (error) console.warn('Visitor count is unavailable until the latest Supabase migration is applied.');
      });
    } catch { /* Storage or privacy restrictions should not interrupt browsing. */ }
  }, []);
  return null;
}
