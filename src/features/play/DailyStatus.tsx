import { useAuth } from "@/contexts/AuthContext";
import { useLeaderboard } from "@/data";

/** "rank #4" / "rank 100+" for a signed-in player; nothing for guests. */
export function DailyRank({ dailyId }: { dailyId: string }) {
  const { isGuest } = useAuth();
  if (isGuest) return null;
  return <DailyRankInner dailyId={dailyId} />;
}

function DailyRankInner({ dailyId }: { dailyId: string }) {
  const { me, loading } = useLeaderboard(dailyId, { limit: 1 });
  if (loading || !me) return null;
  return <>{me.rank === null ? "rank 100+" : `rank #${me.rank}`}</>;
}
