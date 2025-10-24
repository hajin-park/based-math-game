import { useNavigate } from "react-router-dom";
import {
  PaperCard,
  PaperCardContent,
  PaperCardDescription,
  PaperCardHeader,
  PaperCardTitle,
  SectionHeader,
} from "@/components/ui/academic";
import { Button } from "@/components/ui/button";
import { Users, Plus, LogIn, Home, Zap } from "lucide-react";

export default function MultiplayerHome() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-2xl space-y-6 animate-in">
        {/* Header */}
        <SectionHeader
          title="Multiplayer Mode"
          description="Compete with friends in real-time base conversion challenges"
          icon={Users}
          align="center"
          titleSize="xl"
        />

        {/* Main Card */}
        <PaperCard variant="folded" padding="none" className="shadow-lg">
          <PaperCardHeader className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <PaperCardTitle className="text-2xl">
                Choose Your Action
              </PaperCardTitle>
            </div>
            <PaperCardDescription className="text-base">
              Create a new room or join an existing one
            </PaperCardDescription>
          </PaperCardHeader>
          <PaperCardContent className="p-6 pt-0 space-y-4">
            {/* Create Room */}
            <PaperCard
              variant="interactive"
              padding="none"
              className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200 border-2 cursor-pointer"
              onClick={() => navigate("/multiplayer/create")}
            >
              <PaperCardHeader className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <PaperCardTitle className="text-xl">
                      Create Room
                    </PaperCardTitle>
                    <PaperCardDescription className="text-base">
                      Start a new game and invite friends
                    </PaperCardDescription>
                  </div>
                </div>
              </PaperCardHeader>
            </PaperCard>

            {/* Join Room */}
            <PaperCard
              variant="interactive"
              padding="none"
              className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200 border-2 cursor-pointer"
              onClick={() => navigate("/multiplayer/join")}
            >
              <PaperCardHeader className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <LogIn className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <PaperCardTitle className="text-xl">
                      Join Room
                    </PaperCardTitle>
                    <PaperCardDescription className="text-base">
                      Enter a room code to join a game
                    </PaperCardDescription>
                  </div>
                </div>
              </PaperCardHeader>
            </PaperCard>

            {/* Back to Home */}
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="lg"
              className="w-full"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </PaperCardContent>
        </PaperCard>
      </div>
    </div>
  );
}
