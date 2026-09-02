import { InvestmentChatbot } from "@/components/investment/InvestmentChatbot";
import { PageHeader } from "@/components/ui";

export default function AssistantPage() {
  return (
    <>
      <PageHeader title="ledgr assistant" description="Ask questions and learn about investing, markets, and personal finance concepts." />
      <InvestmentChatbot />
    </>
  );
}
