import type { Metadata } from "next";
import { Hyperlink } from "@/components/ui/hyperlink";
import { LegalDocument } from "@/app/(auth)/_components/legal-document";
import ROUTES from "@/constants/routes";

export const metadata: Metadata = {
  title: "Terms of Use | Smart NUB Campus",
  description:
    "The rules for using Smart NUB Campus, the private community platform for Northern University Bangladesh students.",
  openGraph: {
    title: "Terms of Use | Smart NUB Campus",
    description:
      "The terms that apply when you use Smart NUB Campus — eligibility, acceptable use, and more.",
    type: "website",
  },
};

const contactEmail = "support@nub.ac.bd";

export default function TermsPage() {
  return (
    <LegalDocument
      kicker="Legal"
      title="Terms of Use"
      description="The rules that keep Smart NUB Campus a safe, useful space for everyone."
      summaryTitle="The short version"
      summary={
        <>
          <p>
            Smart NUB Campus is a private community for verified members of
            Northern University Bangladesh. Be real, be respectful, and share
            only what you have the right to share. You own your content, and
            you are responsible for how you use the platform.
          </p>
          <p>
            Don&apos;t spam, harass, cheat, or abuse the AI. We may remove
            content or restrict accounts that break these rules. The platform
            is provided &quot;as is&quot; and our liability is limited to the
            fullest extent permitted by law.
          </p>
        </>
      }
      effectiveDate="August 16, 2026"
      sections={[
        {
          id: "acceptance",
          title: "Acceptance of These Terms",
          body: (
            <>
              <p>
                These Terms of Use (&quot;Terms&quot;) govern your access to and
                use of Smart NUB Campus, operated for Northern University
                Bangladesh. By creating an account, or by using any part of the
                platform, you agree to be bound by these Terms and our{" "}
                <Hyperlink href={ROUTES.PRIVACY} className="text-brand">
                  Privacy Policy
                </Hyperlink>
                .
              </p>
              <p>
                If you do not agree to these Terms, please do not create an
                account or use the platform.
              </p>
            </>
          ),
        },
        {
          id: "eligibility-and-verification",
          title: "Eligibility & Verification",
          body: (
            <>
              <p>
                The platform is available only to current students, faculty,
                staff, and verified alumni of Northern University Bangladesh.
                You must be at least 18 years old and capable of entering into a
                binding agreement.
              </p>
              <p>
                As part of onboarding you will be asked to verify your student
                identity. You must provide accurate, complete, and current
                information, and you may not create an account on behalf of
                someone else or impersonate any person or organization.
              </p>
            </>
          ),
        },
        {
          id: "your-account",
          title: "Your Account",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Keep your login credentials confidential. You are responsible
                for all activity that happens through your account.
              </li>
              <li>
                Do not share your account with others, and do not create
                multiple accounts to evade restrictions.
              </li>
              <li>
                If you believe your account has been compromised, change your
                password immediately and contact us.
              </li>
              <li>
                You may delete your account at any time. Your account and the
                personal data attached to it are handled in line with our{" "}
                <Hyperlink href={ROUTES.PRIVACY} className="text-brand">
                  Privacy Policy
                </Hyperlink>
                .
              </li>
            </ul>
          ),
        },
        {
          id: "acceptable-use",
          title: "Acceptable Use",
          body: (
            <>
              <p>You agree not to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Harass, bully, threaten, or demean other members, or post
                  hateful, abusive, or discriminatory content.
                </li>
                <li>
                  Post illegal content, or content that violates the rules or
                  policies of Northern University Bangladesh.
                </li>
                <li>
                  Infringe copyrights, trademarks, or other intellectual
                  property — for example, uploading paid course materials
                  without permission.
                </li>
                <li>
                  Upload malware, viruses, or anything designed to disrupt the
                  platform.
                </li>
                <li>
                  Attempt to access accounts or systems you are not authorized
                  to access, or interfere with the platform&apos;s operation.
                </li>
                <li>
                  Scrape, harvest, or solicit personal information of other
                  members without their consent.
                </li>
                <li>
                  Use the AI assistant to generate harmful, deceptive, or
                  otherwise inappropriate content.
                </li>
                <li>
                  Spam, advertise, or use the platform for commercial
                  solicitation without authorization.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "user-content-and-intellectual-property",
          title: "User Content & Intellectual Property",
          body: (
            <>
              <p>
                You retain ownership of the content you post. By posting
                content, you grant us a limited license to host, store, display,
                and distribute that content for the purpose of operating the
                platform and its features.
              </p>
              <p>
                You confirm that you have the right to share everything you
                post. Content shared to public areas — resources, discussions,
                Q&amp;A, and team spaces — may be viewed by other verified
                members, so do not post anything you are not comfortable
                sharing.
              </p>
              <p>
                The Smart NUB Campus name, branding, and design remain our
                property. If you believe content on the platform infringes your
                rights, contact us at the address below.
              </p>
            </>
          ),
        },
        {
          id: "academic-integrity",
          title: "Academic Integrity",
          body: (
            <>
              <p>
                The AI study assistant is a learning aid — a tutor, not a
                substitute for your own work. Do not submit AI-generated work as
                your own where your courses prohibit it, and do not use the
                platform to access or distribute exam materials, answer keys, or
                other content that would violate academic integrity rules.
              </p>
              <p>
                If you are unsure whether a use is acceptable, ask your
                instructor or department first.
              </p>
            </>
          ),
        },
        {
          id: "community-conduct-and-moderation",
          title: "Community Conduct & Moderation",
          body: (
            <>
              <p>
                This is a community of verified members. Treat each other with
                respect, credit original authors when you share work, and report
                content or behavior that violates these Terms.
              </p>
              <p>
                We may review, remove, or restrict access to content that
                violates these Terms or the law, and we may disable reporting
                tools, bookmarks, or votes where abuse is detected. We are not
                obligated to monitor the platform, but we take reports
                seriously.
              </p>
            </>
          ),
        },
        {
          id: "suspension-and-termination",
          title: "Suspension & Termination",
          body: (
            <>
              <p>
                We may suspend, restrict, or terminate your account if you
                violate these Terms, misrepresent who you are, or engage in
                behavior that endangers the community or the platform. Where
                practical, we will warn you first — but serious or repeated
                violations may result in immediate action.
              </p>
              <p>
                You can stop using the platform at any time by deleting your
                account. We may also discontinue or change parts of the platform
                over time.
              </p>
            </>
          ),
        },
        {
          id: "disclaimers",
          title: "Disclaimers",
          body: (
            <>
              <p>
                The platform is provided &quot;as is&quot; and &quot;as
                available&quot; without warranties of any kind, whether express
                or implied. We do not guarantee that the platform will be
                uninterrupted, error-free, or secure, and we are not responsible
                for the accuracy of member-shared content or for AI-generated
                responses.
              </p>
              <p>
                You are responsible for your own decisions, submissions, and
                academic work made with or without the help of the platform.
              </p>
            </>
          ),
        },
        {
          id: "limitation-of-liability",
          title: "Limitation of Liability",
          body: (
            <p>
              To the fullest extent permitted by law, Smart NUB Campus and its
              operators are not liable for indirect, incidental, special,
              consequential, or punitive damages, or for loss of data or
              content, arising from your use of the platform. Our total
              liability for any claim relating to the platform is limited to the
              greater of the amount you paid to use the platform (if any) or one
              hundred (100) US dollars.
            </p>
          ),
        },
        {
          id: "indemnification",
          title: "Indemnification",
          body: (
            <p>
              You agree to indemnify and hold harmless Smart NUB Campus, its
              operators, and Northern University Bangladesh from any claims,
              damages, liabilities, and expenses arising from your use of the
              platform, your content, or your violation of these Terms.
            </p>
          ),
        },
        {
          id: "governing-law-and-disputes",
          title: "Governing Law & Disputes",
          body: (
            <p>
              These Terms are governed by the laws of the People&apos;s Republic
              of Bangladesh. Any disputes arising out of or relating to these
              Terms or the platform shall be resolved through the courts of
              Bangladesh, and the parties submit to the exclusive jurisdiction
              of those courts.
            </p>
          ),
        },
        {
          id: "changes-to-these-terms",
          title: "Changes to These Terms",
          body: (
            <p>
              We may update these Terms from time to time. When we make material
              changes, we will update the effective date above and notify you
              through the platform. Continued use of the platform after changes
              take effect means you accept the updated Terms.
            </p>
          ),
        },
      ]}
      contactEmail={contactEmail}
      footerNote={
        <p>
          These Terms work together with our{" "}
          <Hyperlink href={ROUTES.PRIVACY} className="text-brand">
            Privacy Policy
          </Hyperlink>
          , which explains how we handle your information.
        </p>
      }
    />
  );
}
