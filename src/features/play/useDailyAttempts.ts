import { useMemo } from "react";

import { useRunHistory, type RunRecord } from "@/data";

/** Today's attempts at a daily mode, oldest first (the first is the ranked one). */
export function useDailyAttempts(dailyId: string) {
  const { runs, loading } = useRunHistory({ modeId: dailyId, limit: 20 });
  const attempts = useMemo(() => [...runs].reverse(), [runs]);
  return {
    attempts,
    first: attempts[0] as RunRecord | undefined,
    loading,
  };
}
