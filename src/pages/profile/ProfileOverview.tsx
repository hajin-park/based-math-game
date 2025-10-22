import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Calendar, Hash } from 'lucide-react';
import { getUserAvatarUrl } from '@/lib/avatarGenerator';

export default function ProfileOverview() {
  const { user } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserPhotoURL = () => {
    if (!user) return undefined;

    // Get photoURL or generate pixel art avatar
    const photoURL = user && 'photoURL' in user ? user.photoURL : null;
    return getUserAvatarUrl({ photoURL }, user.uid);
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCreatedAt = () => {
    if (user && 'metadata' in user && user.metadata?.creationTime) {
      return new Date(user.metadata.creationTime).getTime();
    }
    if (user && 'createdAt' in user) {
      return user.createdAt;
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Overview</h1>
        <p className="text-muted-foreground mt-1">Your account information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={getUserPhotoURL()} alt={user?.displayName || 'User'} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(user?.displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {user?.displayName || 'User'}
              </h3>
              <Badge className="mt-1 bg-green-600">Authenticated Account</Badge>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 pt-4 border-t dark:border-gray-800">
            {/* Email */}
            {user && 'email' in user && user.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                </div>
              </div>
            )}

            {/* User ID */}
            <div className="flex items-center gap-3 text-sm">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="font-mono text-xs text-gray-900 dark:text-gray-100">{user?.uid}</p>
              </div>
            </div>

            {/* Account Created */}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Account Created</p>
                <p className="text-gray-900 dark:text-gray-100">{formatDate(getCreatedAt())}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Your gaming performance at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-2xl font-bold text-primary">-</p>
              <p className="text-sm text-muted-foreground mt-1">Games Played</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-2xl font-bold text-primary">-</p>
              <p className="text-sm text-muted-foreground mt-1">High Score</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-2xl font-bold text-primary">-</p>
              <p className="text-sm text-muted-foreground mt-1">Average Score</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Visit the <a href="/stats" className="text-primary hover:underline">Stats page</a> for detailed analytics
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

