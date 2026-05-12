import Header from "@/components/layout/Header";

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20 bg-background text-foreground">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 uppercase">Privacy Policy</h1>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Last updated: May 11, 2026. Your privacy is important to us at OneClickSathi.
            </p>
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect information that you provide directly to us when you register for an account, discover schemes, or use our AI consulting services. This may include your name, email address, business details, and financial information required for compliance tracking.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide, maintain, and improve our services.</li>
                <li>Analyze and track business compliance.</li>
                <li>Match your business with relevant government schemes.</li>
                <li>Communicate with you about updates and security.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
              <p className="mb-4">We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">4. Sharing of Information</h2>
              <p className="mb-4">We do not sell your personal information. We may share data with service providers who perform services on our behalf or when required by law.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">5. Contact Us</h2>
              <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at support@oneclicksathi.com.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
