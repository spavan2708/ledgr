import type { FinancialProfile } from "@/types/financial-profile";
import type { FinancialCalculations, EmergencyFundAnalysis, DebtAnalysis } from "@/types/financial-plan";
import type { GoalSimulationResponse } from "@/types/goals";
import type { FinancialRiskFactorResult } from "./financialRiskFactor";

export interface AssetAllocationEntry {
  assetClass: "cash" | "fd" | "bonds" | "mutual_funds" | "stocks";
  targetPercentage: number;
  currentPercentage: number;
  newMoneyAmount: number;
  status: "Underweight" | "Overweight" | "Near Target" | "N/A";
}

export interface AssetAllocationResult {
  riskFactor: number;
  riskCategory: string;
  monthlySurplus: number;
  emergencyContribution: number;
  investableMonthlyCapacity: number;
  targetAllocation: Record<string, number>;
  currentAllocation: Record<string, number>;
  newMoneyAllocation: Record<string, number>;
  allocationStatus: "available" | "unavailable";
  constraints: string[];
  rationale: string[];
  entries: AssetAllocationEntry[];
  portfolioHealth: {
    totalValue: number;
    diversificationStatus: string;
    largestExposure: { name: string; percentage: number };
    overweight: string[];
    underweight: string[];
  };
  rebalanceGuidance: string[];
}

const BASE_ALLOCATION_TABLE: Record<number, Record<string, number>> = {
  1: { cash: 15, fd: 35, bonds: 35, mutual_funds: 15, stocks:  0 },
  2: { cash: 10, fd: 30, bonds: 35, mutual_funds: 20, stocks:  5 },
  3: { cash: 10, fd: 25, bonds: 30, mutual_funds: 25, stocks: 10 },
  4: { cash:  5, fd: 20, bonds: 25, mutual_funds: 35, stocks: 15 },
  5: { cash:  5, fd: 15, bonds: 20, mutual_funds: 40, stocks: 20 },
  6: { cash:  5, fd: 10, bonds: 15, mutual_funds: 45, stocks: 25 },
  7: { cash:  5, fd:  5, bonds: 15, mutual_funds: 45, stocks: 30 },
  8: { cash:  5, fd:  5, bonds: 10, mutual_funds: 45, stocks: 35 },
  9: { cash:  5, fd:  5, bonds:  5, mutual_funds: 45, stocks: 40 },
  10:{ cash:  5, fd:  0, bonds:  5, mutual_funds: 40, stocks: 50 },
};

