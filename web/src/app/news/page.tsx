import DashboardLayout from "@/components/layout/DashboardLayout";
import NewsFeedShell from "@/components/news/NewsFeedShell";

export const metadata = {
  title: "Smart Feed | OneClickSathi",
  description: "Personalized news and opportunity feed for your business",
};

export default function NewsPage() {
  return (
    <DashboardLayout>
      <NewsFeedShell />
    </DashboardLayout>
  );
}
