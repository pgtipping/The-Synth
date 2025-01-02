import { MainLayout } from '@/components/layout/main-layout';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-8">
        <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>

        <div className="prose prose-gray dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create
              an account, publish content, or communicate with us. This may
              include your name, email address, and any content you post on the
              platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to provide, maintain, and
              improve our services, to communicate with you, and to personalize
              your experience on our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">3. Information Sharing</h2>
            <p>
              We do not sell or share your personal information with third
              parties except as described in this policy. We may share your
              information when required by law or to protect our rights and the
              security of our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">4. Data Security</h2>
            <p>
              We take reasonable measures to help protect your personal
              information from loss, theft, misuse, and unauthorized access,
              disclosure, alteration, and destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal
              information. You can manage your information through your account
              settings or contact us for assistance.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
