import { MainLayout } from '@/components/layout/main-layout';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-8">
        <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>

        <div className="prose prose-gray dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this blog platform, you agree to be bound
              by these Terms of Service and all applicable laws and regulations.
              If you do not agree with any of these terms, you are prohibited
              from using or accessing this site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the
              materials (information or software) on this blog platform for
              personal, non-commercial transitory viewing only.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">3. Content Guidelines</h2>
            <p>
              Users are responsible for all content they post on the platform.
              Content must not be illegal, obscene, threatening, defamatory, or
              infringe on intellectual property rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">4. Privacy Policy</h2>
            <p>
              Your use of this platform is also governed by our Privacy Policy.
              Please review our Privacy Policy to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Modifications</h2>
            <p>
              We reserve the right to revise these terms of service at any time
              without notice. By using this platform, you agree to be bound by
              the current version of these terms of service.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
