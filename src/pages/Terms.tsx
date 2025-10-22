import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar } from 'lucide-react';

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-12 text-center space-y-4 animate-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className="h-10 w-10 text-primary" />
          <h1 className="text-5xl font-bold gradient-text">Terms of Service</h1>
        </div>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <p className="text-base">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By accessing or using Based Math Game, you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access the service.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Use License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Permission is granted to use Based Math Game for personal, educational, and non-commercial purposes. 
              This license shall automatically terminate if you violate any of these restrictions.
            </p>
            <div>
              <h3 className="font-semibold mb-2">You may not:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Use the service for any illegal purpose</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Attempt to gain unauthorized access to any part of the service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Use automated systems or bots to manipulate scores or leaderboards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Interfere with or disrupt the service or servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Impersonate another user or provide false information</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all 
              activities that occur under your account.
            </p>
            <p>
              You must notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Guest Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Guest users can access most features without creating an account. However, guest data is temporary 
              and will be deleted when you close your browser or sign out.
            </p>
            <p>
              Guest users cannot appear on global leaderboards. To save your progress permanently, you must 
              create an account.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Leaderboards and Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to remove any scores or users from leaderboards if we suspect cheating, 
              manipulation, or violation of these terms.
            </p>
            <p>
              All scores are subject to verification. Suspicious activity may result in account suspension or deletion.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Based Math Game is open source software licensed under the GNU General Public License v3.0 (GPL-3.0). 
              The source code is available on GitHub.
            </p>
            <p>
              The service name, logo, and branding are property of the project maintainers. All other trademarks 
              and service marks are the property of their respective owners.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Disclaimer of Warranties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The service is provided "as is" and "as available" without any warranties of any kind, either 
              express or implied.
            </p>
            <p className="text-sm text-muted-foreground">
              We do not warrant that the service will be uninterrupted, secure, or error-free. We do not 
              warrant the accuracy or reliability of any information obtained through the service.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              In no event shall Based Math Game or its maintainers be liable for any indirect, incidental, 
              special, consequential, or punitive damages arising out of or relating to your use of the service.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Modifications to Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We reserve the right to modify or discontinue the service at any time, with or without notice. 
              We shall not be liable to you or any third party for any modification, suspension, or 
              discontinuance of the service.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We reserve the right to update these Terms of Service at any time. We will notify users of any 
              material changes by posting the new terms on this page and updating the "Last updated" date.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Your continued use of the service after any changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws, without 
              regard to conflict of law provisions.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have any questions about these Terms of Service, please visit our{' '}
              <a href="https://github.com/hajin-park/based-math-game" className="text-primary hover:underline">
                GitHub repository
              </a>{' '}
              to open an issue or contact the maintainers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

