import {
  PaperCard,
  PaperCardContent,
  PaperCardHeader,
  PaperCardTitle,
  SectionHeader,
} from "@/components/ui/academic";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="container mx-auto px-2 py-4 max-w-5xl">
      <SectionHeader
        icon={FileText}
        title="Terms of Service"
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
            <PaperCardTitle className="text-base">
              Agreement to Terms
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm">
              By accessing or using Based Math Game, you agree to be bound by
              these Terms of Service. If you disagree with any part of these
              terms, you may not access the service.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">Use License</PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm">
              Permission is granted to use Based Math Game for personal,
              educational, and non-commercial purposes. This license shall
              automatically terminate if you violate any of these restrictions.
            </p>
            <div>
              <h3 className="font-semibold mb-1 text-base">You may not:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Use the service for any illegal purpose</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    Attempt to gain unauthorized access to any part of the
                    service
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    Use automated systems or bots to manipulate scores or
                    leaderboards
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Interfere with or disrupt the service or servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    Impersonate another user or provide false information
                  </span>
                </li>
              </ul>
            </div>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">User Accounts</PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account.
            </p>
            <p className="text-sm">
              You must notify us immediately of any unauthorized use of your
              account or any other breach of security.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">Guest Users</PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm">
              Guest users can access most features without creating an account.
              However, guest data is temporary and will be deleted when you
              close your browser or sign out.
            </p>
            <p className="text-sm">
              Guest users cannot appear on global leaderboards. To save your
              progress permanently, you must create an account.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Leaderboards and Scores
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm">
              We reserve the right to remove any scores or users from
              leaderboards if we suspect cheating, manipulation, or violation of
              these terms.
            </p>
            <p className="text-sm">
              All scores are subject to verification. Suspicious activity may
              result in account suspension or deletion.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Intellectual Property
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm">
              Based Math Game is open source software licensed under the GNU
              General Public License v3.0 (GPL-3.0). The source code is
              available on GitHub.
            </p>
            <p className="text-sm">
              The service name, logo, and branding are property of the project
              maintainers. All other trademarks and service marks are the
              property of their respective owners.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Disclaimer of Warranties
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm">
              The service is provided "as is" and "as available" without any
              warranties of any kind, either express or implied.
            </p>
            <p className="text-sm text-muted-foreground">
              We do not warrant that the service will be uninterrupted, secure,
              or error-free. We do not warrant the accuracy or reliability of
              any information obtained through the service.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Limitation of Liability
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent>
            <p className="text-sm">
              In no event shall Based Math Game or its maintainers be liable for
              any indirect, incidental, special, consequential, or punitive
              damages arising out of or relating to your use of the service.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Modifications to Service
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent>
            <p className="text-sm">
              We reserve the right to modify or discontinue the service at any
              time, with or without notice. We shall not be liable to you or any
              third party for any modification, suspension, or discontinuance of
              the service.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Changes to Terms
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent className="space-y-2">
            <p className="text-sm">
              We reserve the right to update these Terms of Service at any time.
              We will notify users of any material changes by posting the new
              terms on this page and updating the "Last updated" date.
            </p>
            <p className="text-sm text-muted-foreground">
              Your continued use of the service after any changes constitutes
              acceptance of the new terms.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">Governing Law</PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent>
            <p className="text-sm">
              These Terms shall be governed by and construed in accordance with
              applicable laws, without regard to conflict of law provisions.
            </p>
          </PaperCardContent>
        </PaperCard>

        <PaperCard variant="folded-sm" padding="sm">
          <PaperCardHeader>
            <PaperCardTitle className="text-base">
              Contact Information
            </PaperCardTitle>
          </PaperCardHeader>
          <PaperCardContent>
            <p className="text-sm">
              If you have any questions about these Terms of Service, please
              visit our{" "}
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
