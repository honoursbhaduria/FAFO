import Header from "@/components/layout/Header";

export default function TermsOfService() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20 bg-background text-foreground">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 uppercase">Terms of Service</h1>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Last updated: May 11, 2026. Please read these terms carefully before using OneClickSathi.
            </p>
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">By accessing or using OneClickSathi, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
              <p className="mb-4">Permission is granted to temporarily access the materials on OneClickSathi for personal, non-commercial transitory viewing only.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">3. AI Consulting Disclaimer</h2>
              <p className="mb-4">Our AI-powered consulting tools provide general guidance based on available data. They do not constitute professional legal, financial, or tax advice. Always consult with a qualified professional for specific business decisions.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
              <p className="mb-4">In no event shall OneClickSathi or its suppliers be liable for any damages arising out of the use or inability to use the materials on our platform.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">5. Governing Law</h2>
              <p className="mb-4">These terms and conditions are governed by and construed in accordance with the laws of India.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
