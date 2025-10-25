import { useState, useEffect } from "react";
import {
  PaperCard,
  PaperCardContent,
  PaperCardDescription,
  PaperCardHeader,
  PaperCardTitle,
  SectionHeader,
  RuledSeparator,
} from "@/components/ui/academic";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useStats, UserStats } from "@/hooks/useStats";
import {
  Mail,
  Calendar,
  Hash,
  User,
  Shield,
  TrendingUp,
  Trophy,
  Target,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { getUserAvatarUrl } from "@/lib/avatarGenerator";
import { useNavigate } from "react-router-dom";

export default function ProfileOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getUserStats } = useStats();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserPhotoURL = () => {
    if (!user) return undefined;

    // Get photoURL or generate pixel art avatar
    const photoURL = user && "photoURL" in user ? user.photoURL : null;
    return getUserAvatarUrl({ photoURL }, user.uid);
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCreatedAt = () => {
    if (user && "metadata" in user && user.metadata?.creationTime) {
      return new Date(user.metadata.creationTime).getTime();
    }
    if (user && "createdAt" in user) {
      return user.createdAt;
    }
    return undefined;
  };

  // Fetch user stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const userStats = await getUserStats();
        setStats(userStats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [getUserStats]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <SectionHeader
        title="Account Overview"
        description="Your profile information and quick stats"
        icon={User}
        align="left"
        titleSize="lg"
      />

      {/* Profile Card */}
      <PaperCard variant="folded" padding="none" className="shadow-lg">
        <PaperCardHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <PaperCardTitle className="text-2xl">
                Profile Information
              </PaperCardTitle>
              <PaperCardDescription className="text-base">
                Your basic account details
              </PaperCardDescription>
            </div>
          </div>
        </PaperCardHeader>
        <PaperCardContent className="p-6 pt-0 space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-6 p-6 rounded-sm bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 paper-texture">
            <Avatar className="h-24 w-24 border-4 border-primary/30 shadow-lg">
              <AvatarImage
                src={getUserPhotoURL()}
                alt={user?.displayName || "User"}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {getInitials(user?.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold gradient-text tracking-academic">
                {user?.displayName || "User"}
              </h3>
              <Badge className="bg-success text-success-foreground">
                <Shield className="h-3 w-3 mr-1" />
                Authenticated Account
              </Badge>
            </div>
          </div>

          <RuledSeparator />

          {/* Details */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Email */}
            {user && "email" in user && user.email && (
              <PaperCard variant="folded-sm" padding="sm" className="border-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Email Address
                    </p>
                    <p className="text-sm font-medium break-all">
                      {user.email}
                    </p>
                  </div>
                </div>
              </PaperCard>
            )}

            {/* User ID */}
            <PaperCard variant="folded-sm" padding="sm" className="border-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Hash className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    User ID
                  </p>
                  <p className="font-mono text-xs break-all">{user?.uid}</p>
                </div>
              </div>
            </PaperCard>

            {/* Account Created */}
            <PaperCard
              variant="folded-sm"
              padding="sm"
              className="border-2 md:col-span-2"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Account Created
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(getCreatedAt())}
                  </p>
                </div>
              </div>
            </PaperCard>
          </div>
        </PaperCardContent>
      </PaperCard>

      {/* Quick Stats */}
      <PaperCard variant="folded" padding="none" className="shadow-lg">
        <PaperCardHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <PaperCardTitle className="text-2xl">Quick Stats</PaperCardTitle>
              <PaperCardDescription className="text-base">
                Your gaming performance at a glance
              </PaperCardDescription>
            </div>
          </div>
        </PaperCardHeader>
        <PaperCardContent className="p-6 pt-0 space-y-6">
          {loadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PaperCard variant="folded-sm" padding="sm" className="border-2">
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold gradient-text">
                    {stats?.gamesPlayed ?? 0}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    Games Played
                  </p>
                </div>
              </PaperCard>
              <PaperCard variant="folded-sm" padding="sm" className="border-2">
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-success/10">
                      <Trophy className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-success">
                    {stats?.highScore ?? 0}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    High Score
                  </p>
                </div>
              </PaperCard>
              <PaperCard variant="folded-sm" padding="sm" className="border-2">
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-primary/10">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold gradient-text">
                    {stats?.averageScore ? Math.round(stats.averageScore) : 0}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Score
                  </p>
                </div>
              </PaperCard>
            </div>
          )}

          <RuledSeparator />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Visit the Stats page for detailed analytics
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/stats")}
              className="gap-2"
            >
              View Stats
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </PaperCardContent>
      </PaperCard>
    </div>
  );
}
