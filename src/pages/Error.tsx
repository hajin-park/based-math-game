import { useRouteError, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

const ErrorPage = () => {
  const error = useRouteError() as {
    statusText?: string;
    message?: string;
    stack?: string;
  } | null;
  const navigate = useNavigate();
  console.error(error);

  const errorMessage =
    error && typeof error === "object" && "message" in error && error.message
      ? error.message
      : error &&
          typeof error === "object" &&
          "statusText" in error &&
          error.statusText
        ? error.statusText
        : "An unexpected error occurred";

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg border-2 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-3xl">Oops! Something Went Wrong</CardTitle>
          <CardDescription className="text-base">
            We encountered an unexpected error
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground font-mono break-words">
              {errorMessage}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button onClick={() => navigate("/")} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