export function calculateAssetAllocation(
  profile: FinancialProfile,
  calc: FinancialCalculations,
  emergency: EmergencyFundAnalysis,
  debt: DebtAnalysis,
  goals: GoalSimulationResponse | null,
  risk: FinancialRiskFactorResult
): AssetAllocationResult {
  
  const rationale: string[] = [];
  const constraints: string[] = [];
  let allocationStatus: "available" | "unavailable" = "available";
  let investableCapacity = 0;
  let emergencyContribution = 0;

  // 1. CASH FLOW & EMERGENCY FUND
  if (calc.monthlySurplus <= 0) {
    allocationStatus = "unavailable";
    constraints.push("Zero or negative monthly surplus.");
    rationale.push("Investment capacity unavailable. Focus on expense stabilization and debt reduction.");
  } else {
    if (!emergency.isSufficient) {
      emergencyContribution = emergency.recommendedMonthlyContribution;
      investableCapacity = Math.max(0, calc.monthlySurplus - emergencyContribution);
      rationale.push(`Emergency fund is below target, so ₹${Math.round(emergencyContribution).toLocaleString('en-IN')}/month is reserved before investing.`);
    } else {
      investableCapacity = calc.monthlySurplus;
      rationale.push("Emergency fund is healthy, allowing full surplus to be invested.");
    }
  }

  // 2. RISK-BASED BASE ALLOCATION (DETERMINISTIC ENGINE)
  // Neutral Baseline prioritizing 5 major categories
  let target: Record<string, number> = {
    cash: 10,
    fd: 15,
    bonds: 15,
    mutual_funds: 25,
    stocks: 32,
    other: 3
  };
  
  // 5. EXISTING PORTFOLIO (Gathered early for adjustments)
  const a = profile.assets;
  const currentValues = {
    cash: Number(a.cash_bank || 0),
    fd: Number(a.fd || 0),
    bonds: Number(a.bonds_debt || 0),
    mutual_funds: Number(a.mutual_funds || 0),
    stocks: Number(a.stocks_equity || 0),
    other: Number(a.other_assets || 0)
  };
  const investableTotal = Object.values(currentValues).reduce((sum, val) => sum + val, 0);

  // A. Risk Tolerance & Horizon (What the user wants)
  const rf = risk.riskFactor; // 1-10
  const riskShift = (rf - 5.5) * 4; // Max +-18
  if (riskShift > 0) {
    const shift = Math.abs(riskShift);
    target.bonds -= shift * 0.4;
    target.fd -= shift * 0.4;
    target.cash -= shift * 0.2;
    target.stocks += shift * 0.6;
    target.mutual_funds += shift * 0.4;
  } else if (riskShift < 0) {
    const shift = Math.abs(riskShift);
    target.stocks -= shift * 0.6;
    target.mutual_funds -= shift * 0.4;
    target.bonds += shift * 0.4;
    target.fd += shift * 0.4;
    target.cash += shift * 0.2;
  }
  
  const horizon = profile.risk.investment_horizon;
  if (horizon === "2-5 years") {
    target.stocks -= 15;
    target.mutual_funds -= 10;
    target.fd += 15;
    target.bonds += 10;
  } else if (horizon === "10+ years") {
    target.fd -= 5;
    target.bonds -= 5;
    target.stocks += 5;
    target.mutual_funds += 5;
  }

  // B. Capacity Constraints (What the user can safely do - Overrides Tolerance)
  const stability = profile.risk.income_stability;
  let capacityConstraintApplied = false;

  if (stability <= 2) {
    target.stocks -= 10;
    target.cash += 10;
    capacityConstraintApplied = true;
    rationale.push("Stocks allocation reduced because income stability is low, requiring a larger cash buffer.");
  }
  
  if (!emergency.isSufficient) {
    // Heavily penalize equities if emergency fund is insufficient
    target.stocks -= 15;
    target.mutual_funds -= 10;
    target.cash += 15;
    target.fd += 10;
    capacityConstraintApplied = true;
    rationale.push("Cash and Fixed Deposits increased because the emergency fund is inadequate, overriding long-term growth targets.");
  }

  if (debt.debtPaymentRatio > 40) {
    target.stocks -= 10;
    target.mutual_funds -= 10;
    target.bonds += 10;
    target.fd += 10;
    capacityConstraintApplied = true;
    constraints.push("High Debt-to-Income ratio (>40%).");
    rationale.push("Growth allocation reduced because the user has significant monthly debt, shifting priority to stable fixed income.");
  } else if (debt.debtPaymentRatio > 20) {
    target.stocks -= 5;
    target.bonds += 5;
  }

  if (calc.monthlySurplus < 10000 && calc.monthlySurplus > 0) {
     target.stocks -= 5;
     target.fd += 5;
     capacityConstraintApplied = true;
     rationale.push("Limited monthly surplus restricts high exposure to market volatility.");
  }

  if (!capacityConstraintApplied) {
     rationale.push("Strong financial capacity (adequate emergency fund, manageable debt, stable income) allows the allocation engine to fully honor your risk tolerance.");
  }

  // C. Goal-Aware Constraints
  if (goals && investableCapacity > 0) {
    let shortTermAssigned = 0;
    for (const g of goals.goals) {
      if (g.horizon_months <= 36) {
        shortTermAssigned += g.assigned_monthly_capacity;
      }
    }
    if (shortTermAssigned > 0) {
      const shortTermRatio = shortTermAssigned / investableCapacity;
      const safePct = (target.cash + target.fd + target.bonds) / 100;
      if (safePct < shortTermRatio) {
        const shiftPct = Math.round((shortTermRatio - safePct) * 100);
        target.stocks -= shiftPct * 0.5;
        target.mutual_funds -= shiftPct * 0.5;
        target.fd += shiftPct * 0.5;
        target.bonds += shiftPct * 0.5;
        rationale.push(`Short-term goals required a ${shiftPct}% shift from Equities to Fixed Deposits/Bonds to ensure safe funding.`);
      }
    }
  }

  // C2. Lifecycle & Liquidity Defensive Override (Combined Factor Override)
  const age = profile.personal.age;
  const isHighLiquidity = profile.risk.liquidity_requirement?.toLowerCase() === "high";
  const hasRetirementOrNearTerm = goals?.goals.some(g => g.category.toLowerCase().includes("retirement") || g.horizon_months <= 60);

  let defensivePressure = 0;
  
  // 1. Age Factor
  if (age >= 60) defensivePressure += 3;
  else if (age >= 55) defensivePressure += 2;
  else if (age >= 45) defensivePressure += 1;

  // 2. Horizon Factor
  if (horizon === "Less than 2 years") defensivePressure += 3;
  else if (horizon === "2-5 years") defensivePressure += 2;
  else if (horizon === "5-10 years") defensivePressure += 1;

  // 3. Liquidity & Goals & Emergency
  if (isHighLiquidity) defensivePressure += 2;
  if (hasRetirementOrNearTerm) defensivePressure += 2;
  if (!emergency.isSufficient) defensivePressure += 1;

  // Current ratios
  let currentGrowth = target.stocks + target.mutual_funds;
  let currentDefensive = target.cash + target.fd + target.bonds;

  // Apply override based on combined pressure
  let shiftToDefensive = 0;

  if (defensivePressure >= 7) {
    // STRONGLY DEFENSIVE OVERRIDE (e.g. Test 4: Age 60 + 5yr horizon + High Liq + Retirement = 3 + 1 + 2 + 2 = 8)
    // Enforce Defensive >= 60%, Growth <= 40% (approx)
    if (currentGrowth > 40) {
      shiftToDefensive = currentGrowth - 40;
    } else {
      shiftToDefensive = defensivePressure * 1.5; // modest push if already defensive
    }
  } else if (defensivePressure >= 5) {
    // MODERATE DEFENSIVE OVERRIDE
    // Enforce Defensive > Growth (Defensive >= 55%)
    if (currentGrowth > 45) {
      shiftToDefensive = currentGrowth - 45;
    } else {
      shiftToDefensive = defensivePressure * 1.5;
    }
  } else if (defensivePressure > 0) {
    // MILD PENALTY
    shiftToDefensive = defensivePressure * 1.5;
  }

  // Ensure we don't shift more than we have
  shiftToDefensive = Math.min(shiftToDefensive, currentGrowth);

  if (shiftToDefensive > 0) {
    target.stocks -= shiftToDefensive * 0.6;
    target.mutual_funds -= shiftToDefensive * 0.4;
    
    target.cash += shiftToDefensive * 0.3;
    target.fd += shiftToDefensive * 0.4;
    target.bonds += shiftToDefensive * 0.3;

    if (defensivePressure >= 7) {
      rationale.push("Age, investment horizon, and liquidity requirements triggered a STRONG lifecycle defensive override. Growth exposure was heavily reduced despite risk tolerance to ensure capital preservation.");
    } else if (defensivePressure >= 5) {
      rationale.push("Combined lifecycle factors (horizon, liquidity, goals) triggered a moderate defensive override, prioritizing stability over aggressive growth.");
    } else {
      rationale.push(`Lifecycle factors triggered a minor defensive adjustment (${shiftToDefensive.toFixed(1)}%) to safe assets.`);
    }
  }

  // D. Other Assets Adjustments
  if (investableTotal > 0) {
    const currentOtherPct = (currentValues.other / investableTotal) * 100;
    if (currentOtherPct > 30) {
      target.other = 10;
      target.mutual_funds -= 4;
      target.stocks -= 3;
      rationale.push(`Other Assets target capped at 10% despite heavy existing exposure. The engine prioritizes the 5 major financial categories.`);
    } else if (currentOtherPct > 10) {
      target.other = 7;
      target.mutual_funds -= 4;
    } else if (currentOtherPct > 0) {
      target.other = 5;
      target.mutual_funds -= 2;
    } else {
      target.other = 2; // Floor default
      target.cash += 1;
      target.bonds -= 1;
    }
  } else {
    target.other = 3;
  }

  // 6. SAFETY BOUNDS & NORMALIZATION
  // Enforce absolute minimum bounds (No negative percentages)
  target.cash = Math.max(2, target.cash);
  target.fd = Math.max(0, target.fd);
  target.bonds = Math.max(0, target.bonds);
  target.mutual_funds = Math.max(0, target.mutual_funds);
  target.stocks = Math.max(0, target.stocks);
  target.other = Math.max(2, Math.min(10, target.other));

  // Normalize and Round (Helper logic)
  const normalizeAndRound = (t: Record<string, number>) => {
    let total = Object.values(t).reduce((acc, val) => acc + val, 0);
    if (total === 0) return;
    
    // Normalize to exact percentages
    for (const k of Object.keys(t)) {
      t[k] = (t[k] / total) * 100;
    }
    
    // Round to integers
    let roundedTotal = 0;
    for (const k of Object.keys(t)) {
      t[k] = Math.round(t[k]);
      roundedTotal += t[k];
    }
    
    // Fix integer drift
    if (roundedTotal !== 100) {
      const diff = 100 - roundedTotal;
      if (t.cash + diff >= 2) {
        t.cash += diff;
      } else {
        t.fd += diff;
      }
    }
  };

  normalizeAndRound(target);

  // Final Validation and Redistribution for Other Assets
  if (target.other < 2) {
    const diff = 2 - target.other;
    target.other = 2;
    const majorTotal = target.cash + target.fd + target.bonds + target.mutual_funds + target.stocks;
    if (majorTotal > 0) {
      target.cash -= diff * (target.cash / majorTotal);
      target.fd -= diff * (target.fd / majorTotal);
      target.bonds -= diff * (target.bonds / majorTotal);
      target.mutual_funds -= diff * (target.mutual_funds / majorTotal);
      target.stocks -= diff * (target.stocks / majorTotal);
    }
    normalizeAndRound(target); // Re-round safely
  } else if (target.other > 10) {
    const diff = target.other - 10;
    target.other = 10;
    const majorTotal = target.cash + target.fd + target.bonds + target.mutual_funds + target.stocks;
    if (majorTotal > 0) {
      target.cash += diff * (target.cash / majorTotal);
      target.fd += diff * (target.fd / majorTotal);
      target.bonds += diff * (target.bonds / majorTotal);
      target.mutual_funds += diff * (target.mutual_funds / majorTotal);
      target.stocks += diff * (target.stocks / majorTotal);
    }
    normalizeAndRound(target);
  }

  // Final hard assertion guarantee
  target.cash = Math.max(0, target.cash);
  target.fd = Math.max(0, target.fd);
  target.bonds = Math.max(0, target.bonds);
  target.mutual_funds = Math.max(0, target.mutual_funds);
  target.stocks = Math.max(0, target.stocks);
  target.other = Math.max(2, Math.min(10, target.other));

  const finalSum = Object.values(target).reduce((acc, val) => acc + val, 0);
  if (finalSum !== 100) {
    target.cash += (100 - finalSum);
  }

  // 7. CURRENT PORTFOLIO ALLOCATION PERCENTAGES
  const currentAllocation: Record<string, number> = {};
  for (const k of Object.keys(currentValues)) {
    currentAllocation[k] = investableTotal > 0 ? (currentValues[k as keyof typeof currentValues] / investableTotal) * 100 : 0;
  }

  // 6. NEW MONEY ALLOCATION
  // We want to direct new money to underweight assets to bring the overall portfolio closer to target.
  const newMoney: Record<string, number> = { cash: 0, fd: 0, bonds: 0, mutual_funds: 0, stocks: 0, other: 0 };
  
  if (allocationStatus === "available" && investableCapacity > 0) {
    if (investableTotal === 0) {
      // Clean slate - new money matches target precisely
      let remaining = investableCapacity;
      const keys = Object.keys(target);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (i === keys.length - 1) {
          newMoney[k] = remaining;
        } else {
          const amt = Math.round((investableCapacity * target[k]) / 100);
          newMoney[k] = amt;
          remaining -= amt;
        }
      }
    } else {
      // Existing portfolio - direct money to largest deficits first
      let remaining = investableCapacity;
      
      // Calculate deficits based on percentages
      const deficits: { key: string, deficit: number }[] = [];
      
      for (const k of Object.keys(target)) {
        const targetPct = target[k];
        const currentPct = currentAllocation[k] || 0;
        // Only allocate to asset classes that are UNDER their target percentage
        // A class exactly at target or overweight gets 0 new money.
        const deficit = Math.max(0, targetPct - currentPct);
        deficits.push({ key: k, deficit });
      }
      
      const totalDeficit = deficits.reduce((sum, d) => sum + d.deficit, 0);
      
      if (totalDeficit > 0) {
        rationale.push("Your existing portfolio differs from the target. New contributions are directed ONLY to underweight asset classes to balance it over time. Asset classes at or above target receive ₹0 new money until rebalanced.");
        
        // Allocate proportionally to deficits
        for (let i = 0; i < deficits.length; i++) {
          const d = deficits[i];
          if (i === deficits.length - 1) {
            newMoney[d.key] += remaining;
          } else {
            const share = Math.round((d.deficit / totalDeficit) * investableCapacity);
            const actual = Math.min(share, remaining);
            newMoney[d.key] += actual;
            remaining -= actual;
          }
        }
      } else {
        // Fallback: allocate exactly to target
        for (const k of Object.keys(target)) {
          newMoney[k] = Math.round((investableCapacity * target[k]) / 100);
        }
      }
    }
  }

  // Double check sum is exactly investableCapacity
  let totalNewMoney = Object.values(newMoney).reduce((a, b) => a + b, 0);
  if (allocationStatus === "available" && totalNewMoney !== investableCapacity) {
    const diff = investableCapacity - totalNewMoney;
    let maxKey = "cash";
    let maxVal = -1;
    for (const k of Object.keys(newMoney)) {
      if (newMoney[k] > maxVal) {
        maxVal = newMoney[k];
        maxKey = k;
      }
    }
    newMoney[maxKey] += diff; // Assign residual to the largest new allocation
  }

  // 7. BUILD ENTRIES
  const entries: AssetAllocationEntry[] = [];
  const TOLERANCE = 5;
  const overweightNames: string[] = [];
  const underweightNames: string[] = [];
  
  let maxExposureName = "";
  let maxExposurePct = -1;

  for (const k of Object.keys(target)) {
    let status: AssetAllocationEntry["status"] = "N/A";
    const name = k === "cash" ? "Cash/Bank" : k === "fd" ? "Fixed Deposits" : k === "mutual_funds" ? "Mutual Funds" : k === "stocks" ? "Stocks/Equity" : "Bonds/Debt";
    
    if (investableTotal > 0) {
      const diff = currentAllocation[k] - target[k];
      if (diff > TOLERANCE) {
        status = "Overweight";
        overweightNames.push(name);
      } else if (diff < -TOLERANCE) {
        status = "Underweight";
        underweightNames.push(name);
      } else {
        status = "Near Target";
      }
      
      if (currentAllocation[k] > maxExposurePct) {
        maxExposurePct = currentAllocation[k];
        maxExposureName = name;
      }
    }

    entries.push({
      assetClass: k as any,
      targetPercentage: target[k],
      currentPercentage: currentAllocation[k],
      newMoneyAmount: newMoney[k],
      status
    });
  }

  // 8. PORTFOLIO HEALTH & REBALANCING
  let divStatus = "Good";
  if (maxExposurePct > 60 && maxExposureName !== "Fixed Deposits" && maxExposureName !== "Cash/Bank") {
    divStatus = "Concentrated";
  } else if (investableTotal === 0) {
    divStatus = "N/A";
  }

  const portfolioHealth = {
    totalValue: investableTotal,
    diversificationStatus: divStatus,
    largestExposure: { name: maxExposureName || "None", percentage: Math.max(0, maxExposurePct) },
    overweight: overweightNames,
    underweight: underweightNames
  };

  const rebalanceGuidance: string[] = [];
  if (investableTotal === 0) {
    rebalanceGuidance.push("Your portfolio has no existing investment allocation. The target shown is a suggested allocation for future contributions.");
  } else {
    if (overweightNames.length > 0) {
      rebalanceGuidance.push("Stop adding new money to overweight categories.");
    }
    if (underweightNames.length > 0) {
      rebalanceGuidance.push("Direct future contributions toward underweight categories.");
    }
    rebalanceGuidance.push("Review the portfolio periodically.");
    rebalanceGuidance.push("Avoid unnecessary selling solely to correct small allocation differences.");
  }

  return {
    riskFactor: rf,
    riskCategory: risk.category,
    monthlySurplus: calc.monthlySurplus,
    emergencyContribution,
    investableMonthlyCapacity: investableCapacity,
    targetAllocation: target,
    currentAllocation,
    newMoneyAllocation: newMoney,
    allocationStatus,
    constraints,
    rationale,
    entries,
    portfolioHealth,
    rebalanceGuidance
  };
}
