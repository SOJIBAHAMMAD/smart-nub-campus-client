import type { Metadata } from "next";
import { Hyperlink } from "@/components/ui/hyperlink";
import { LegalDocument } from "@/app/(auth)/_components/legal-document";
import ROUTES from "@/constants/routes";

export const metadata: Metadata = {
  title: "Privacy Policy | Smart NUB Campus",
  description:
    "How Smart NUB Campus collects, uses, and protects the personal information of Northern University Bangladesh students.",
  openGraph: {
    title: "Privacy Policy | Smart NUB Campus",
    description:
      "Learn what information Smart NUB Campus collects, how it is used, and the choices you have.",
    type: "website",
  },
};

const contactEmail = "support@nub.ac.bd";

export default function PrivacyPage() {
  return (
    <LegalDocument
      kicker="Legal"
      title="Privacy Policy"
      description="What we collect, why we collect it, and the choices you have over your data."
      summaryTitle="The short version"
      summary={
        <>
          <p>
            Smart NUB Campus is a private community for verified members of
            Northern University Bangladesh. We collect the information you give
            us — your account, student details, profile, and the content you
            share — plus limited technical data needed to keep the platform
            running and secure.
          </p>
          <p>
            We use your data only to run the platform and its features, we do
            not sell your information, and we only share it with the few
            service providers required to operate (like file storage, email,
            and our AI assistant). You can export your data, adjust your
            privacy settings, deactivate your account, or request deletion at
            any time.
          </p>
        </>
      }
      effectiveDate="August 16, 2026"
      sections={[
        {
          id: "introduction",
          title: "Introduction",
          body: (
            <>
              <p>
                Smart NUB Campus (&quot;Smart NUB Campus&quot;, &quot;we&quot;,
                &quot;us&quot;, or &quot;our&quot;) is a private academic
                community platform built for students, faculty, and alumni of
                Northern University Bangladesh. This Privacy Policy explains
                what information we collect when you use the platform, why we
                collect it, how it is used and shared, and the choices you have.
              </p>
              <p>
                By creating an account or using any part of the platform, you
                agree to the collection and use of information as described in
                this policy, together with our{" "}
                <Hyperlink href={ROUTES.TERMS} className="text-brand">
                  Terms of Use
                </Hyperlink>
                .
              </p>
            </>
          ),
        },
        {
          id: "information-we-collect",
          title: "Information We Collect",
          body: (
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-foreground">
                  Account information
                </p>
                <p className="mt-1">
                  When you register, we collect your name, email address,
                  password (stored as a secure hash, never in plain text), and
                  gender. To confirm your student status, we may also review the
                  documents you submit during onboarding verification.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Student information
                </p>
                <p className="mt-1">
                  To verify and support your academic experience we store your
                  student ID, department, admission year and semester, date of
                  birth, academic status, and — for alumni features — your
                  degree title, CGPA, and graduation details.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Profile information you choose to add
                </p>
                <p className="mt-1">
                  Your bio, cover image, social and portfolio links, location,
                  phone number, current semester, batch year, current employer,
                  job title, industry, and mentor profile details. Most of this
                  is optional and you can update or remove it at any time.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Content you create
                </p>
                <p className="mt-1">
                  Resources you share (including uploaded files such as notes,
                  slides, and PDFs), discussions and replies, Q&amp;A questions
                  and answers, comments, votes, bookmarks, and reports. This
                  also includes team memberships and applications, event RSVPs,
                  and job or mentorship applications you submit.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Messages</p>
                <p className="mt-1">
                  The direct messages and conversations you exchange with other
                  members, including reactions. We store these so conversations
                  stay available across devices.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  AI assistant data
                </p>
                <p className="mt-1">
                  When you use the AI study assistant, we store your prompts,
                  the responses, files you attach for AI processing, and study
                  statistics such as questions asked and time spent.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Usage and technical information
                </p>
                <p className="mt-1">
                  Activity records, reputation points, and badges, plus session
                  information such as IP address and browser user agent, login
                  history, search queries, and basic analytics about how
                  features are used.
                </p>
              </div>
            </div>
          ),
        },
        {
          id: "how-we-use-your-information",
          title: "How We Use Your Information",
          body: (
            <>
              <p>We use your information to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Operate the platform and its features — resources,
                  discussions, Q&amp;A, teams, events, messaging, networking,
                  and gamification.
                </li>
                <li>
                  Verify student identity and maintain a community of confirmed
                  NUB members.
                </li>
                <li>
                  Personalize your experience, including leaderboards, badge
                  achievements, and activity feeds.
                </li>
                <li>
                  Provide AI-powered assistance using your prompts and attached
                  files.
                </li>
                <li>
                  Communicate with you — for example, email verification,
                  password resets, and important account or platform notices.
                </li>
                <li>
                  Moderate content, investigate reported abuse, and keep the
                  platform safe and secure.
                </li>
                <li>
                  Comply with our legal obligations and enforce our{" "}
                  <Hyperlink href={ROUTES.TERMS} className="text-brand">
                    Terms of Use
                  </Hyperlink>
                  .
                </li>
              </ul>
              <p>
                We do not sell, rent, or trade your personal information to
                third parties.
              </p>
            </>
          ),
        },
        {
          id: "ai-features",
          title: "AI Features",
          body: (
            <>
              <p>
                The AI study assistant sends your prompt and any attached file
                to a third-party AI provider to generate a response. We store
                the conversation so you can revisit it later, and we may use it
                to improve the assistant. Study statistics are aggregated and
                used to show you your learning progress.
              </p>
              <p>
                Please do not include sensitive personal information, financial
                details, or anyone else&apos;s personal data in AI prompts or
                attachments. AI responses may be inaccurate — always verify
                important information yourself.
              </p>
            </>
          ),
        },
        {
          id: "cookies-and-similar-technologies",
          title: "Cookies & Similar Technologies",
          body: (
            <>
              <p>
                We use a session cookie issued by our authentication provider to
                keep you signed in. We also set a small &quot;session
                mirror&quot; cookie on our web domain so your session can be
                forwarded securely to our API. These are necessary for the
                platform to work — you must allow them to stay signed in.
              </p>
              <p>
                You can sign out at any time, and your browser&apos;s settings
                let you view or clear cookies. We do not use third-party
                advertising or tracking cookies.
              </p>
            </>
          ),
        },
        {
          id: "how-we-share-information",
          title: "How We Share Information",
          body: (
            <>
              <p>
                We share your information only as needed to operate the
                platform, with service providers that help us:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-foreground">File and image storage</strong>{" "}
                  — uploaded files, images, and attachments are stored with a
                  cloud storage provider (Cloudinary).
                </li>
                <li>
                  <strong className="text-foreground">AI provider</strong> — to
                  generate AI responses from your prompts and attachments.
                </li>
                <li>
                  <strong className="text-foreground">Email provider</strong> —
                  to deliver verification codes and password resets.
                </li>
                <li>
                  <strong className="text-foreground">Hosting and database</strong>{" "}
                  — the servers and database that run the platform.
                </li>
              </ul>
              <p>
                These providers receive only the data required to provide their
                service and are expected to protect it. Content you post to
                public areas — resources, discussions, Q&amp;A, and team
                spaces — is visible to other verified members of the platform.
                Your profile is visible to other members, and you control
                whether you appear in the alumni directory through your privacy
                settings.
              </p>
              <p>
                We may disclose information if required by law or a valid legal
                request, or to protect the safety, rights, and property of NUB,
                our members, or the public.
              </p>
            </>
          ),
        },
        {
          id: "data-security",
          title: "Data Security",
          body: (
            <>
              <p>
                We protect your information with industry-standard measures:
                passwords are stored as hashes, data is encrypted in transit,
                access to your account requires your credentials, and access to
                member data is limited to what each feature needs. Student
                verification helps keep the community real and reduces abuse.
              </p>
              <p>
                No method of transmission or storage is 100% secure. We work to
                protect your data but cannot guarantee absolute security — and
                you can help by keeping your password private and signing out on
                shared devices.
              </p>
            </>
          ),
        },
        {
          id: "data-retention",
          title: "Data Retention",
          body: (
            <>
              <p>
                We keep your information for as long as your account is active
                or as needed to provide the platform, comply with legal
                obligations, resolve disputes, and enforce our terms. Content
                you delete is removed from the platform. When you deactivate
                your account we schedule its deletion, and you can export your
                data before that happens.
              </p>
              <p>
                Some records — such as security logs and abuse reports — may be
                retained longer where required for safety or legal reasons.
              </p>
            </>
          ),
        },
        {
          id: "your-rights-and-controls",
          title: "Your Rights & Controls",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Access and correction:</strong>{" "}
                review and update your profile, student, and account details
                anytime from your{" "}
                <Hyperlink href={ROUTES.SETTINGS} className="text-brand">
                  settings
                </Hyperlink>
                .
              </li>
              <li>
                <strong className="text-foreground">Privacy settings:</strong>{" "}
                control profile visibility, alumni directory appearance, and
                notification preferences.
              </li>
              <li>
                <strong className="text-foreground">Export your data:</strong>{" "}
                request a copy of the data associated with your account from
                your settings.
              </li>
              <li>
                <strong className="text-foreground">
                  Deactivate or delete:
                </strong>{" "}
                deactivate your account or request account deletion from your
                settings.
              </li>
              <li>
                <strong className="text-foreground">Block members:</strong>{" "}
                block other members from contacting you.
              </li>
              <li>
                <strong className="text-foreground">Complaints:</strong> contact
                us with any concern — we respond promptly and you may also
                complain to the relevant data protection authority in
                Bangladesh.
              </li>
            </ul>
          ),
        },
        {
          id: "childrens-privacy",
          title: "Children's Privacy",
          body: (
            <p>
              The platform is intended for university students and is not
              directed to anyone under the age of 18. We do not knowingly
              collect personal information from minors, and any account that
              appears to belong to someone under 18 will be closed and the data
              removed.
            </p>
          ),
        },
        {
          id: "international-and-legal-notes",
          title: "International & Legal Notes",
          body: (
            <>
              <p>
                The platform is operated for Northern University Bangladesh and
                is subject to the laws of Bangladesh. Some service providers may
                store or process data in locations outside Bangladesh; where
                this happens, we rely on appropriate safeguards and the
                providers&apos; commitments to protect your data.
              </p>
              <p>
                We will continue to meet applicable Bangladeshi data protection
                requirements and will update this policy as the legal landscape
                evolves.
              </p>
            </>
          ),
        },
        {
          id: "changes-to-this-policy",
          title: "Changes to This Policy",
          body: (
            <p>
              We may update this Privacy Policy from time to time. When we make
              material changes, we will update the effective date above and
              notify you through the platform. Continued use of the platform
              after changes take effect means you accept the updated policy.
            </p>
          ),
        },
      ]}
      contactEmail={contactEmail}
      footerNote={
        <p>
          Privacy and Terms go hand in hand. Review our{" "}
          <Hyperlink href={ROUTES.TERMS} className="text-brand">
            Terms of Use
          </Hyperlink>{" "}
          to understand the rules that apply to using the platform.
        </p>
      }
    />
  );
}
