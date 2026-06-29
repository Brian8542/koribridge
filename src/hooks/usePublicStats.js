import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const MIN_USERS_TO_SHOW = 5;

export function usePublicStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const { data, error } = await supabase.rpc('get_public_stats');
        if (!cancelled && !error && data) {
          setStats(data);
        }
      } catch {
        // stats are non-critical; landing page still renders without them
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const hasEnoughData = !loading && stats !== null && (stats.total_users || 0) >= MIN_USERS_TO_SHOW;

  return { stats, loading, hasEnoughData };
}
