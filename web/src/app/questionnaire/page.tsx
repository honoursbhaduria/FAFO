import QuestionnaireShell from "@/components/questionnaire/QuestionnaireShell";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Find Your Schemes | OneClickSathi",
  description: "Answer a few questions to discover government schemes tailored for your business.",
};

export default async function QuestionnairePage() {
  const auth = await getAuthUser();
  if (!auth?.userId) redirect("/login");
  if (auth.role === "CONSULTANT") redirect("/consultant/dashboard");

  return <QuestionnaireShell />;
}
