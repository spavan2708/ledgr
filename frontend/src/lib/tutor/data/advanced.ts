import type { TutorLevel } from "../types";

export const advancedLevel: TutorLevel = {
  id: "ADVANCED",
  title: "Advanced Finance",
  description: "Explore financial metrics, portfolio risk and advanced concepts.",
  sections: [
    {
      id: "SEC8",
      title: "SECTION 8 — FINANCIAL GOALS",
      description: "Learn how to define, measure, and track financial objectives.",
      lessons: [
        {
          id: "L8_1",
          title: "What is a Financial Goal?",
          learningObjective: "Understand how to set concrete financial objectives.",
          coreConcept: "A financial goal is a specific target for saving or investing money over a certain period of time to achieve a desired outcome.",
          simpleExplanation: "Think of a financial goal as a destination for your money. Just like you need a map to reach a physical place, setting a goal helps you figure out how much you need to save and how long it will take to get there.",
          realWorldExample: "Saving ₹5,00,000 for a down payment on a house in exactly 5 years is a clear financial goal, whereas 'saving for a house someday' is just a wish.",
          importantTakeaways: [
            "Goals give your money a purpose.",
            "They should be specific, measurable, and time-bound.",
            "Having clear goals prevents unnecessary spending."
          ],
          quiz: {
            id: "Q8_1",
            question: "Which of the following is an example of a well-defined financial goal?",
            options: [
              "I want to be rich.",
              "I want to save ₹2,00,000 for an emergency fund by December next year.",
              "I should invest more in the stock market.",
              "I need to buy a car eventually."
            ],
            correctAnswerIndex: 1,
            explanation: "A well-defined goal specifies the exact amount (₹2,00,000), the purpose (emergency fund), and the timeline (by December next year)."
          }
        },
        {
          id: "L8_2",
          title: "Goal Amount",
          learningObjective: "Learn how to accurately estimate the cost of a future goal.",
          coreConcept: "The goal amount is the total sum of money required to achieve a specific financial objective at its present value.",
          simpleExplanation: "This is simply the price tag of what you want to achieve, based on what it costs today. It forms the baseline before factoring in inflation.",
          realWorldExample: "If you want to buy a car that costs ₹10,00,000 today, your base goal amount is ₹10 Lakhs.",
          importantTakeaways: [
            "The base amount is calculated using today's prices.",
            "Accurate estimation is critical for proper planning.",
            "You must research the current cost thoroughly."
          ],
          quiz: {
            id: "Q8_2",
            question: "What does the base goal amount represent?",
            options: [
              "The future cost of an item.",
              "The amount you need to save every month.",
              "The current cost of the objective.",
              "The interest you will earn on your savings."
            ],
            correctAnswerIndex: 2,
            explanation: "The base goal amount represents the cost of the objective based on today's prices."
          }
        },
        {
          id: "L8_3",
          title: "Inflation-Adjusted Target",
          learningObjective: "Understand how inflation impacts the future cost of your goals.",
          coreConcept: "An inflation-adjusted target is the estimated future cost of a goal, factoring in the expected rate of inflation over the time horizon.",
          simpleExplanation: "Things get more expensive over time because of inflation. The inflation-adjusted target tells you how much money you will actually need in the future, not just what it costs today.",
          realWorldExample: "A college degree costing ₹10,00,000 today might cost ₹16,00,000 in 10 years assuming a 5% annual inflation rate. The ₹16 Lakhs is your inflation-adjusted target.",
          importantTakeaways: [
            "Always account for inflation for long-term goals.",
            "Education and healthcare often have higher inflation rates than general goods.",
            "Failing to adjust for inflation leads to a shortfall in funding."
          ],
          quiz: {
            id: "Q8_3",
            question: "Why must long-term financial goals be adjusted for inflation?",
            options: [
              "To lower the monthly contribution.",
              "Because the purchasing power of money decreases over time, making things more expensive.",
              "To increase the return on investment.",
              "Because taxes increase over time."
            ],
            correctAnswerIndex: 1,
            explanation: "Inflation reduces purchasing power, meaning items will cost more in the future than they do today."
          }
        },
        {
          id: "L8_4",
          title: "Time Horizon",
          learningObjective: "Evaluate the importance of time frames in achieving financial goals.",
          coreConcept: "The time horizon is the length of time over which an investment is made or held before it is liquidated to fund a goal.",
          simpleExplanation: "This is how many months or years you have until you need the money. A longer time allows your money to grow more through compounding.",
          realWorldExample: "If you are 30 and planning to retire at 60, your time horizon for retirement is 30 years.",
          importantTakeaways: [
            "Time horizon dictates your risk tolerance.",
            "Longer horizons allow for more aggressive investments like equity.",
            "Short-term goals require safe, liquid investments like Fixed Deposits."
          ],
          quiz: {
            id: "Q8_4",
            question: "How does a long time horizon affect investment strategy?",
            options: [
              "It forces you to invest only in savings accounts.",
              "It generally allows you to take on more risk for potentially higher returns.",
              "It means you don't need to save as much in total.",
              "It guarantees you will reach your goal."
            ],
            correctAnswerIndex: 1,
            explanation: "A longer time horizon allows investors to weather market volatility, making riskier assets like stocks more appropriate."
          }
        },
        {
          id: "L8_5",
          title: "Monthly Contribution",
          learningObjective: "Calculate the periodic savings required to reach a goal.",
          coreConcept: "The monthly contribution is the specific amount of money that must be saved or invested each month to reach the inflation-adjusted target by the end of the time horizon.",
          simpleExplanation: "This is breaking down your big goal into bite-sized monthly pieces. It tells you exactly how much to put away from your paycheck every month.",
          realWorldExample: "To reach ₹5,00,000 in 3 years with an expected return of 8%, you might need to invest roughly ₹12,300 every month via a SIP.",
          importantTakeaways: [
            "Consistency is key to reaching the target.",
            "Automating the monthly contribution ensures discipline.",
            "Higher expected returns reduce the required monthly contribution."
          ],
          quiz: {
            id: "Q8_5",
            question: "What is the best way to ensure you meet your required monthly contribution?",
            options: [
              "Save whatever is left over at the end of the month.",
              "Automate your investments to deduct the amount on payday.",
              "Invest only when the market is down.",
              "Keep the money in cash until the end of the year."
            ],
            correctAnswerIndex: 1,
            explanation: "Automating investments ensures you pay yourself first, maintaining the discipline needed to reach long-term goals."
          }
        },
        {
          id: "L8_6",
          title: "Goal Probability",
          learningObjective: "Understand the likelihood of achieving a financial target given various risks.",
          coreConcept: "Goal probability is the statistical likelihood that a specific financial goal will be met, usually calculated using Monte Carlo simulations considering market volatility.",
          simpleExplanation: "Since markets go up and down, you can't be 100% sure what your returns will be. Goal probability gives you a confidence score (like 85%) that you will actually hit your target.",
          realWorldExample: "A financial planner might run a simulation showing you have a 90% probability of having ₹2 Crores by retirement based on your current ₹30,000 monthly SIP.",
          importantTakeaways: [
            "No investment in the market comes with a 100% guarantee.",
            "A higher savings rate increases goal probability.",
            "Probabilities below 75% usually require adjusting the goal or saving more."
          ],
          quiz: {
            id: "Q8_6",
            question: "If a retirement plan has a 50% goal probability, what does that imply?",
            options: [
              "The plan is perfectly balanced.",
              "There is a very high risk of falling short of the required funds.",
              "The returns are guaranteed.",
              "Inflation has been eliminated."
            ],
            correctAnswerIndex: 1,
            explanation: "A 50% probability is quite low and implies a coin-toss chance of success; adjustments are needed to increase the likelihood of reaching the goal."
          }
        },
        {
          id: "L8_7",
          title: "Funding Gap",
          learningObjective: "Identify and address shortfalls in a financial plan.",
          coreConcept: "A funding gap is the difference between the projected future value of current savings and investments, and the required inflation-adjusted target amount.",
          simpleExplanation: "A funding gap is the money you are short of. If your goal needs ₹10 Lakhs but your current plan will only get you to ₹8 Lakhs, you have a ₹2 Lakh gap.",
          realWorldExample: "If your child's education will cost ₹25 Lakhs, but your current SIPs will only grow to ₹18 Lakhs in time, you face a funding gap of ₹7 Lakhs.",
          importantTakeaways: [
            "Identifying a gap early allows time for course correction.",
            "You can close a gap by saving more, retiring later, or taking more risk.",
            "Regularly reviewing goals helps spot gaps before it's too late."
          ],
          quiz: {
            id: "Q8_7",
            question: "Which of the following is NOT a viable way to close a funding gap?",
            options: [
              "Increasing your monthly contribution.",
              "Delaying the goal to give investments more time to grow.",
              "Ignoring inflation.",
              "Reallocating assets for a potentially higher return."
            ],
            correctAnswerIndex: 2,
            explanation: "Ignoring inflation doesn't change reality; the costs will still rise. The other options are practical steps to address a shortfall."
          }
        }
      ]
    },
    {
      id: "SEC9",
      title: "SECTION 9 — INTERMEDIATE FINANCE",
      description: "Deepen your understanding of returns, growth, and investment performance.",
      lessons: [
        {
          id: "L9_1",
          title: "CAGR",
          learningObjective: "Understand how to measure the annual growth rate of an investment.",
          coreConcept: "Compound Annual Growth Rate (CAGR) is the smoothed annualized rate of return of an investment over a specified period of time longer than one year.",
          simpleExplanation: "Investments don't grow at the same rate every year; some years are up, some are down. CAGR gives you a single, average percentage that shows how much it grew each year as if the growth was perfectly steady.",
          realWorldExample: "If you invested ₹1,00,000 and it grew to ₹1,50,000 in 3 years, the absolute return is 50%, but the CAGR is about 14.47% per year.",
          importantTakeaways: [
            "CAGR smooths out volatility to give a clearer picture of growth.",
            "It assumes that all profits are reinvested.",
            "It is the best metric to compare the performance of different investments."
          ],
          quiz: {
            id: "Q9_1",
            question: "Why is CAGR preferred over absolute return for multi-year investments?",
            options: [
              "It calculates the exact return for every single day.",
              "It accounts for the compounding effect over time and provides an annualized figure.",
              "It ignores any losses the investment might have had.",
              "It subtracts taxes from the return."
            ],
            correctAnswerIndex: 1,
            explanation: "Absolute return just looks at start and end values without accounting for how much time passed. CAGR annualizes the return, factoring in compounding."
          }
        },
        {
          id: "L9_2",
          title: "XIRR",
          learningObjective: "Calculate returns when there are multiple cash flows over time.",
          coreConcept: "Extended Internal Rate of Return (XIRR) is a metric used to calculate the annualized yield of an investment where cash flows (investments and withdrawals) occur at irregular intervals.",
          simpleExplanation: "While CAGR is for a single lump-sum investment, XIRR is what you use when you are putting money in or taking money out on different dates. It figures out your true annual return accounting for exactly when money moved.",
          realWorldExample: "If you invest ₹5,000 every month in a mutual fund and withdraw ₹20,000 randomly twice a year, XIRR is the only accurate way to calculate your actual return.",
          importantTakeaways: [
            "XIRR is essential for evaluating SIPs.",
            "It accounts for the timing of cash flows, which heavily impacts returns.",
            "You can easily calculate XIRR using spreadsheet software like Excel."
          ],
          quiz: {
            id: "Q9_2",
            question: "In which scenario should you use XIRR instead of CAGR?",
            options: [
              "When you make a one-time Fixed Deposit.",
              "When you want to know the return of a stock held for exactly one year.",
              "When you have made multiple mutual fund purchases on different dates.",
              "When you are calculating inflation."
            ],
            correctAnswerIndex: 2,
            explanation: "XIRR is designed specifically to calculate returns for a series of cash flows occurring at different times, unlike CAGR which is for a single lump sum."
          }
        },
        {
          id: "L9_3",
          title: "SIP",
          learningObjective: "Learn the mechanics and benefits of Systematic Investment Plans.",
          coreConcept: "A Systematic Investment Plan (SIP) is a facility offered by mutual funds allowing investors to invest a fixed amount of money at pre-defined intervals.",
          simpleExplanation: "A SIP is like a recurring deposit but for mutual funds. Instead of trying to guess when the stock market is cheap, you just buy a little bit every month automatically.",
          realWorldExample: "Setting up an auto-debit of ₹10,000 from your bank account on the 5th of every month into an Index Fund is a SIP.",
          importantTakeaways: [
            "SIPs enforce investing discipline.",
            "They utilize 'Rupee Cost Averaging' by buying more units when prices are low.",
            "They remove the emotional stress of timing the market."
          ],
          quiz: {
            id: "Q9_3",
            question: "What is a major psychological benefit of a SIP?",
            options: [
              "It guarantees a fixed interest rate.",
              "It allows you to time the market perfectly.",
              "It automates investing, removing the stress of deciding when to buy.",
              "It prevents the stock market from crashing."
            ],
            correctAnswerIndex: 2,
            explanation: "By automating the process, SIPs take human emotion out of investing, ensuring consistency regardless of market conditions."
          }
        },
        {
          id: "L9_4",
          title: "Nominal Returns",
          learningObjective: "Understand what standard investment returns actually represent.",
          coreConcept: "The nominal return is the percentage increase in the value of an investment over a given period, before factoring in taxes, investment fees, and inflation.",
          simpleExplanation: "Nominal return is the raw number you see on your account statement. It tells you how much money you made, but not necessarily how much your purchasing power grew.",
          realWorldExample: "If a Fixed Deposit offers 7% interest per year, 7% is the nominal return.",
          importantTakeaways: [
            "Nominal returns look attractive but don't tell the whole story.",
            "Always quoted in advertisements and bank brochures.",
            "It is the starting point for calculating real wealth growth."
          ],
          quiz: {
            id: "Q9_4",
            question: "A bank advertises an 8% return on a deposit. What type of return is this?",
            options: [
              "Real Return",
              "Nominal Return",
              "Risk-Adjusted Return",
              "Tax-Free Return"
            ],
            correctAnswerIndex: 1,
            explanation: "Advertised rates are almost always nominal returns, as they do not account for individual tax situations or prevailing inflation rates."
          }
        },
        {
          id: "L9_5",
          title: "Real Returns",
          learningObjective: "Calculate the true growth of purchasing power.",
          coreConcept: "The real return is the annual percentage of profit earned on an investment, adjusted for changes in prices due to inflation.",
          simpleExplanation: "Real return is what actually matters. It's the nominal return minus inflation. It tells you if you can actually buy more stuff with your money than you could before.",
          realWorldExample: "If your FD gives you a 7% nominal return, but inflation is 6%, your real return is roughly 1%. Your money barely grew in terms of what it can buy.",
          importantTakeaways: [
            "Real Return = Nominal Return - Inflation Rate (roughly).",
            "A negative real return means you are losing purchasing power.",
            "Equities generally offer the best long-term real returns."
          ],
          quiz: {
            id: "Q9_5",
            question: "If an investment returns 5% in a year where inflation is 7%, what is the approximate real return?",
            options: [
              "12%",
              "2%",
              "0%",
              "-2%"
            ],
            correctAnswerIndex: 3,
            explanation: "The real return is calculated by subtracting inflation from the nominal return (5% - 7% = -2%), meaning purchasing power decreased."
          }
        },
        {
          id: "L9_6",
          title: "Nominal vs Real Return",
          learningObjective: "Compare and contrast nominal and real returns in financial planning.",
          coreConcept: "While nominal return measures money growth, real return measures purchasing power growth; confusing the two is a common financial trap known as money illusion.",
          simpleExplanation: "Nominal return asks 'Did I get more money?' Real return asks 'Can I buy more things?' If your salary goes up 10% but rent and food go up 15%, you feel poorer despite having more money.",
          realWorldExample: "Earning 6% in a savings account feels good (Nominal), but if inflation is 7%, you are silently losing 1% of your wealth's buying power every year (Real).",
          importantTakeaways: [
            "Never plan retirement using nominal returns.",
            "Money illusion causes people to feel richer than they actually are.",
            "Taxes further reduce the real return of an investment."
          ],
          quiz: {
            id: "Q9_6",
            question: "What is 'money illusion'?",
            options: [
              "Believing that counterfeit money is real.",
              "Thinking of wealth in terms of nominal returns rather than real purchasing power.",
              "Assuming stock markets always go up.",
              "Hiding cash under a mattress."
            ],
            correctAnswerIndex: 1,
            explanation: "Money illusion occurs when people focus on the face value of money (nominal) rather than its actual purchasing power (real) after inflation."
          }
        },
        {
          id: "L9_7",
          title: "Portfolio Growth",
          learningObjective: "Understand how compounding drives portfolio expansion over decades.",
          coreConcept: "Portfolio growth is the increase in the total value of an investor's assets over time, driven by capital appreciation, reinvested dividends, and ongoing contributions.",
          simpleExplanation: "Your wealth grows in two ways: the new money you add, and the money your existing money makes. Over a long time, the money your money makes becomes way bigger than what you put in.",
          realWorldExample: "Over 20 years, a ₹10,000 monthly SIP (Total invested ₹24 Lakhs) growing at 12% will become ₹1 Crore. ₹76 Lakhs of that is pure portfolio growth from compounding.",
          importantTakeaways: [
            "Compounding works best over long periods (10+ years).",
            "Reinvesting dividends is crucial for maximum growth.",
            "In the later years, the portfolio grows faster than in the early years."
          ],
          quiz: {
            id: "Q9_7",
            question: "In the later years of a long-term investment, what contributes most to portfolio growth?",
            options: [
              "The monthly contributions.",
              "The initial lump sum invested.",
              "The compounding of past returns.",
              "Tax refunds."
            ],
            correctAnswerIndex: 2,
            explanation: "Over long periods, the returns generated on past returns (compounding) vastly outweigh new contributions to the portfolio."
          }
        }
      ]
    },
    {
      id: "SEC10",
      title: "SECTION 10 — ADVANCED FINANCE",
      description: "Master risk, optimization, and advanced portfolio concepts.",
      lessons: [
        {
          id: "L10_1",
          title: "Correlation",
          learningObjective: "Learn how different asset classes move in relation to one another.",
          coreConcept: "Correlation is a statistical measure expressing the extent to which two variables fluctuate together, ranging from -1.0 to 1.0.",
          simpleExplanation: "Correlation tells you if two investments act alike. If one goes up, does the other go up too? Or does it go down? You want investments that don't all crash at the exact same time.",
          realWorldExample: "Gold and Equities often have a low or negative correlation. When the Indian stock market crashes, gold prices frequently rise as investors seek safety.",
          importantTakeaways: [
            "A correlation of 1.0 means assets move exactly together.",
            "A correlation of -1.0 means assets move in exactly opposite directions.",
            "Holding assets with low correlation reduces overall portfolio risk."
          ],
          quiz: {
            id: "Q10_1",
            question: "To effectively diversify a portfolio, an investor should seek assets with:",
            options: [
              "Perfect positive correlation (1.0).",
              "Low or negative correlation.",
              "High volatility.",
              "Zero returns."
            ],
            correctAnswerIndex: 1,
            explanation: "Assets with low or negative correlation do not move in tandem, meaning a loss in one might be offset by a gain in another, reducing risk."
          }
        },
        {
          id: "L10_2",
          title: "Volatility",
          learningObjective: "Understand the statistical measurement of investment risk.",
          coreConcept: "Volatility is the rate at which the price of an asset increases or decreases over a particular period, usually measured by the standard deviation of returns.",
          simpleExplanation: "Volatility is a measure of how bumpy the ride is. A bumpy ride (high volatility) means the price swings wildly. A smooth ride (low volatility) means the price is stable.",
          realWorldExample: "Bitcoin has extremely high volatility, meaning it can drop 20% in a week. A bank Fixed Deposit has zero volatility.",
          importantTakeaways: [
            "Volatility is not the same as losing money permanently; it's just price fluctuation.",
            "Higher volatility is usually the price you pay for higher potential returns.",
            "Younger investors can afford to tolerate higher volatility."
          ],
          quiz: {
            id: "Q10_2",
            question: "Which of the following is commonly used as a statistical measure of volatility?",
            options: [
              "CAGR",
              "Standard Deviation",
              "Inflation Rate",
              "PE Ratio"
            ],
            correctAnswerIndex: 1,
            explanation: "Standard deviation measures how widely prices are dispersed from the average price, making it the standard statistical measure of volatility."
          }
        },
        {
          id: "L10_3",
          title: "Expected Return",
          learningObjective: "Calculate the anticipated profit on an investment based on historical data.",
          coreConcept: "Expected return is the anticipated profit or loss on an investment, calculated by multiplying potential outcomes by the chances of them occurring and then summing those results.",
          simpleExplanation: "It's an educated guess of how much an investment will make on average, based on past data. It's not a guarantee, just what is mathematically most likely over a long time.",
          realWorldExample: "Historically, large-cap Indian stocks might have an expected return of 12%, while government bonds might have an expected return of 7%.",
          importantTakeaways: [
            "Expected return is a long-term average, not a short-term guarantee.",
            "It is used to estimate future portfolio values.",
            "Historical performance does not guarantee future results."
          ],
          quiz: {
            id: "Q10_3",
            question: "Why is 'expected return' not a guarantee of future performance?",
            options: [
              "Because it is calculated using inflation.",
              "Because it relies on historical probabilities, and the future can deviate significantly from the past.",
              "Because taxes will always reduce it to zero.",
              "Because it only applies to real estate."
            ],
            correctAnswerIndex: 1,
            explanation: "Expected return is a probabilistic estimate based on history. Unforeseen market events can easily cause actual returns to differ wildly from expected ones."
          }
        },
        {
          id: "L10_4",
          title: "Portfolio Risk",
          learningObjective: "Assess the combined risk of all assets held in a portfolio.",
          coreConcept: "Portfolio risk is a measure of the total variance of the entire portfolio, taking into account the risk of individual assets and their correlations with one another.",
          simpleExplanation: "It's the overall risk of your entire basket of eggs. Even if you have a few risky eggs (stocks), adding some safe eggs (bonds) lowers the risk of the whole basket.",
          realWorldExample: "A portfolio of 100% small-cap stocks has high portfolio risk. A portfolio of 50% large-cap stocks and 50% PPF has moderate portfolio risk.",
          importantTakeaways: [
            "Portfolio risk is lower than the weighted average risk of individual assets if they aren't perfectly correlated.",
            "Diversification is the primary tool to manage portfolio risk.",
            "Risk should be aligned with the investor's time horizon."
          ],
          quiz: {
            id: "Q10_4",
            question: "How does adding a low-correlation asset to a risky portfolio affect overall portfolio risk?",
            options: [
              "It increases the risk.",
              "It generally decreases the overall risk.",
              "It makes the portfolio immune to taxes.",
              "It guarantees a higher expected return."
            ],
            correctAnswerIndex: 1,
            explanation: "Assets with low correlation don't move together, so adding one to a risky portfolio smooths out the overall volatility, lowering total risk."
          }
        },
        {
          id: "L10_5",
          title: "Monte Carlo Simulation",
          learningObjective: "Understand advanced probabilistic forecasting for financial plans.",
          coreConcept: "A Monte Carlo simulation is a mathematical technique that generates hundreds or thousands of possible future market scenarios to estimate the probability of different outcomes.",
          simpleExplanation: "Instead of assuming you will earn exactly 10% every year, a computer tests thousands of different 'what if' scenarios (like market crashes, booms, high inflation) to see if you will still reach your goal in most of them.",
          realWorldExample: "A retirement planner uses Monte Carlo to tell a client: 'In 9,000 out of 10,000 market scenarios, your ₹5 Crore corpus will last until age 90.'",
          importantTakeaways: [
            "It accounts for the randomness and sequence of market returns.",
            "It is superior to simple straight-line return projections.",
            "It helps stress-test a financial plan against worst-case scenarios."
          ],
          quiz: {
            id: "Q10_5",
            question: "What is the primary advantage of a Monte Carlo simulation over a straight-line return projection?",
            options: [
              "It calculates the exact amount of tax owed.",
              "It accounts for market volatility and random sequences of returns.",
              "It takes less computing power.",
              "It guarantees the investor will not lose money."
            ],
            correctAnswerIndex: 1,
            explanation: "Unlike a fixed projection (e.g., exactly 8% every year), Monte Carlo models the chaotic, random nature of markets to provide a realistic probability of success."
          }
        },
        {
          id: "L10_6",
          title: "Risk-Adjusted Returns",
          learningObjective: "Evaluate investment performance relative to the amount of risk taken.",
          coreConcept: "Risk-adjusted return refines an investment's return by measuring how much risk is involved in producing that return, often using metrics like the Sharpe Ratio.",
          simpleExplanation: "If Fund A makes 15% but takes wild risks, and Fund B makes 14% but is very safe, Fund B is actually better. Risk-adjusted return helps you compare them fairly.",
          realWorldExample: "If a crypto coin gave 50% returns but fluctuated wildly, its risk-adjusted return might be worse than a stable mutual fund that gave 15%.",
          importantTakeaways: [
            "Higher returns are only 'better' if they don't require disproportionately higher risk.",
            "The Sharpe Ratio is a common metric to measure this.",
            "It helps expose fund managers who take reckless bets."
          ],
          quiz: {
            id: "Q10_6",
            question: "Why might an investor prefer a fund with a 10% return over a fund with a 12% return?",
            options: [
              "Because the 10% fund charges higher fees.",
              "If the 10% fund has significantly lower volatility, giving it a better risk-adjusted return.",
              "Because 10% is easier to calculate.",
              "Because lower returns are taxed at a higher rate."
            ],
            correctAnswerIndex: 1,
            explanation: "An investor might accept slightly lower nominal returns if it means avoiding severe volatility, indicating a better risk-adjusted return."
          }
        },
        {
          id: "L10_7",
          title: "Portfolio Optimization Concepts",
          learningObjective: "Learn the theoretical basis for constructing the ideal portfolio.",
          coreConcept: "Portfolio optimization is the process of selecting the best portfolio out of the set of all portfolios being considered, according to some objective, such as maximizing return for a given level of risk.",
          simpleExplanation: "Optimization is about finding the 'sweet spot'. It's the mathematical process of mixing different assets in the exact right proportions to get the highest possible return without taking on too much risk.",
          realWorldExample: "Modern Portfolio Theory suggests that a mix of 60% stocks and 40% bonds is historically optimized to provide strong growth while cushioning severe market crashes.",
          importantTakeaways: [
            "The 'Efficient Frontier' represents the set of optimal portfolios.",
            "Optimization relies heavily on asset correlation.",
            "It aims to maximize the Sharpe Ratio."
          ],
          quiz: {
            id: "Q10_7",
            question: "What is the primary goal of portfolio optimization?",
            options: [
              "To eliminate all taxes.",
              "To maximize expected return for a specific, acceptable level of risk.",
              "To hold only one extremely high-performing asset.",
              "To guarantee a 15% return."
            ],
            correctAnswerIndex: 1,
            explanation: "Optimization seeks to find the most efficient portfolio—the one that extracts the highest possible return without exceeding the investor's risk tolerance."
          }
        }
      ]
    }
  ],
  videos: [
    {
      title: "How to achieve your Financial Goals?",
      provider: "Zerodha Varsity",
      url: "https://www.youtube.com/watch?v=W9uoa5ETcJ4",
      description: "Learn how to define financial goals, allocate assets, save systematically, calculate the required SIP and plan for achieving long-term financial objectives."
    },
    {
      title: "XIRR vs CAGR vs Absolute Returns | Which one to look at?",
      provider: "Zerodha Varsity",
      url: "https://www.youtube.com/watch?v=2IqISNe9lks",
      description: "Understand the difference between absolute returns, CAGR and XIRR, and learn which return measure is appropriate for different investment situations."
    },
    {
      title: "Portfolio Risk and Return - Part I",
      provider: "AnalystPrep",
      url: "https://www.youtube.com/watch?v=DLKhsZvcD-c",
      description: "Advanced discussion on portfolio risk, expected return, correlation, diversification, portfolio construction and risk/return relationships."
    }
  ],
  assessment: [
    {
      id: "ADV_A1",
      question: "Which of the following is true about Nominal vs Real Returns?",
      options: [
        "Nominal return is always lower than real return.",
        "Real return accounts for inflation, while nominal return does not.",
        "Both nominal and real returns are identical.",
        "Real return only applies to bond investments."
      ],
      correctAnswerIndex: 1,
      explanation: "Real return subtracts the inflation rate from the nominal return to show your true increase in purchasing power."
    },
    {
      id: "ADV_A2",
      question: "A planner informs you that your retirement plan has a 'Goal Probability' of 45%. What is the most appropriate action to take?",
      options: [
        "Maintain the current plan; 45% is an excellent probability.",
        "Move all investments into high-risk assets immediately.",
        "Increase the monthly contribution or extend the time horizon to improve the probability.",
        "Switch entirely to calculating nominal returns."
      ],
      correctAnswerIndex: 2,
      explanation: "A 45% probability means the plan is likely to fail. You must adjust variables you control—like saving more or working longer—to increase the chance of success."
    },
    {
      id: "ADV_A3",
      question: "An investor is reviewing a mutual fund statement showing regular monthly deposits and occasional random withdrawals. Which metric provides the most accurate annual return?",
      options: [
        "Absolute Return",
        "Nominal Return",
        "CAGR (Compound Annual Growth Rate)",
        "XIRR (Extended Internal Rate of Return)"
      ],
      correctAnswerIndex: 3,
      explanation: "XIRR is specifically designed to calculate the return for irregular cash flows occurring on different dates, making it the correct choice over CAGR."
    },
    {
      id: "ADV_A4",
      question: "If an investment provides a nominal return of 9% in a year where inflation runs at 6%, what economic reality is the investor facing?",
      options: [
        "A real return of approximately 3%, representing a small increase in actual purchasing power.",
        "A real return of 15%, meaning significant wealth generation.",
        "A negative real return, meaning they are losing money.",
        "They are suffering from money illusion."
      ],
      correctAnswerIndex: 0,
      explanation: "Real Return is roughly Nominal Return (9%) minus Inflation (6%), leaving a 3% increase in actual purchasing power."
    },
    {
      id: "ADV_A5",
      question: "SCENARIO: A goal has a future target amount, but inflation is expected to increase the cost of that goal over time. What should be considered when estimating the required future amount?",
      options: [
        "Inflation-adjusted target",
        "Only today's cost",
        "Current bank balance only",
        "Historical stock price"
      ],
      correctAnswerIndex: 0,
      explanation: "Inflation increases the future cost of goods. The target amount must be adjusted for inflation to ensure adequate funding."
    },
    {
      id: "ADV_A6",
      question: "SCENARIO: A portfolio contains several assets whose returns tend to move independently of each other. Which concept best explains why combining these assets may reduce overall portfolio risk?",
      options: [
        "Inflation",
        "CAGR",
        "Liquidity",
        "Correlation"
      ],
      correctAnswerIndex: 3,
      explanation: "Assets with lower correlation do not always move together, which can reduce portfolio-level volatility."
    },
    {
      id: "ADV_A7",
      question: "SCENARIO: An investor has a long investment horizon and is evaluating two portfolios. Portfolio A has higher expected return but significantly higher volatility. Portfolio B has lower expected return and lower volatility. Which factor should be considered when deciding whether the higher expected return is appropriate?",
      options: [
        "Only the expected return",
        "Only the current market price",
        "Risk tolerance, risk capacity and investment horizon",
        "Only the previous year's return"
      ],
      correctAnswerIndex: 2,
      explanation: "Selecting a portfolio depends on evaluating risk capacity (ability to take risk), risk tolerance (willingness to take risk), and the investment time horizon."
    },
    {
      id: "ADV_A8",
      question: "SCENARIO: You want to determine the probability of your portfolio surviving a 30-year retirement, given unpredictable sequence of returns and market crashes. Which tool is most appropriate?",
      options: [
        "A simple compound interest calculator assuming a flat 8% return.",
        "Dividend yield calculation",
        "Total Expense Ratio analysis",
        "Monte Carlo simulation"
      ],
      correctAnswerIndex: 3,
      explanation: "Monte Carlo simulation uses randomized market conditions to test the portfolio against thousands of possible scenarios, including severe sequence of returns risk."
    },
    {
      id: "ADV_A9",
      question: "SCENARIO: Two mutual funds both return 12% annually over a 5-year period. Fund X experienced massive swings in price (high standard deviation), while Fund Y grew steadily with minimal drops. How would a financial analyst differentiate them?",
      options: [
        "They are identical because the CAGR is the same.",
        "Fund X is better because volatility indicates future growth.",
        "Fund Y is worse because it lacks momentum.",
        "Fund Y has a better risk-adjusted return."
      ],
      correctAnswerIndex: 3,
      explanation: "Because Fund Y achieved the same return with significantly less volatility, its risk-adjusted return (e.g., Sharpe Ratio) is superior."
    },
    {
      id: "ADV_A10",
      question: "SCENARIO: A client's 'Funding Gap' for a future financial goal is calculated to be ₹5 Lakhs. What does this mean?",
      options: [
        "They have ₹5 Lakhs too much.",
        "They need to invest in an asset returning exactly 5%.",
        "Their current savings and projected contributions will fall short of the goal by ₹5 Lakhs.",
        "They should take out a ₹5 Lakh loan immediately."
      ],
      correctAnswerIndex: 2,
      explanation: "A funding gap represents the shortfall between projected accumulated wealth and the inflation-adjusted target amount."
    }
  ]
};
