import { InvestmentChatbot } from "@/components/investment/InvestmentChatbot";

export const metadata = {
  title: "Investment Chat | FinSync",
  description: "Learn about investing and personal finance with the FinSync Investment Education Assistant.",
};

export default function InvestmentChatPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Investment Chat</h1>
        <p className="mt-2 text-slate-400">Ask questions and learn about investing, markets, and personal finance concepts.</p>
      </div>
      <InvestmentChatbot />
    </div>
  );
}
