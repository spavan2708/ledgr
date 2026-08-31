const fs = require('fs');

function patch(file, replacer) {
  const p = 'frontend/src/app/(app)/portfolio/add/' + file;
  let code = fs.readFileSync(p, 'utf-8');
  code = replacer(code);
  fs.writeFileSync(p, code);
}

// 1. Bond
patch('bond/page.tsx', code => {
  code = code.replace('import { useRouter } from "next/navigation";', 'import { useRouter, useSearchParams } from "next/navigation";\nimport { useEffect } from "react";');
  code = code.replace('const [name, setName] = useState("");', \const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setName(existing.name);
        setQuantity(existing.quantity.toString());
        setPurchasePrice(existing.purchase_price.toString());
        setFaceValue(existing.face_value.toString());
        if (existing.coupon_rate) setCouponRate(existing.coupon_rate.toString());
        if (existing.purchase_date) setPurchaseDate(existing.purchase_date.split("T")[0]);
        if (existing.maturity_date) setMaturityDate(existing.maturity_date.split("T")[0]);
        if (existing.current_price) setCurrentPrice(existing.current_price.toString());
      }
    }
  }, [editId, session?.holdings]);

  const [name, setName] = useState("");\);
  
  code = code.replace('const handleSave = (e: React.FormEvent) => {', \const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !purchasePrice || !faceValue) return;\);
  code = code.replace(/e\.preventDefault\(\);\s*if \(\!name \|\| \!quantity \|\| \!purchasePrice \|\| \!faceValue \|\| \!purchaseDate\) return;/, '');
  
  code = code.replace('id: crypto.randomUUID(),', 'id: editId || crypto.randomUUID(),');
  code = code.replace('setHoldings([...(session?.holdings || []), holding]);', 'setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);');
  code = code.replace('<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Add Bond / Debt</h1>', '<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{editId ? "Edit Bond" : "Add Bond / Debt"}</h1>');
  
  code = code.replace('disabled={!name || !quantity || !purchasePrice || !faceValue || !purchaseDate}', 'disabled={!name || !quantity || !purchasePrice || !faceValue}');
  return code;
});

// 2. Gold
patch('gold/page.tsx', code => {
  code = code.replace('import { useRouter } from "next/navigation";', 'import { useRouter, useSearchParams } from "next/navigation";\nimport { useEffect } from "react";');
  code = code.replace('const [type, setType] = useState<"physical" | "etf" | "sgb" | "other">("physical");', \const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setType(existing.gold_type);
        setName(existing.name);
        setQuantity(existing.quantity.toString());
        setUnit(existing.unit_name);
        setAvgPrice(existing.average_purchase_price.toString());
      }
    }
  }, [editId, session?.holdings]);

  const [type, setType] = useState<"physical" | "etf" | "sgb" | "other">("physical");\);
  
  code = code.replace('const handleSave = (e: React.FormEvent) => {', \const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !avgPrice) return;\);
  code = code.replace(/e\.preventDefault\(\);\s*if \(\!name \|\| \!quantity \|\| \!avgPrice \|\| \!purchaseDate\) return;/, '');
  
  code = code.replace('id: crypto.randomUUID(),', 'id: editId || crypto.randomUUID(),');
  code = code.replace('setHoldings([...(session?.holdings || []), holding]);', 'setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);');
  code = code.replace('<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Add Gold</h1>', '<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{editId ? "Edit Gold" : "Add Gold"}</h1>');
  
  code = code.replace('const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);', '');
  code = code.replace(/<div[^>]*>\s*<label[^>]*>Purchase Date<\/label>\s*<input[^>]*value={purchaseDate}[^>]*>\s*<\/div>/g, '');
  code = code.replace('disabled={!name || !quantity || !avgPrice || !purchaseDate}', 'disabled={!name || !quantity || !avgPrice}');
  
  return code;
});

