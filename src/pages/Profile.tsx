import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isGuest, updateDisplayName, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) return;

    setSaving(true);
    try {
      await updateDisplayName(displayName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update display name:', error);
      alert('Failed to update display name');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Type */}
          <div>
            <Label>Account Type</Label>
            <div className="mt-2">
              {isGuest ? (
                <div className="space-y-2">
                  <Badge variant="outline">Guest Account</Badge>
                  <p className="text-sm text-muted-foreground">
                    You're currently playing as a guest. Create an account to save your progress across devices.
                  </p>
                  <Button onClick={() => navigate('/signup')} size="sm">
                    Create Account
                  </Button>
                </div>
              ) : (
                <Badge className="bg-green-600">Registered Account</Badge>
              )}
            </div>
          </div>

          {/* Email */}
          {user?.email && (
            <div>
              <Label>Email</Label>
              <p className="mt-2 text-sm">{user.email}</p>
            </div>
          )}

          {/* Display Name */}
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving || !displayName.trim()}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm">{user?.displayName || 'Not set'}</p>
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* User ID */}
          <div>
            <Label>User ID</Label>
            <p className="mt-2 text-sm font-mono text-muted-foreground">{user?.uid}</p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t space-y-2">
            <Button onClick={() => navigate('/stats')} variant="outline" className="w-full">
              View Statistics
            </Button>
            <Button onClick={handleSignOut} variant="destructive" className="w-full">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

