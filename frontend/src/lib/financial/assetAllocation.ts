import type { FinancialProfile } from "@/types/financial-profile";
import type { FinancialCalculations, EmergencyFundAnalysis, DebtAnalysis } from "@/types/financial-plan";
import type { GoalSimulationResponse } from "@/types/goals";
import type { FinancialRiskFactorResult } from "./financialRiskFactor";

export interface AssetAllocationEntry {
  assetClass: "cash" | "fd" | "bonds" | "mutual_funds" | "stocks" | "gold";
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
  1: { cash: 15, fd: 35, bonds: 35, mutual_funds: 10, stocks:  0, gold: 5 },
  2: { cash: 10, fd: 30, bonds: 35, mutual_funds: 15, stocks:  5, gold: 5 },
  3: { cash: 10, fd: 25, bonds: 30, mutual_funds: 20, stocks: 10, gold: 5 },
  4: { cash:  5, fd: 20, bonds: 25, mutual_funds: 30, stocks: 15, gold: 5 },
  5: { cash:  5, fd: 15, bonds: 20, mutual_funds: 35, stocks: 20, gold: 5 },
  6: { cash:  5, fd: 10, bonds: 15, mutual_funds: 40, stocks: 25, gold: 5 },
  7: { cash:  5, fd:  5, bonds: 15, mutual_funds: 40, stocks: 30, gold: 5 },
  8: { cash:  5, fd:  5, bonds: 10, mutual_funds: 40, stocks: 35, gold: 5 },
  9: { cash:  5, fd:  5, bonds:  5, mutual_funds: 40, stocks: 40, gold: 5 },
  10:{ cash:  5, fd:  0, bonds:  5, mutual_funds: 35, stocks: 50, gold: 5 },
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

  // 2. RISK-BASED BASE ALLOCATION
  const rf = risk.riskFactor;
  let target = { ...BASE_ALLOCATION_TABLE[rf] };
  rationale.push(`Risk Factor ${rf}/10 dictates the baseline ${risk.category} asset distribution.`);

  // 3. DEBT CONSTRAINT
  if (debt.debtPaymentRatio > 40) {
    constraints.push("High Debt-to-Income ratio (>40%).");
    // Shift 10% from volatile (stocks/MF) to safe (bonds/FD)
    const shift = 10;
    if (target.stocks >= shift) {
      target.stocks -= shift;
      target.bonds += shift;
    } else if (target.mutual_funds >= shift) {
      target.mutual_funds -= shift;
      target.bonds += shift;
    }
    rationale.push("Your debt burden is high. The allocation has been adjusted to be more defensive.");
  }

  // 4. GOAL-AWARE ALLOCATION
  if (goals && investableCapacity > 0) {
    // Check how much capacity is tied to short term goals (< 36 months)
    let shortTermAssigned = 0;
    for (const g of goals.goals) {
      if (g.horizon_months <= 36) {
        shortTermAssigned += g.assigned_monthly_capacity;
      }
    }
    
    if (shortTermAssigned > 0) {
      const shortTermRatio = shortTermAssigned / investableCapacity;
      rationale.push(`Short-term goals (<3 years) require ${Math.round(shortTermRatio * 100)}% of your capacity. This portion favors defensive assets.`);
      
      // Ensure at least `shortTermRatio` is in Cash/FD/Bonds
      const safePct = (target.cash + target.fd + target.bonds) / 100;
      if (safePct < shortTermRatio) {
        // We need to shift (shortTermRatio - safePct) from Equities to FD/Bonds
        const shiftPct = Math.round((shortTermRatio - safePct) * 100);
        let remainingShift = shiftPct;
        
        if (target.stocks > 0) {
          const deduct = Math.min(target.stocks, remainingShift);
          target.stocks -= deduct;
          target.fd += deduct;
          remainingShift -= deduct;
        }
        if (remainingShift > 0 && target.mutual_funds > 0) {
          const deduct = Math.min(target.mutual_funds, remainingShift);
          target.mutual_funds -= deduct;
          target.bonds += deduct;
        }
      }
    } else {
      const longTermAssigned = goals.goals.filter(g => g.horizon_months > 60).reduce((sum, g) => sum + g.assigned_monthly_capacity, 0);
      if (longTermAssigned > 0) {
        rationale.push("Long-term goals permit greater growth exposure without constraint.");
      }
    }
  }

  // Ensure exact 100% (normalize if any rounding issues occurred)
  let totalTarget = Object.values(target).reduce((a, b) => a + b, 0);
  if (totalTarget !== 100) {
    target.cash += (100 - totalTarget); // dump rounding diff into cash
  }

  // 5. CURRENT PORTFOLIO
  const a = profile.assets;
  const currentValues = {
    cash: Number(a.cash_bank || 0),
    fd: Number(a.fd || 0),
    bonds: Number(a.bonds_debt || 0),
    mutual_funds: Number(a.mutual_funds || 0),
    stocks: Number(a.stocks_equity || 0),
    gold: Number(a.gold || 0)
  };
  
  const investableTotal = Object.values(currentValues).reduce((sum, val) => sum + val, 0);
  const currentAllocation: Record<string, number> = {};
  for (const k of Object.keys(currentValues)) {
    currentAllocation[k] = investableTotal > 0 ? (currentValues[k as keyof typeof currentValues] / investableTotal) * 100 : 0;
  }

  // 6. NEW MONEY ALLOCATION
  // We want to direct new money to underweight assets to bring the overall portfolio closer to target.
  const newMoney: Record<string, number> = { cash: 0, fd: 0, bonds: 0, mutual_funds: 0, stocks: 0, gold: 0 };
  
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
    const name = k === "cash" ? "Cash/Bank" : k === "fd" ? "Fixed Deposits" : k === "mutual_funds" ? "Mutual Funds" : k === "stocks" ? "Stocks/Equity" : k === "bonds" ? "Bonds/Debt" : "Gold";
    
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
