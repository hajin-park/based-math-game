import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PaperCard,
  PaperCardHeader,
  PaperCardTitle,
  PaperCardDescription,
  PaperCardContent,
  RuledSeparator,
} from "@/components/ui/academic";
import { Button } from "@/components/ui/button";
import { NotebookInput } from "@/components/ui/notebook-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      navigate("/");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign in";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      navigate("/");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] paper-texture flex items-center">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-background -z-10" />

      <div className="container mx-auto px-4 py-4">
        <div className="w-full max-w-md mx-auto space-y-3 animate-in">
          {/* Header with Academic Styling - Compact */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-1">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold">
              <span className="highlight-scribble">Welcome Back</span>
            </h1>
            <p className="text-xs text-muted-foreground annotation">
              Sign in to continue
            </p>
          </div>

          {/* Main Login Card - Compact */}
          <PaperCard variant="folded-sm" padding="sm" className="border-2">
            <PaperCardHeader className="p-4 pb-0">
              <PaperCardTitle className="text-lg font-serif">
                Sign In
              </PaperCardTitle>
              <PaperCardDescription className="text-xs">
                Enter your credentials below
              </PaperCardDescription>
            </PaperCardHeader>

            <form onSubmit={handleEmailLogin}>
              <PaperCardContent className="space-y-3 p-4">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="border py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email
                  </Label>
                  <NotebookInput
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    variant="underline"
                    className="font-mono h-8 text-sm"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    Password
                  </Label>
                  <NotebookInput
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    variant="underline"
                    className="h-8 text-sm"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full shadow-sm hover:shadow-md transition-all h-9"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-pulse text-sm">Signing in...</span>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-3.5 w-3.5" />
                      <span className="text-sm">Sign In</span>
                    </>
                  )}
                </Button>

                {/* Separator */}
                <RuledSeparator spacing="sm" className="my-2">
                  <span className="bg-card px-2 text-xs text-muted-foreground">
                    Or continue with
                  </span>
                </RuledSeparator>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 hover:bg-accent/50 transition-all h-9"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm">Google</span>
                </Button>
              </PaperCardContent>
            </form>
          </PaperCard>

          {/* Separator */}
          <RuledSeparator spacing="sm" />

          {/* Footer Actions - Compact */}
          <div className="flex items-center gap-2 text-xs text-center justify-center">
            <span className="text-muted-foreground">
              New to Based Math Game?
            </span>
            <Button
              variant="link"
              className="p-0 h-auto text-xs font-semibold text-primary"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </Button>
            <span className="text-muted-foreground">•</span>
            <Button
              variant="link"
              className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/")}
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
