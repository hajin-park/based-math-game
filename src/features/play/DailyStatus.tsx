import { useAuth } from "@/contexts/AuthContext";
import { useLeaderboard } from "@/data";

/**
 * "rank #4" / "rank 100+" for a signed-in player on a ranked mode's board;
 * nothing for guests (they have no rank) or while loading.
 */
export function ModeRank({ modeId }: { modeId: string }) {
  const { isGuest } = useAuth();
  if (isGuest) return null;
  return <ModeRankInner modeId={modeId} />;
}

function ModeRankInner({ modeId }: { modeId: string }) {
  const { me, loading } = useLeaderboard(modeId, { limit: 1 });
  if (loading || !me) return null;
  return <>{me.rank === null ? "rank 100+" : `rank #${me.rank}`}</>;
}

/** Today's rank on the daily board (see ModeRank). */
export function DailyRank({ dailyId }: { dailyId: string }) {
  return <ModeRank modeId={dailyId} />;
}
