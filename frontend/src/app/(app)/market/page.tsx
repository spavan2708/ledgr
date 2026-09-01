import { MarketIntelligence } from "@/components/market/MarketIntelligence";
import { StockAnalyzer } from "@/components/market/StockAnalyzer";
import { MarketOverview } from "@/components/market/MarketOverview";
import { PageHeader } from "@/components/ui";

export default function MarketPage() {
  return <div className="mx-auto w-full max-w-6xl py-3"><PageHeader title="Market Intelligence" description="Current Indian broad-market context followed by optional research on an individual global equity." /><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-300">Broad Market · India</p><h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Overall Market Analysis</h2></div><MarketOverview /><MarketIntelligence /><div className="mb-5 mt-12"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Global equities</p><h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Individual Stock Research</h2><p className="mt-2 text-sm text-slate-500">Select one listed company for separate technical, fundamental, and risk analysis.</p></div><StockAnalyzer /></div>;
}
