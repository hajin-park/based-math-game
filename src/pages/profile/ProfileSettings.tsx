import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  Pencil,
  Check,
  X,
  Trash2,
  Settings as SettingsIcon,
  Mail,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, updateDisplayName, deleteAccount } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) return;

    setSaving(true);
    try {
      await updateDisplayName(displayName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update display name:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update display name";
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || "");
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again or contact support.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold gradient-text">Account Settings</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Manage your account preferences and information
        </p>
      </div>

      {/* Display Name */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Display Name
          </CardTitle>
          <CardDescription className="text-base">
            This is how your name will appear to other players
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-base">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className="h-11"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving || !displayName.trim()}
                  className="gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Current Display Name
                </p>
                <p className="text-lg font-semibold">
                  {user?.displayName || "Not set"}
                </p>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email (Read-only) */}
      {user && "email" in user && user.email && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Address
            </CardTitle>
            <CardDescription className="text-base">
              Your email address cannot be changed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/30 border-2">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-base font-medium break-all">{user.email}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-2 border-destructive shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-base">
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-destructive/10 rounded-lg border-2 border-destructive/30 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <p className="font-semibold text-base">Delete Account</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2 shrink-0">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                      <AlertDialogTitle className="text-xl">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="space-y-4">
                      <p className="text-base">
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers.
                      </p>

                      <Separator />

                      <div className="space-y-2">
                        <p className="font-semibold text-destructive text-base">
                          You will lose:
                        </p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-destructive font-bold">
                              •
                            </span>
                            <span>All your game statistics and history</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-destructive font-bold">
                              •
                            </span>
                            <span>Your leaderboard rankings</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-destructive font-bold">
                              •
                            </span>
                            <span>Your profile information</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-destructive font-bold">
                              •
                            </span>
                            <span>Access to this account</span>
                          </li>
                        </ul>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
