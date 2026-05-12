import Header from "@/components/layout/Header";

export default function CookiesPolicy() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20 bg-background text-foreground">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 uppercase">Cookies Policy</h1>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Last updated: May 11, 2026. This policy explains how we use cookies on OneClickSathi.
            </p>
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
              <p className="mb-4">Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">2. How We Use Cookies</h2>
              <p className="mb-4">We use cookies for the following purposes:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., authentication).</li>
                <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our site.</li>
                <li><strong>Preference Cookies:</strong> Remember your settings like dark mode or language.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">3. Managing Cookies</h2>
              <p className="mb-4">You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