// 3. FD
patch('fd/page.tsx', code => {
  code = code.replace('import { useRouter } from "next/navigation";', 'import { useRouter, useSearchParams } from "next/navigation";\nimport { useEffect } from "react";');
  code = code.replace('const [institution, setInstitution] = useState("");', \const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setInstitution(existing.institution);
        setPrincipal(existing.principal.toString());
        setRate(existing.interest_rate.toString());
        if (existing.start_date) setStartDate(existing.start_date.split("T")[0]);
        if (existing.maturity_date) setMaturityDate(existing.maturity_date.split("T")[0]);
        if (existing.accrued_interest) setAccruedInterest(existing.accrued_interest.toString());
        setCompounding(existing.compounding_frequency);
      }
    }
  }, [editId, session?.holdings]);

  const [institution, setInstitution] = useState("");\);
  
  code = code.replace('const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);', 'const [startDate, setStartDate] = useState("");');
  code = code.replace('const handleSave = (e: React.FormEvent) => {', \const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !principal || !rate || !startDate || !maturityDate) return;\);
  code = code.replace(/e\.preventDefault\(\);\s*if \(\!institution \|\| \!principal \|\| \!rate \|\| \!startDate \|\| \!maturityDate\) return;/, '');
  
  code = code.replace('id: crypto.randomUUID(),', 'id: editId || crypto.randomUUID(),');
  code = code.replace('setHoldings([...(session?.holdings || []), holding]);', 'setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);');
  code = code.replace('<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Add Fixed Deposit</h1>', '<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{editId ? "Edit Fixed Deposit" : "Add Fixed Deposit"}</h1>');
  
  return code;
});

// 4. Mutual Fund
patch('mf/page.tsx', code => {
  code = code.replace('import { useRouter } from "next/navigation";', 'import { useRouter, useSearchParams } from "next/navigation";\nimport { useEffect } from "react";');
  code = code.replace('const [query, setQuery] = useState("");', \const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setSelectedFund({ schemeName: existing.name, amc: existing.amc, schemeCode: existing.scheme });
        setUnits(existing.units.toString());
        setAvgNav(existing.average_purchase_nav.toString());
        if (existing.folio) setFolio(existing.folio);
        if (existing.purchase_date) setPurchaseDate(existing.purchase_date.split("T")[0]);
      }
    }
  }, [editId, session?.holdings]);

  const [query, setQuery] = useState("");\);
  
  code = code.replace('id: crypto.randomUUID(),', 'id: editId || crypto.randomUUID(),');
  code = code.replace('setHoldings([...(session?.holdings || []), holding]);', 'setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);');
  code = code.replace('<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Add Mutual Fund</h1>', '<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{editId ? "Edit Mutual Fund" : "Add Mutual Fund"}</h1>');
  return code;
});

// 5. Stock
patch('stock/page.tsx', code => {
  code = code.replace('import { useRouter } from "next/navigation";', 'import { useRouter, useSearchParams } from "next/navigation";\nimport { useEffect } from "react";');
  code = code.replace('const [query, setQuery] = useState("");', \const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setSelectedStock({ name: existing.name, ticker: existing.ticker, exchange: existing.exchange });
        setQuantity(existing.quantity.toString());
        setAvgPrice(existing.average_purchase_price.toString());
      }
    }
  }, [editId, session?.holdings]);

  const [query, setQuery] = useState("");\);
  
  code = code.replace('id: crypto.randomUUID(),', 'id: editId || crypto.randomUUID(),');
  code = code.replace('setHoldings([...(session?.holdings || []), holding]);', 'setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);');
  code = code.replace('<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Add Stock</h1>', '<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{editId ? "Edit Stock" : "Add Stock"}</h1>');
  return code;
});

// 6. Cash
patch('cash/page.tsx', code => {
  code = code.replace('import { useRouter } from "next/navigation";', 'import { useRouter, useSearchParams } from "next/navigation";\nimport { useEffect } from "react";');
  code = code.replace('const [name, setName] = useState("");', \const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setName(existing.name);
        setInstitution(existing.institution || "");
        setBalance(existing.balance.toString());
      }
    }
  }, [editId, session?.holdings]);

  const [name, setName] = useState("");\);
  
  code = code.replace('id: crypto.randomUUID(),', 'id: editId || crypto.randomUUID(),');
  code = code.replace('transactions: [', 'transactions: editId ? (session?.holdings.find(h => h.id === editId) as any)?.transactions || [] : [');
  code = code.replace('setHoldings([...(session?.holdings || []), holding]);', 'setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);');
  code = code.replace('<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Add Cash / Bank</h1>', '<h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{editId ? "Edit Cash / Bank" : "Add Cash / Bank"}</h1>');
  return code;
});

console.log('done');
