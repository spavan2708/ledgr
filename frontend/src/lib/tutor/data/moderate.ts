import type { TutorLevel } from "../types";

export const moderateLevel: TutorLevel = {
  id: "MODERATE",
  title: "Investing & Financial Planning",
  description: "Understand investing, asset classes, risk and portfolio concepts.",
  sections: [
    {
      id: "SEC4",
      title: "Investing Basics",
      description: "Learn the fundamentals of investing.",
      lessons: [
        {
          id: "SEC4_L1",
          title: "What is Investing?",
          learningObjective: "Understand the core concept of investing to grow wealth.",
          coreConcept: "Investing is the act of allocating money with the expectation of generating an income or profit.",
          simpleExplanation: "Investing means putting your money to work for you so it can grow over time, rather than just sitting in a bank account doing nothing.",
          realWorldExample: "If you buy shares of an Indian company for ₹10,000 and it grows in value to ₹15,000 over a few years, you've made a profit from your investment.",
          importantTakeaways: [
            "Investing involves putting money into assets to generate returns.",
            "It is a key strategy for building long-term wealth.",
            "There is always some level of risk associated with investing."
          ],
          quiz: {
            id: "Q_SEC4_L1",
            question: "What is the primary goal of investing?",
            options: ["To lose money", "To keep money safe under a mattress", "To generate income or profit over time", "To spend money quickly"],
            correctAnswerIndex: 2,
            explanation: "Investing is all about putting your money to work to generate returns."
          }
        },
        {
          id: "SEC4_L2",
          title: "Saving vs Investing",
          learningObjective: "Distinguish between the purpose of saving and investing.",
          coreConcept: "Saving is setting money aside for short-term goals or emergencies, while investing is for long-term wealth creation.",
          simpleExplanation: "Saving is like putting your money in a safe box—it's secure but doesn't grow much. Investing is like planting a seed—it takes time and carries some risk, but it can grow into a large tree.",
          realWorldExample: "Keeping ₹50,000 in a savings account for an upcoming vacation is saving. Putting ₹50,000 in an index fund for retirement in 20 years is investing.",
          importantTakeaways: [
            "Savings are highly liquid and low risk.",
            "Investments offer higher potential returns but come with risk.",
            "Both are necessary for a healthy financial life."
          ],
          quiz: {
            id: "Q_SEC4_L2",
            question: "Which of the following best describes saving?",
            options: ["Buying stocks for long-term growth", "Setting aside money in a low-risk account for short-term needs", "Taking high risks to double money quickly", "Purchasing real estate"],
            correctAnswerIndex: 1,
            explanation: "Saving is focused on preserving capital for short-term needs and emergencies."
          }
        },
        {
          id: "SEC4_L3",
          title: "Why People Invest",
          learningObjective: "Identify the main reasons why individuals choose to invest.",
          coreConcept: "People invest to outpace inflation, achieve financial goals, and build wealth for the future.",
          simpleExplanation: "We invest because the cost of things goes up over time (inflation), and if we just save, our money loses value. Investing helps our money grow faster than the cost of living.",
          realWorldExample: "A person wants to buy a house in 10 years. By investing ₹10,000 monthly instead of just saving it, they can reach their down payment goal faster due to returns.",
          importantTakeaways: [
            "Investing helps combat the wealth-eroding effects of inflation.",
            "It is essential for funding major life goals like retirement.",
            "It allows you to benefit from the power of compounding."
          ],
          quiz: {
            id: "Q_SEC4_L3",
            question: "What is a major reason people choose to invest?",
            options: ["To pay more taxes", "To reduce their net worth", "To outpace inflation and build wealth", "To guarantee a loss"],
            correctAnswerIndex: 2,
            explanation: "Investing is primarily done to grow wealth and stay ahead of inflation."
          }
        },
        {
          id: "SEC4_L4",
          title: "Inflation",
          learningObjective: "Understand how inflation decreases purchasing power over time.",
          coreConcept: "Inflation is the rate at which the general level of prices for goods and services is rising, eroding purchasing power.",
          simpleExplanation: "Inflation means that things get more expensive over time. The ₹100 you have today won't buy as much in 5 years because prices will have gone up.",
          realWorldExample: "A cup of chai that used to cost ₹5 a few years ago might now cost ₹15. This increase in price over time is inflation.",
          importantTakeaways: [
            "Inflation reduces the value of money over time.",
            "Investments must earn a return higher than the inflation rate to truly grow your wealth.",
            "Keeping all money in cash guarantees a loss in purchasing power."
          ],
          quiz: {
            id: "Q_SEC4_L4",
            question: "How does inflation affect your money?",
            options: ["It increases the value of cash", "It decreases your purchasing power", "It has no effect on money", "It lowers prices of goods"],
            correctAnswerIndex: 1,
            explanation: "As prices rise due to inflation, the same amount of money buys fewer goods, reducing your purchasing power."
          }
        },
        {
          id: "SEC4_L5",
          title: "Compound Interest",
          learningObjective: "Grasp the concept of earning interest on interest.",
          coreConcept: "Compound interest is the addition of interest to the principal sum of a loan or deposit, meaning you earn interest on previously earned interest.",
          simpleExplanation: "Compound interest is like a snowball rolling down a hill. As it rolls, it gathers more snow and gets bigger faster. Your money earns interest, and then that new total earns even more interest.",
          realWorldExample: "If you invest ₹1,00,000 at 10% annual interest, you get ₹10,000 the first year. The next year, you earn 10% on ₹1,10,000, which is ₹11,000. Over time, the growth accelerates.",
          importantTakeaways: [
            "Compounding allows wealth to grow exponentially.",
            "Time is the most important factor in compound interest.",
            "Starting early is the best way to maximize compounding."
          ],
          quiz: {
            id: "Q_SEC4_L5",
            question: "What is the key benefit of compound interest?",
            options: ["You only earn interest on your initial deposit", "You earn interest on both your initial deposit and past interest", "It prevents you from accessing your money", "It guarantees you won't lose money"],
            correctAnswerIndex: 1,
            explanation: "Compound interest allows you to earn returns on both your principal and the accumulated interest."
          }
        },
        {
          id: "SEC4_L6",
          title: "Time Value of Money",
          learningObjective: "Understand why a rupee today is worth more than a rupee tomorrow.",
          coreConcept: "The time value of money (TVM) is the concept that a sum of money is worth more now than the same sum will be at a future date due to its earnings potential.",
          simpleExplanation: "Money available now is better than the same amount later because you can invest it to earn interest. Plus, inflation means future money will buy less.",
          realWorldExample: "Would you rather have ₹10,000 today or ₹10,000 in 5 years? Today is better, because you can invest it now and it will grow to be more than ₹10,000 in 5 years.",
          importantTakeaways: [
            "Money has earning capacity over time.",
            "Inflation reduces the future purchasing power of money.",
            "Receiving money sooner is generally better than later."
          ],
          quiz: {
            id: "Q_SEC4_L6",
            question: "According to the Time Value of Money principle, which is preferable?",
            options: ["Receiving ₹1,000 today", "Receiving ₹1,000 in one year", "Receiving ₹1,000 in five years", "Receiving ₹500 today"],
            correctAnswerIndex: 0,
            explanation: "Receiving money today allows you to invest it and earn a return, making it worth more than receiving the same amount in the future."
          }
        },
        {
          id: "SEC4_L7",
          title: "Risk vs Return",
          learningObjective: "Recognize the fundamental trade-off between risk and potential reward.",
          coreConcept: "The risk-return tradeoff states that the potential return rises with an increase in risk.",
          simpleExplanation: "If you want a chance to make a lot of money (high return), you usually have to accept a higher chance of losing money (high risk). Safer investments offer lower returns.",
          realWorldExample: "A fixed deposit offers a safe, guaranteed return of 6-7%. Investing in a startup could yield a 500% return, but there is a high risk the startup fails and you lose everything.",
          importantTakeaways: [
            "Low risk generally means low potential returns.",
            "High potential returns come with high risk.",
            "Investors must balance their desire for returns with their tolerance for risk."
          ],
          quiz: {
            id: "Q_SEC4_L7",
            question: "What is the typical relationship between risk and return?",
            options: ["Higher risk usually brings lower potential returns", "Lower risk usually brings higher potential returns", "Higher risk is associated with higher potential returns", "There is no relationship between risk and return"],
            correctAnswerIndex: 2,
            explanation: "To achieve higher returns, investors generally must be willing to accept higher levels of risk."
          }
        }
      ]
    },
    {
      id: "SEC5",
      title: "Asset Classes",
      description: "Explore the different types of investments available.",
      lessons: [
        {
          id: "SEC5_L1",
          title: "Cash",
          learningObjective: "Understand the role of cash and cash equivalents in investing.",
          coreConcept: "Cash is the most liquid asset class, offering safety but minimal returns.",
          simpleExplanation: "Cash includes physical money and money in bank savings accounts. It's perfectly safe from market crashes but loses value to inflation over time.",
          realWorldExample: "Keeping ₹20,000 in a savings account or as hard cash in a locker provides immediate liquidity for emergencies.",
          importantTakeaways: [
            "Cash is highly liquid and safe from market volatility.",
            "Returns on cash are usually lower than inflation.",
            "It is best used for emergency funds and short-term needs."
          ],
          quiz: {
            id: "Q_SEC5_L1",
            question: "What is the main drawback of holding too much cash?",
            options: ["It is too risky", "It loses purchasing power to inflation over time", "It is hard to access in an emergency", "It provides extremely high returns"],
            correctAnswerIndex: 1,
            explanation: "Cash yields very low returns, which means its purchasing power erodes as inflation causes prices to rise."
          }
        },
        {
          id: "SEC5_L2",
          title: "Fixed Deposits",
          learningObjective: "Learn about fixed-income instruments offered by banks.",
          coreConcept: "A Fixed Deposit (FD) is a financial instrument provided by banks which provides investors a higher rate of interest than a regular savings account, until the given maturity date.",
          simpleExplanation: "An FD is a safe investment where you lock your money in a bank for a set period and they give you a guaranteed interest rate.",
          realWorldExample: "Putting ₹5,00,000 in a 3-year bank FD at 7% interest means you are guaranteed to get your money back plus the interest after 3 years.",
          importantTakeaways: [
            "FDs offer guaranteed returns and capital protection.",
            "Money is locked in, and early withdrawal may incur a penalty.",
            "Returns may not significantly beat inflation after taxes."
          ],
          quiz: {
            id: "Q_SEC5_L2",
            question: "What is a key feature of a Fixed Deposit?",
            options: ["High volatility", "Guaranteed returns over a set period", "Potential to double in a few days", "High liquidity without penalties"],
            correctAnswerIndex: 1,
            explanation: "FDs provide a fixed, guaranteed interest rate over a predetermined time period."
          }
        },
        {
          id: "SEC5_L3",
          title: "Bonds",
          learningObjective: "Understand how bonds work as debt investments.",
          coreConcept: "A bond is a fixed-income instrument that represents a loan made by an investor to a borrower (typically corporate or governmental).",
          simpleExplanation: "When you buy a bond, you are lending your money to a company or the government. They promise to pay you regular interest and return your original money on a specific date.",
          realWorldExample: "Buying a ₹10,000 Government of India bond that pays 7.5% interest annually for 10 years.",
          importantTakeaways: [
            "Bonds are debt instruments where you act as the lender.",
            "They provide regular income through interest payments.",
            "They are generally less risky than stocks but more risky than FDs."
          ],
          quiz: {
            id: "Q_SEC5_L3",
            question: "When you purchase a bond, what are you essentially doing?",
            options: ["Buying ownership in a company", "Lending money to a borrower", "Purchasing physical real estate", "Putting cash in a vault"],
            correctAnswerIndex: 1,
            explanation: "A bond is a debt instrument; you are lending your money to an entity (like a government or corporation) in exchange for interest."
          }
        },
        {
          id: "SEC5_L4",
          title: "Mutual Funds",
          learningObjective: "Discover how mutual funds pool money to invest in various assets.",
          coreConcept: "A mutual fund is an investment vehicle made up of a pool of money collected from many investors to invest in securities like stocks, bonds, and other assets.",
          simpleExplanation: "A mutual fund is like a giant basket of investments managed by an expert. Many people put their money into the basket, and the expert uses the money to buy a mix of stocks or bonds.",
          realWorldExample: "Investing ₹5,000 a month in a mutual fund via a SIP (Systematic Investment Plan) allows you to own a tiny piece of dozens of large Indian companies.",
          importantTakeaways: [
            "Mutual funds offer instant diversification.",
            "They are managed by professional fund managers.",
            "They charge a fee (expense ratio) for managing the money."
          ],
          quiz: {
            id: "Q_SEC5_L4",
            question: "What is a primary advantage of investing in a mutual fund?",
            options: ["Guaranteed returns with no risk", "Avoiding all fees", "Professional management and diversification", "Ability to manage individual stocks yourself"],
            correctAnswerIndex: 2,
            explanation: "Mutual funds pool money to provide diversification and are managed by financial professionals."
          }
        },
        {
          id: "SEC5_L5",
          title: "Stocks / Equity",
          learningObjective: "Learn what it means to own shares of a company.",
          coreConcept: "Stocks (or equities) represent fractional ownership in a company. When you buy a stock, you buy a piece of the business.",
          simpleExplanation: "Buying a stock means you own a tiny slice of a company. If the company does well, your slice becomes more valuable. If it does poorly, your slice loses value.",
          realWorldExample: "If you buy 10 shares of Reliance Industries or Tata Motors, you become a part-owner of those companies.",
          importantTakeaways: [
            "Stocks offer high potential returns over the long term.",
            "They are highly volatile and carry significant risk in the short term.",
            "Returns come from price appreciation and dividends."
          ],
          quiz: {
            id: "Q_SEC5_L5",
            question: "What do you own when you buy a stock?",
            options: ["A loan to the company", "A guaranteed income stream", "A fractional ownership stake in a company", "A physical piece of the company's factory"],
            correctAnswerIndex: 2,
            explanation: "Stocks represent equity, meaning you own a fractional share of the underlying company."
          }
        },
        {
          id: "SEC5_L6",
          title: "Other Assets",
          learningObjective: "Explore alternative asset classes like real estate and gold.",
          coreConcept: "Alternative assets are investments outside of traditional stocks, bonds, and cash, such as real estate, commodities (gold), and cryptocurrencies.",
          simpleExplanation: "Besides the stock market and banks, you can invest in physical things like houses, land, or gold. These often behave differently than stocks and bonds.",
          realWorldExample: "Buying a plot of land in a developing area or purchasing gold coins during Dhanteras as an investment.",
          importantTakeaways: [
            "Real estate and gold are popular tangible assets.",
            "Alternative assets can help diversify a portfolio.",
            "They can be illiquid (hard to sell quickly) compared to stocks."
          ],
          quiz: {
            id: "Q_SEC5_L6",
            question: "Which of the following is considered an alternative asset?",
            options: ["A bank savings account", "A government bond", "Physical gold", "A large-cap mutual fund"],
            correctAnswerIndex: 2,
            explanation: "Gold is a physical commodity and is considered an alternative asset class compared to traditional financial assets."
          }
        },
        {
          id: "SEC5_L7",
          title: "Comparing Asset Classes",
          learningObjective: "Understand how different asset classes compare in terms of risk and return.",
          coreConcept: "Asset classes have distinct risk-return profiles: Cash is low risk/low return, bonds are moderate, and stocks are high risk/high return.",
          simpleExplanation: "Think of asset classes like vehicles. Cash is a bicycle (safe, but slow). Bonds are a family car (steady pace). Stocks are a sports car (fast, but can crash).",
          realWorldExample: "While an FD might give you 7% safely, the stock market (like the Nifty 50) might historically give 12-14% over the long run, but with many bumps along the way.",
          importantTakeaways: [
            "No single asset class is perfect for every situation.",
            "Cash provides safety, bonds provide income, and stocks provide growth.",
            "A mix of asset classes is usually the best approach."
          ],
          quiz: {
            id: "Q_SEC5_L7",
            question: "In general, which asset class offers the highest potential long-term growth?",
            options: ["Cash", "Fixed Deposits", "Government Bonds", "Stocks (Equities)"],
            correctAnswerIndex: 3,
            explanation: "Historically, stocks have provided the highest returns over the long term, though they come with higher volatility."
          }
        }
      ]
    },
    {
      id: "SEC6",
      title: "Risk & Diversification",
      description: "Learn how to manage and mitigate investment risks.",
      lessons: [
        {
          id: "SEC6_L1",
          title: "What is Investment Risk?",
          learningObjective: "Define risk in the context of investing.",
          coreConcept: "Investment risk is the probability or likelihood of occurrence of losses relative to the expected return on any particular investment.",
          simpleExplanation: "Risk is the chance that your investment will lose money or not make as much money as you expected.",
          realWorldExample: "If you invest in a volatile tech stock, the risk is that the company's new product fails and the stock price plummets, causing you to lose a large part of your ₹50,000 investment.",
          importantTakeaways: [
            "Risk is inherent in all investing.",
            "It is measured in various ways, often by how much the investment's price fluctuates.",
            "Higher risk means a wider range of possible outcomes."
          ],
          quiz: {
            id: "Q_SEC6_L1",
            question: "How is investment risk best described?",
            options: ["A guarantee of making a profit", "The chance that an investment's actual return will differ from expectations, including the possibility of losing some or all of the original investment", "The fee charged by a broker", "The time it takes to sell an asset"],
            correctAnswerIndex: 1,
            explanation: "Risk refers to the uncertainty of returns and the potential for financial loss."
          }
        },
        {
          id: "SEC6_L2",
          title: "Risk Tolerance",
          learningObjective: "Understand your psychological comfort with taking risks.",
          coreConcept: "Risk tolerance is the degree of variability in investment returns that an investor is willing to withstand in their financial planning.",
          simpleExplanation: "Risk tolerance is how well you sleep at night when the market drops. If seeing your portfolio lose 20% in a month makes you panic, your risk tolerance is low.",
          realWorldExample: "Two friends invest ₹1,00,000. The market drops and both portfolios fall to ₹80,000. Friend A panics and sells. Friend B stays calm and buys more. Friend B has higher risk tolerance.",
          importantTakeaways: [
            "Risk tolerance is psychological and emotional.",
            "It determines what kind of investments you should hold.",
            "Taking more risk than you can tolerate leads to panic selling."
          ],
          quiz: {
            id: "Q_SEC6_L2",
            question: "What does risk tolerance refer to?",
            options: ["The mathematical formula for calculating interest", "An investor's emotional comfort level with potential investment losses", "The maximum amount of money a person is allowed to invest", "The legal limit on how much a stock can drop"],
            correctAnswerIndex: 1,
            explanation: "Risk tolerance is a psychological measure of how much volatility and potential loss an investor can comfortably handle."
          }
        },
        {
          id: "SEC6_L3",
          title: "Risk Capacity",
          learningObjective: "Distinguish between psychological risk tolerance and financial risk capacity.",
          coreConcept: "Risk capacity is the financial ability of an investor to take risk and absorb potential losses without affecting their financial goals.",
          simpleExplanation: "Risk capacity is about your wallet, not your feelings. Even if you are brave (high tolerance), if you need your money next month to pay rent, you cannot afford to take risks (low capacity).",
          realWorldExample: "A 25-year-old with a stable job has high risk capacity for a retirement fund. A 65-year-old retiring next year has low risk capacity and shouldn't gamble their savings.",
          importantTakeaways: [
            "Risk capacity is objective and financial, based on your timeframe and wealth.",
            "It can differ from risk tolerance (you might be brave but poor, or fearful but rich).",
            "Your investments should align with the lower of your tolerance or capacity."
          ],
          quiz: {
            id: "Q_SEC6_L3",
            question: "How does risk capacity differ from risk tolerance?",
            options: ["They are exactly the same thing", "Capacity is emotional, tolerance is financial", "Capacity is your financial ability to absorb losses, while tolerance is your psychological comfort with risk", "Capacity only applies to bonds, tolerance only applies to stocks"],
            correctAnswerIndex: 2,
            explanation: "Capacity is an objective measure of your financial situation, whereas tolerance is subjective and emotional."
          }
        },
        {
          id: "SEC6_L4",
          title: "Investment Horizon",
          learningObjective: "Recognize how time impacts investment strategy and risk.",
          coreConcept: "An investment horizon is the total length of time that an investor expects to hold a security or a portfolio.",
          simpleExplanation: "Your investment horizon is simply how long you plan to keep your money invested before you need to spend it.",
          realWorldExample: "Saving for a down payment in 2 years is a short horizon. Saving for a child's college education in 15 years is a long horizon.",
          importantTakeaways: [
            "Longer horizons allow you to take more risk, as you have time to recover from drops.",
            "Short horizons require safe, liquid investments.",
            "Time horizon is the primary driver of asset allocation."
          ],
          quiz: {
            id: "Q_SEC6_L4",
            question: "If you have a very short investment horizon (e.g., 1 year), what should you prioritize?",
            options: ["Maximum aggressive growth", "High-risk stocks", "Capital preservation and liquidity", "Alternative investments like real estate"],
            correctAnswerIndex: 2,
            explanation: "With a short time horizon, you don't have time to recover from market downturns, so keeping the money safe and accessible is key."
          }
        },
        {
          id: "SEC6_L5",
          title: "Volatility",
          learningObjective: "Understand price fluctuations in the market.",
          coreConcept: "Volatility is a statistical measure of the dispersion of returns for a given security or market index; it represents how much a price swings up and down.",
          simpleExplanation: "Volatility is the financial roller coaster. High volatility means the price jumps up and down wildly. Low volatility means the price stays relatively smooth.",
          realWorldExample: "Cryptocurrency prices can swing 10% in a single day—this is high volatility. A fixed deposit value grows steadily by a tiny amount each day—this is low volatility.",
          importantTakeaways: [
            "Volatility is normal in stock markets.",
            "It is not the same as a permanent loss of capital.",
            "Long-term investors use volatility as an opportunity to buy cheaper assets."
          ],
          quiz: {
            id: "Q_SEC6_L5",
            question: "What does it mean if an investment is highly volatile?",
            options: ["It is guaranteed to lose money", "Its price experiences large and rapid fluctuations", "It provides a steady, unchanging return", "It is immune to inflation"],
            correctAnswerIndex: 1,
            explanation: "High volatility means the price of the asset swings widely in a short period of time."
          }
        },
        {
          id: "SEC6_L6",
          title: "Understanding Losses",
          learningObjective: "Learn the difference between unrealized and realized losses.",
          coreConcept: "A paper loss (unrealized loss) occurs when an asset's current price is below its purchase price. A realized loss occurs only when the asset is sold at that lower price.",
          simpleExplanation: "If your stock drops in value, you haven't actually lost the money yet—it's just a number on a screen. You only truly lose the money if you hit 'sell'.",
          realWorldExample: "You buy a stock for ₹1,000. It drops to ₹800. You have an unrealized loss of ₹200. If you hold it and it goes back up to ₹1,100, you never lost money. If you sell at ₹800, you realize the loss.",
          importantTakeaways: [
            "Markets naturally go down sometimes.",
            "Panic selling turns temporary paper losses into permanent realized losses.",
            "Patience is key to weathering market downturns."
          ],
          quiz: {
            id: "Q_SEC6_L6",
            question: "When does an unrealized 'paper' loss become a permanent, realized loss?",
            options: ["When the stock market closes for the day", "When the company reports a bad quarter", "When the investor sells the asset at the lower price", "When the investor checks their portfolio app"],
            correctAnswerIndex: 2,
            explanation: "A loss is only locked in (realized) when you actually sell the asset at a price lower than what you paid."
          }
        },
        {
          id: "SEC6_L7",
          title: "Diversification",
          learningObjective: "Understand the concept of spreading risk.",
          coreConcept: "Diversification is a risk management strategy that mixes a wide variety of investments within a portfolio.",
          simpleExplanation: "Diversification simply means 'Don't put all your eggs in one basket.' If one basket drops, you still have eggs in the other baskets.",
          realWorldExample: "Instead of putting all ₹1,00,000 into one company's stock, you put ₹50,000 in a stock mutual fund, ₹30,000 in FDs, and ₹20,000 in gold.",
          importantTakeaways: [
            "Diversification reduces the impact of a single bad investment.",
            "It smooths out portfolio volatility.",
            "It is the 'only free lunch' in investing."
          ],
          quiz: {
            id: "Q_SEC6_L7",
            question: "What is the primary purpose of diversification?",
            options: ["To guarantee the highest possible return", "To reduce overall portfolio risk", "To concentrate money in a single winning stock", "To avoid paying taxes"],
            correctAnswerIndex: 1,
            explanation: "By spreading investments across various assets, diversification helps mitigate the risk of a severe loss if one specific investment performs poorly."
          }
        },
        {
          id: "SEC6_L8",
          title: "Concentration Risk",
          learningObjective: "Identify the dangers of lacking diversification.",
          coreConcept: "Concentration risk is the potential for a loss in value of a portfolio when an individual or group of exposures move together in an unfavorable direction.",
          simpleExplanation: "Concentration risk is the danger of putting all your money into one thing. If that one thing fails, your entire wealth is wiped out.",
          realWorldExample: "An employee holds 90% of their net worth in their employer's company stock. If the company goes bankrupt, they lose their job and their life savings at the same time.",
          importantTakeaways: [
            "Holding too much of one stock is highly risky.",
            "Investors are often overly concentrated without realizing it.",
            "Diversification is the cure for concentration risk."
          ],
          quiz: {
            id: "Q_SEC6_L8",
            question: "What represents a high concentration risk?",
            options: ["Investing in a broad market index fund", "Holding 80% of your portfolio in a single company's stock", "Having a mix of stocks, bonds, and real estate", "Keeping money in several different banks"],
            correctAnswerIndex: 1,
            explanation: "Holding a massive portion of wealth in a single asset exposes the investor to severe loss if that single asset declines."
          }
        }
      ]
    },
    {
      id: "SEC7",
      title: "Portfolio Fundamentals",
      description: "Learn how to build and maintain an investment portfolio.",
      lessons: [
        {
          id: "SEC7_L1",
          title: "What is a Portfolio?",
          learningObjective: "Define what constitutes an investment portfolio.",
          coreConcept: "A portfolio is a collection of financial investments like stocks, bonds, commodities, cash, and cash equivalents, including closed-end funds and exchange traded funds (ETFs).",
          simpleExplanation: "A portfolio is just the fancy word for 'all your investments combined together.'",
          realWorldExample: "If you have an EPF account, some bank FDs, and a mutual fund SIP, all of those combined make up your investment portfolio.",
          importantTakeaways: [
            "A portfolio encompasses all of an investor's assets.",
            "It should be viewed holistically, not just as individual pieces.",
            "The goal of a portfolio is to meet the investor's financial objectives."
          ],
          quiz: {
            id: "Q_SEC7_L1",
            question: "What is an investment portfolio?",
            options: ["A special type of bank account", "A single stock chosen by an expert", "The total collection of all financial assets owned by an individual", "A government-issued document"],
            correctAnswerIndex: 2,
            explanation: "A portfolio is the overarching term for the collection of all investments you hold."
          }
        },
        {
          id: "SEC7_L2",
          title: "Asset Allocation",
          learningObjective: "Understand how to divide a portfolio among different asset categories.",
          coreConcept: "Asset allocation is an investment strategy that aims to balance risk and reward by apportioning a portfolio's assets according to an individual's goals, risk tolerance, and investment horizon.",
          simpleExplanation: "Asset allocation is deciding the recipe for your investments. How much should be spicy (stocks), how much should be mild (bonds), and how much should be water (cash)?",
          realWorldExample: "A common asset allocation for a young person might be 70% equity (stocks) for growth, 20% debt (bonds/FDs) for stability, and 10% cash for emergencies.",
          importantTakeaways: [
            "Asset allocation is the most important factor in portfolio returns.",
            "It drives the overall risk level of the portfolio.",
            "It must be tailored to the individual's time horizon."
          ],
          quiz: {
            id: "Q_SEC7_L2",
            question: "What does asset allocation involve?",
            options: ["Picking the single best stock in the market", "Dividing investments across different asset categories like stocks and bonds", "Trading stocks on a daily basis", "Keeping all money in a savings account"],
            correctAnswerIndex: 1,
            explanation: "Asset allocation is the process of deciding what percentage of your portfolio goes into various categories to balance risk and reward."
          }
        },
        {
          id: "SEC7_L3",
          title: "Diversification",
          learningObjective: "Revisit diversification within portfolio management.",
          coreConcept: "Diversification involves spreading investments within asset classes to avoid excessive exposure to any single source of risk.",
          simpleExplanation: "While asset allocation splits your money between stocks and bonds, diversification splits your stock money across many different companies and sectors.",
          realWorldExample: "Instead of buying just bank stocks, you buy a mutual fund that holds banking, IT, pharmaceutical, and consumer goods stocks.",
          importantTakeaways: [
            "Diversify across asset classes and within asset classes.",
            "It protects the portfolio from sector-specific crashes.",
            "Index funds are a simple way to achieve massive diversification."
          ],
          quiz: {
            id: "Q_SEC7_L3",
            question: "In portfolio management, why is diversification across sectors important?",
            options: ["Because one sector might crash while another remains stable", "Because it guarantees you will beat the market", "Because brokers charge lower fees for diverse portfolios", "Because it is required by law"],
            correctAnswerIndex: 0,
            explanation: "Different sectors of the economy perform differently at various times. Diversification ensures a crash in one sector doesn't wipe out the whole portfolio."
          }
        },
        {
          id: "SEC7_L4",
          title: "Rebalancing",
          learningObjective: "Learn how to maintain your desired asset allocation over time.",
          coreConcept: "Rebalancing is the process of realigning the weightings of a portfolio of assets to maintain the original or desired level of asset allocation or risk.",
          simpleExplanation: "Over time, some investments grow faster than others, messing up your original 'recipe.' Rebalancing means selling some of the winners and buying more of the losers to get back to your original mix.",
          realWorldExample: "You want a 50/50 mix of stocks and bonds. After a good year, stocks grow so much they become 60% of your portfolio. You sell some stocks and buy bonds to get back to 50/50.",
          importantTakeaways: [
            "Rebalancing forces you to buy low and sell high.",
            "It keeps the portfolio's risk level in check.",
            "It is usually done annually or when allocations drift significantly."
          ],
          quiz: {
            id: "Q_SEC7_L4",
            question: "What is the primary purpose of portfolio rebalancing?",
            options: ["To avoid paying capital gains taxes", "To constantly chase the highest performing stocks", "To restore a portfolio to its original, target risk and asset allocation", "To liquidate the portfolio for cash"],
            correctAnswerIndex: 2,
            explanation: "Rebalancing ensures that market movements don't cause your portfolio to become too risky or too conservative compared to your original plan."
          }
        },
        {
          id: "SEC7_L5",
          title: "Current vs Target Allocation",
          learningObjective: "Differentiate between where your portfolio is now and where it should be.",
          coreConcept: "Target allocation is your ideal portfolio mix based on your financial plan. Current allocation is the actual, real-time mix of your assets.",
          simpleExplanation: "Your target allocation is the map of where you want to be. Your current allocation is your GPS telling you where you are right now.",
          realWorldExample: "Your target allocation is 60% stocks. Due to a market crash, your current allocation shows stocks at 45%. You need to invest more in stocks to reach your target.",
          importantTakeaways: [
            "Market movements cause current allocation to drift away from the target.",
            "Comparing the two tells you what actions to take (buy/sell).",
            "A disciplined investor brings the current allocation back to the target."
          ],
          quiz: {
            id: "Q_SEC7_L5",
            question: "If your target allocation for stocks is 70% but your current allocation is 80%, what should you generally do?",
            options: ["Buy more stocks", "Sell some stocks and buy other assets to return to 70%", "Change your target allocation to 80%", "Do nothing"],
            correctAnswerIndex: 1,
            explanation: "To manage risk and stick to your plan, you should trim your stock holdings to bring the allocation back down to your target of 70%."
          }
        },
        {
          id: "SEC7_L6",
          title: "Concentration Risk",
          learningObjective: "Understand the portfolio impact of holding too few assets.",
          coreConcept: "In a portfolio context, concentration risk means relying too heavily on a single asset, manager, or geographic region for returns.",
          simpleExplanation: "Even if you have stocks and bonds, if all your stocks are in just two companies, your portfolio is highly concentrated and vulnerable.",
          realWorldExample: "Holding 15 different mutual funds that all invest in the top 50 Indian tech companies gives a false sense of diversification; you are heavily concentrated in Indian tech.",
          importantTakeaways: [
            "Over-concentration can lead to massive portfolio losses.",
            "True diversification requires looking under the hood of your funds.",
            "Limit exposure to any single company or narrow sector."
          ],
          quiz: {
            id: "Q_SEC7_L6",
            question: "Why is concentration risk dangerous for a portfolio?",
            options: ["It makes tax filing complicated", "It ties the success of the entire portfolio to the fate of a few specific investments", "It prevents you from investing in real estate", "It guarantees lower returns"],
            correctAnswerIndex: 1,
            explanation: "If a portfolio is highly concentrated, a failure in that specific area can cause devastating losses to the overall portfolio value."
          }
        }
      ]
    }
  ],
  videos: [
    {
      title: "How do Mutual Funds work?",
      provider: "YouTube",
      url: "https://www.youtube.com/watch?v=OuYvU5m2rhQ",
      description: "Zerodha Varsity explains the fundamental concept of how mutual funds pool money to invest."
    },
    {
      title: "How to get started with Mutual Funds?",
      provider: "YouTube",
      url: "https://www.youtube.com/watch?v=vElgDX5JF80",
      description: "Learn how to practically start investing in mutual funds and how many funds you actually need."
    },
    {
      title: "Asset Allocation & Diversification Explained | Ft. Kalpesh Ashar",
      provider: "Personal Finance TV",
      url: "https://www.youtube.com/watch?v=ay2SNrC8fj0",
      description: "Learn how asset allocation and diversification work together to build a portfolio while managing risk. The video explains how different asset classes can be combined and why diversification matters."
    }
  ],
  assessment: [
    {
      id: "MOD_ASSESS_1",
      question: "Which of the following is the best description of investing?",
      options: ["Hiding cash in a safe place", "Spending money on luxury goods", "Allocating money with the expectation of generating a profit or income", "Paying off a high-interest credit card debt"],
      correctAnswerIndex: 2,
      explanation: "Investing involves putting your capital to work in assets that have the potential to generate returns over time."
    },
    {
      id: "MOD_ASSESS_2",
      question: "How does inflation impact cash savings over a long period?",
      options: ["It increases the purchasing power of the cash", "It decreases the purchasing power of the cash", "It has no impact on cash", "It forces banks to pay higher interest rates"],
      correctAnswerIndex: 1,
      explanation: "Inflation causes prices to rise over time, meaning a fixed amount of cash will be able to buy fewer goods and services in the future."
    },
    {
      id: "MOD_ASSESS_3",
      question: "Which asset class typically offers the highest potential return but comes with the highest volatility?",
      options: ["Fixed Deposits", "Government Bonds", "Savings Accounts", "Stocks (Equity)"],
      correctAnswerIndex: 3,
      explanation: "Stocks have historically provided the highest long-term returns but experience significant short-term price fluctuations."
    },
    {
      id: "MOD_ASSESS_4",
      question: "What is compound interest?",
      options: ["Interest earned only on the original principal", "A flat fee charged by banks", "Interest calculated on the initial principal and also on the accumulated interest of previous periods", "The penalty for withdrawing money early"],
      correctAnswerIndex: 2,
      explanation: "Compound interest allows your wealth to grow exponentially because you earn returns on your returns."
    },
    {
      id: "MOD_ASSESS_5",
      question: "What does 'risk capacity' refer to in financial planning?",
      options: ["An investor's emotional ability to handle market swings", "An investor's financial ability to absorb potential losses without derailing their goals", "The maximum amount a mutual fund is allowed to invest", "The legal limit for trading stocks daily"],
      correctAnswerIndex: 1,
      explanation: "Risk capacity is an objective, financial measure of how much risk you can afford to take based on your wealth and time horizon."
    },
    {
      id: "MOD_ASSESS_6",
      question: "If an investor panics and sells all their investments during a market crash, what have they done?",
      options: ["Turned an unrealized loss into a realized loss", "Successfully rebalanced their portfolio", "Beat inflation", "Diversified their holdings"],
      correctAnswerIndex: 0,
      explanation: "A drop in asset prices is a paper (unrealized) loss until the asset is sold, at which point the loss becomes permanent (realized)."
    },
    {
      id: "MOD_ASSESS_7",
      question: "What is the primary benefit of portfolio diversification?",
      options: ["It ensures that you will never lose money", "It reduces overall risk by spreading investments across different assets", "It concentrates your wealth into the fastest-growing sector", "It eliminates the need to pay taxes on profits"],
      correctAnswerIndex: 1,
      explanation: "Diversification reduces the impact of a poor-performing asset on the overall portfolio."
    },
    {
      id: "MOD_ASSESS_8",
      question: "What is the process of 'rebalancing' a portfolio?",
      options: ["Selling all assets and keeping cash", "Changing your financial goals every year", "Buying and selling assets to return the portfolio to its original target asset allocation", "Only buying stocks that have recently gone up in price"],
      correctAnswerIndex: 2,
      explanation: "Rebalancing involves realigning the weightings of a portfolio to maintain the desired risk level and asset mix."
    },
    {
      id: "MOD_ASSESS_9",
      question: "Why might a young person saving for retirement have a high allocation to stocks?",
      options: ["Because stocks are guaranteed not to lose money", "Because they have a long time horizon to recover from short-term volatility", "Because stocks offer fixed, steady income", "Because young people are legally required to buy stocks"],
      correctAnswerIndex: 1,
      explanation: "A long investment horizon allows an investor to take on higher risk (like stocks) for higher potential returns, as they have time to ride out market dips."
    },
    {
      id: "MOD_ASSESS_10",
      question: "Holding 90% of your net worth in a single company's stock is an example of:",
      options: ["Perfect diversification", "Concentration risk", "Optimal asset allocation", "Low volatility investing"],
      correctAnswerIndex: 1,
      explanation: "This is severe concentration risk; if that single company fails, the investor loses nearly everything."
    }
  ]
};
