import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        
        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
                Designed for Entrepreneurs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We&apos;ve simplified the process of finding government support for your business.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Filtering",
                  description: "Filter by state, ministry, and business type to find exactly what you need.",
                  icon: "🎯"
                },
                {
                  title: "Detailed Insights",
                  description: "View comprehensive details on eligibility, benefits, and application steps.",
                  icon: "📊"
                },
                {
                  title: "Business Ready",
                  description: "Specialized section for new businesses to find startup capital and training.",
                  icon: "🚀"
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2026 SchemePortal. Empowering the next generation of business leaders.</p>
        </div>
      </footer>
    </>
  );
}
