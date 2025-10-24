import {
  PaperCard,
  PaperCardContent,
  PaperCardHeader,
  PaperCardTitle,
  SectionHeader,
} from "@/components/ui/academic";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="container mx-auto px-2 py-4 max-w-5xl">
      <SectionHeader
        icon={Shield}
        title="Privacy Policy"
        description={`Last updated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
        className="mb-6"
      />

      <div className="space-y-3">
        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">Introduction</PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2 text-sm leading-relaxed">
            <p>
              Based Math Game ("we", "our", or "us") is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use,
              and safeguard your information when you use our web application.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Information We Collect
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-1 text-base">
                Account Information
              </h3>
              <p className="text-sm text-muted-foreground">
                When you create an account, we collect your email address,
                display name, and authentication credentials. If you sign in
                with Google, we receive basic profile information from your
                Google account.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-base">Game Data</h3>
              <p className="text-sm text-muted-foreground">
                We store your game scores, statistics, and game history to track
                your progress and display on leaderboards.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-base">Guest Users</h3>
              <p className="text-sm text-muted-foreground">
                Guest users can play without creating an account. Guest data is
                stored locally in your browser and temporarily in our database
                during your session. Guest data is automatically deleted when
                you close your browser or sign out.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-base">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                We use Firebase Analytics to understand how users interact with
                our application. This includes anonymous usage data such as page
                views, game completions, and feature usage.
              </p>
            </div>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              How We Use Your Information
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>To provide and maintain our service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>To track your progress and display statistics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>To enable multiplayer features and leaderboards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>To improve our application based on usage patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>To communicate with you about your account</span>
              </li>
            </ul>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Data Storage and Security
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm">
              Your data is stored securely using Firebase, Google's cloud
              platform. We implement appropriate technical and organizational
              measures to protect your personal information.
            </p>
            <p className="text-sm text-muted-foreground">
              However, no method of transmission over the internet is 100%
              secure. While we strive to protect your data, we cannot guarantee
              absolute security.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">Your Rights</PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Access:</strong> You can view your account information
                  and game data at any time
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Update:</strong> You can update your display name in
                  your profile settings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Delete:</strong> You can delete your account and all
                  associated data from your profile settings
                </span>
              </li>
            </ul>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Third-Party Services
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm">
              We use the following third-party services:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Firebase:</strong> For authentication, database, and
                  analytics
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Google Sign-In:</strong> For optional Google
                  authentication
                </span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              These services have their own privacy policies. We encourage you
              to review them.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Children's Privacy
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent>
            <p className="text-sm">
              Our service is not directed to children under 13. We do not
              knowingly collect personal information from children under 13. If
              you are a parent or guardian and believe your child has provided
              us with personal information, please contact us.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Changes to This Policy
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent>
            <p className="text-sm">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">Contact Us</PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent>
            <p className="text-sm">
              If you have questions about this Privacy Policy, please visit our{" "}
              <a
                href="https://github.com/hajin-park/based-math-game"
                className="text-primary hover:underline link-underline"
              >
                GitHub repository
              </a>{" "}
              to open an issue or contact the maintainers.
            </p>
          </PaperCardContent>
        </PaperCard>
      </div>
    </div>
  );
}
