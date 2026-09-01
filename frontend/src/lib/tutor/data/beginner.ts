import type { TutorLevel } from "../types";

export const beginnerLevel: TutorLevel = {
  id: "BEGINNER",
  title: "Financial Foundations",
  description: "Build a strong foundation in personal finance, saving and debt.",
  sections: [
    {
      id: "financial-foundations",
      title: "Financial Foundations",
      description: "Learn the core concepts of money management.",
      lessons: [
        {
          id: "what-is-income",
          title: "What is Income?",
          learningObjective: "Understand what income is and the different ways you can earn money.",
          coreConcept: "Income is money received, especially on a regular basis, for work or through investments.",
          simpleExplanation: "Income is all the money that flows into your pocket. This includes your salary from your job, profits if you run a business, or even rent if you own a property.",
          realWorldExample: "Rahul earns ₹40,000 every month working at a tech company. He also earns ₹5,000 monthly from a side hustle selling artwork. His total monthly income is ₹45,000.",
          importantTakeaways: [
            "Income is your primary tool for wealth creation.",
            "It can come from various sources (salary, business, investments).",
            "Tracking income is the first step in budgeting."
          ],
          quiz: {
            id: "what-is-income-quiz",
            question: "Which of the following is considered income?",
            options: [
              "Paying your monthly rent",
              "Receiving ₹10,000 as a festival bonus",
              "Buying groceries for ₹3,000",
              "Paying a ₹500 utility bill"
            ],
            correctAnswerIndex: 1,
            explanation: "Income is money you receive, not money you spend. A festival bonus is an inflow of money, hence it's income."
          }
        },
        {
          id: "what-are-expenses",
          title: "What are Expenses?",
          learningObjective: "Understand what expenses are and how they impact your finances.",
          coreConcept: "An expense is the cost required for something; the money spent on something.",
          simpleExplanation: "Expenses are simply the things you spend your money on. Every time money leaves your account or wallet to pay for goods, services, or bills, that's an expense.",
          realWorldExample: "Priya spends ₹15,000 on rent, ₹5,000 on groceries, and ₹2,000 on movies every month. These are all examples of her expenses.",
          importantTakeaways: [
            "Expenses reduce the money you have available.",
            "They can be fixed (like rent) or variable (like dining out).",
            "Controlling expenses is key to saving money."
          ],
          quiz: {
            id: "what-are-expenses-quiz",
            question: "What is an expense?",
            options: [
              "Money you save in the bank",
              "Money you earn from a job",
              "Money you spend on goods and services",
              "Money you receive as a gift"
            ],
            correctAnswerIndex: 2,
            explanation: "Expenses refer to the outflow of money to pay for goods, services, or obligations."
          }
        },
        {
          id: "essential-vs-discretionary",
          title: "Essential vs Discretionary Expenses",
          learningObjective: "Differentiate between necessary expenses and \"wants\".",
          coreConcept: "Essential expenses are necessary for survival and basic living, while discretionary expenses are non-essential \"wants\".",
          simpleExplanation: "Think of essential expenses as \"Needs\" – things you must pay to survive, like food, shelter, and electricity. Discretionary expenses are \"Wants\" – things you desire but can live without, like a new video game or dining at a fancy restaurant.",
          realWorldExample: "Paying a ₹10,000 electricity and grocery bill is an essential expense. Spending ₹3,000 on concert tickets is a discretionary expense.",
          importantTakeaways: [
            "Needs must be prioritized over wants.",
            "Discretionary expenses are the easiest to cut when trying to save.",
            "Budgeting helps separate and track these two types of spending."
          ],
          quiz: {
            id: "essential-vs-discretionary-quiz",
            question: "Which of the following is an example of an essential expense?",
            options: [
              "A Netflix subscription",
              "Monthly house rent",
              "A designer watch",
              "Dining out at a restaurant"
            ],
            correctAnswerIndex: 1,
            explanation: "House rent is essential for providing shelter, making it a Need. The others are Wants."
          }
        },
        {
          id: "what-is-saving",
          title: "What is Saving?",
          learningObjective: "Understand the concept of saving and its importance.",
          coreConcept: "Saving is income not spent, or deferred consumption.",
          simpleExplanation: "Saving means setting aside a portion of your income today so you can use it in the future. It's paying your future self before you spend all your money now.",
          realWorldExample: "If Neha earns ₹50,000 a month and spends ₹40,000 on all her expenses, she can save the remaining ₹10,000 in her bank account.",
          importantTakeaways: [
            "Saving provides a safety net for the future.",
            "It requires discipline to spend less than you earn.",
            "Savings can be used for emergencies or future goals."
          ],
          quiz: {
            id: "what-is-saving-quiz",
            question: "What does 'saving' mean in personal finance?",
            options: [
              "Spending all your income immediately",
              "Borrowing money from a bank",
              "Setting aside a portion of income for future use",
              "Investing all your money in the stock market"
            ],
            correctAnswerIndex: 2,
            explanation: "Saving is the act of retaining some of your current income for future use rather than spending it all."
          }
        },
        {
          id: "monthly-surplus",
          title: "Monthly Surplus",
          learningObjective: "Learn how to calculate and utilize your monthly surplus.",
          coreConcept: "A monthly surplus occurs when your monthly income is greater than your monthly expenses.",
          simpleExplanation: "Monthly surplus is the money left over at the end of the month after all your bills and expenses have been paid. It is the fuel for your savings and investments.",
          realWorldExample: "Amit's total monthly income is ₹60,000. His total expenses for the month are ₹45,000. His monthly surplus is ₹15,000 (60,000 - 45,000).",
          importantTakeaways: [
            "Surplus = Income - Expenses.",
            "A positive surplus means you are living within your means.",
            "You should aim to increase your surplus to reach financial goals faster."
          ],
          quiz: {
            id: "monthly-surplus-quiz",
            question: "How do you calculate your monthly surplus?",
            options: [
              "Income + Expenses",
              "Income - Expenses",
              "Expenses - Income",
              "Income * Expenses"
            ],
            correctAnswerIndex: 1,
            explanation: "Your monthly surplus is whatever is left over after subtracting your expenses from your income."
          }
        },
        {
          id: "cash-flow",
          title: "Cash Flow",
          learningObjective: "Understand the concept of cash flow and its direction.",
          coreConcept: "Cash flow is the net amount of cash being transferred into and out of your personal finances.",
          simpleExplanation: "Cash flow is the movement of money. When money comes in (like your salary), it's a positive cash flow. When money goes out (like paying a bill), it's a negative cash flow. Good financial health means having a positive cash flow overall.",
          realWorldExample: "Receiving a ₹20,000 freelance payment creates a positive cash flow. Paying a ₹5,000 credit card bill creates a negative cash flow.",
          importantTakeaways: [
            "Positive cash flow increases your wealth.",
            "Negative cash flow means you are spending more than you earn.",
            "Tracking cash flow helps you understand your spending habits."
          ],
          quiz: {
            id: "cash-flow-quiz",
            question: "What does a positive cash flow indicate?",
            options: [
              "You are spending exactly what you earn",
              "You are spending more money than you earn",
              "More money is coming in than going out",
              "You have too much debt"
            ],
            correctAnswerIndex: 2,
            explanation: "Positive cash flow means your income (inflows) exceeds your expenses (outflows)."
          }
        },
        {
          id: "assets-vs-liabilities",
          title: "Assets vs Liabilities",
          learningObjective: "Differentiate between assets (things you own) and liabilities (things you owe).",
          coreConcept: "An asset puts money in your pocket or holds value. A liability takes money out of your pocket or represents a debt.",
          simpleExplanation: "Assets are things you own that have value, like a house, gold, or stocks. Liabilities are things you owe to others, like a bank loan or credit card debt. The goal is to acquire more assets and reduce liabilities.",
          realWorldExample: "Sita's ₹1,00,000 fixed deposit is an asset. The ₹50,000 personal loan she took to buy a laptop is a liability.",
          importantTakeaways: [
            "Assets increase your wealth; liabilities decrease it.",
            "Not all things you buy are assets (e.g., a car loses value).",
            "Focus on building income-generating assets."
          ],
          quiz: {
            id: "assets-vs-liabilities-quiz",
            question: "Which of the following is considered an asset?",
            options: [
              "A high-interest credit card balance",
              "A personal loan",
              "Shares in a profitable company",
              "A pending electricity bill"
            ],
            correctAnswerIndex: 2,
            explanation: "Shares are assets because they hold value and have the potential to put money in your pocket. The others are liabilities or expenses."
          }
        },
        {
          id: "net-worth",
          title: "Net Worth",
          learningObjective: "Learn how to calculate and track your net worth.",
          coreConcept: "Net worth is the value of all assets minus the total of all liabilities.",
          simpleExplanation: "Net worth is the true measure of your financial health. It's basically a snapshot of what you own minus what you owe. If you sold everything you owned today and paid off all your debts, what's left is your net worth.",
          realWorldExample: "Vikram owns a car worth ₹4,00,000 and has ₹1,00,000 in savings (Total Assets = ₹5,00,000). He owes ₹2,00,000 on an education loan (Total Liabilities = ₹2,00,000). His net worth is ₹3,00,000.",
          importantTakeaways: [
            "Net Worth = Total Assets - Total Liabilities.",
            "Your net worth can be negative if your debts exceed your assets.",
            "Increasing your net worth is the primary goal of personal finance."
          ],
          quiz: {
            id: "net-worth-quiz",
            question: "How is Net Worth calculated?",
            options: [
              "Total Assets + Total Liabilities",
              "Total Liabilities - Total Assets",
              "Total Assets - Total Liabilities",
              "Income - Expenses"
            ],
            correctAnswerIndex: 2,
            explanation: "Net worth is the difference between what you own (assets) and what you owe (liabilities)."
          }
        }
      ]
    },
    {
      id: "saving-and-emergency-fund",
      title: "Saving & Emergency Fund",
      description: "Learn how to protect yourself from financial shocks.",
      lessons: [
        {
          id: "why-emergency-funds-matter",
          title: "Why Emergency Funds Matter",
          learningObjective: "Understand the importance of having money set aside for unexpected events.",
          coreConcept: "Life is unpredictable, and financial emergencies will happen. An emergency fund provides a buffer against these shocks.",
          simpleExplanation: "Imagine losing your job or suddenly needing to pay a huge medical bill. Without savings, you might be forced into high-interest debt. An emergency fund is your financial shock absorber.",
          realWorldExample: "When a pandemic caused unexpected job losses, people with emergency funds could comfortably pay for groceries and rent for a few months while looking for new work, while those without struggled.",
          importantTakeaways: [
            "Emergencies are inevitable; preparation is optional.",
            "Emergency funds prevent you from going into debt.",
            "They provide peace of mind and reduce financial stress."
          ],
          quiz: {
            id: "why-emergency-funds-matter-quiz",
            question: "What is the primary purpose of an emergency fund?",
            options: [
              "To save up for a luxury vacation",
              "To invest in high-risk stocks",
              "To cover unexpected expenses without going into debt",
              "To pay off your regular monthly electricity bill"
            ],
            correctAnswerIndex: 2,
            explanation: "An emergency fund acts as a safety net to cover unplanned expenses so you don't have to borrow money."
          }
        },
        {
          id: "what-is-emergency-fund",
          title: "What is an Emergency Fund?",
          learningObjective: "Define what an emergency fund is and what it should be used for.",
          coreConcept: "An emergency fund is a bank account with money set aside specifically to pay for large, unexpected expenses.",
          simpleExplanation: "It's a dedicated stash of cash that you promise yourself NOT to touch unless there is a true crisis. A sale at your favorite clothing store is not an emergency. A broken down car or a hospital visit is.",
          realWorldExample: "Ravi keeps ₹1,00,000 in a separate savings account. When his bike's engine unexpectedly seized, requiring a ₹15,000 repair, he used this fund instead of swiping his credit card.",
          importantTakeaways: [
            "It should be kept separate from your daily checking account.",
            "It is for true emergencies only, not discretionary spending.",
            "It acts as self-insurance."
          ],
          quiz: {
            id: "what-is-emergency-fund-quiz",
            question: "Which of the following is a valid reason to use your emergency fund?",
            options: [
              "Buying tickets to a music concert",
              "Paying for an unexpected medical procedure",
              "Purchasing a new gaming console",
              "Upgrading your smartphone"
            ],
            correctAnswerIndex: 1,
            explanation: "A medical procedure is an unplanned, essential expense, which is exactly what an emergency fund is for."
          }
        },
        {
          id: "liquidity",
          title: "Liquidity",
          learningObjective: "Understand the concept of liquidity and its relevance to emergency funds.",
          coreConcept: "Liquidity refers to how quickly and easily an asset can be converted into cash without losing its value.",
          simpleExplanation: "Cash in your wallet is perfectly liquid. A house is very illiquid because it takes months to sell and turn into cash. Your emergency fund needs to be highly liquid so you can access it immediately when a crisis hits.",
          realWorldExample: "Putting your emergency fund in a savings account means you have instant liquidity (you can withdraw it anytime). Putting it into a 5-year locked fixed deposit reduces its liquidity.",
          importantTakeaways: [
            "Emergency funds must be highly liquid.",
            "High liquidity usually means lower interest returns.",
            "Accessibility is more important than yield for emergency money."
          ],
          quiz: {
            id: "liquidity-quiz",
            question: "Why should an emergency fund be highly liquid?",
            options: [
              "To earn the maximum possible interest rate",
              "To ensure it cannot be stolen",
              "So you can access the cash immediately when an emergency strikes",
              "To avoid paying income tax"
            ],
            correctAnswerIndex: 2,
            explanation: "Emergencies require immediate cash, so the money must be easy to access (highly liquid) without delays or penalties."
          }
        },
        {
          id: "short-term-vs-long-term",
          title: "Short-Term vs Long-Term Money",
          learningObjective: "Distinguish between money needed soon and money meant for the distant future.",
          coreConcept: "Short-term money is needed within the next 1-3 years (like an emergency fund), while long-term money is for distant goals like retirement.",
          simpleExplanation: "You shouldn't put money you might need next month into the stock market because it might go down. Short-term money belongs in safe, liquid accounts. Long-term money can be invested in riskier assets for higher growth.",
          realWorldExample: "Saving ₹50,000 for a trip next year is short-term money (keep it in a savings account). Investing ₹50,000 for retirement in 20 years is long-term money (invest in stocks or mutual funds).",
          importantTakeaways: [
            "Match your investment vehicle to your time horizon.",
            "Emergency funds are strictly short-term money.",
            "Keep short-term money safe; let long-term money grow."
          ],
          quiz: {
            id: "short-term-vs-long-term-quiz",
            question: "Where is the best place to keep short-term money, like an emergency fund?",
            options: [
              "In a volatile stock market index fund",
              "In a high-risk cryptocurrency",
              "In a safe, easily accessible savings account",
              "Tied up in real estate"
            ],
            correctAnswerIndex: 2,
            explanation: "Short-term money needs to be safe and liquid, making a savings account the best choice."
          }
        },
        {
          id: "emergency-fund-calculation",
          title: "Emergency Fund Calculation",
          learningObjective: "Learn how to calculate the target size for your emergency fund.",
          coreConcept: "A standard emergency fund should cover 3 to 6 months of essential living expenses.",
          simpleExplanation: "To calculate how much you need, add up your essential monthly expenses (rent, food, utilities, minimum debt payments). Multiply that number by 3, or up to 6 for better security. That total is your emergency fund goal.",
          realWorldExample: "If Aisha's essential living expenses are ₹20,000 per month, a 3-month emergency fund would be ₹60,000 (20,000 x 3). A 6-month fund would be ₹1,20,000.",
          importantTakeaways: [
            "Calculate based on essential expenses, not your total income.",
            "Aim for 3-6 months depending on your job stability.",
            "It's okay to start small and build it over time."
          ],
          quiz: {
            id: "emergency-fund-calculation-quiz",
            question: "If your essential monthly expenses are ₹15,000, what is a good target for a 6-month emergency fund?",
            options: [
              "₹30,000",
              "₹45,000",
              "₹60,000",
              "₹90,000"
            ],
            correctAnswerIndex: 3,
            explanation: "₹15,000 multiplied by 6 months equals ₹90,000."
          }
        },
        {
          id: "financial-safety",
          title: "Financial Safety",
          learningObjective: "Understand the psychological and practical benefits of financial safety.",
          coreConcept: "Financial safety is the state of having sufficient resources to protect against sudden financial ruin.",
          simpleExplanation: "Having a fully funded emergency fund isn't just about math; it's about peace of mind. Financial safety allows you to sleep better at night, make decisions without desperation, and handle life's curveballs with confidence.",
          realWorldExample: "When the company announced layoffs, employees with financial safety felt less panic because they knew they had 6 months of expenses saved up.",
          importantTakeaways: [
            "Financial safety reduces anxiety and stress.",
            "It gives you the freedom to walk away from bad situations (like a toxic job).",
            "It is the foundation before moving on to investing."
          ],
          quiz: {
            id: "financial-safety-quiz",
            question: "What is a major psychological benefit of achieving financial safety?",
            options: [
              "It guarantees you will become a billionaire",
              "It reduces anxiety and provides peace of mind",
              "It forces you to spend more money",
              "It eliminates all expenses in life"
            ],
            correctAnswerIndex: 1,
            explanation: "Financial safety provides a buffer against stress and anxiety, giving you peace of mind."
          }
        }
      ]
    },
    {
      id: "debt",
      title: "Debt",
      description: "Understand how borrowing works and its impact on your finances.",
      lessons: [
        {
          id: "what-is-debt",
          title: "What is Debt?",
          learningObjective: "Define debt and understand the basic mechanism of borrowing.",
          coreConcept: "Debt is money borrowed by one party from another, usually with the condition that it is to be paid back at a later date, typically with interest.",
          simpleExplanation: "Debt is simply using someone else's money today with a promise to pay it back tomorrow. When you swipe a credit card or take a loan from a bank, you are taking on debt.",
          realWorldExample: "Karan borrows ₹1,00,000 from a bank to buy a motorcycle. The ₹1,00,000 he owes the bank is his debt.",
          importantTakeaways: [
            "Debt allows you to buy things before you have the cash.",
            "It always involves an obligation to repay.",
            "Unmanaged debt can severely damage your financial health."
          ],
          quiz: {
            id: "what-is-debt-quiz",
            question: "Which of the following describes debt?",
            options: [
              "Money you earn from working",
              "Money you save in an emergency fund",
              "Money borrowed with a promise to repay",
              "Money gifted by a family member"
            ],
            correctAnswerIndex: 2,
            explanation: "Debt is fundamentally borrowed money that must be paid back."
          }
        },
        {
          id: "good-debt-vs-bad-debt",
          title: "Good Debt vs Bad Debt",
          learningObjective: "Differentiate between debt that builds wealth and debt that destroys it.",
          coreConcept: "Good debt is used to acquire assets that appreciate in value or generate income. Bad debt is used to buy depreciating assets or fund consumption.",
          simpleExplanation: "Not all debt is evil! Good debt helps you grow richer, like a loan for education (increases earning power) or a home (property value usually goes up). Bad debt makes you poorer, like high-interest credit card debt used to buy clothes or a vacation.",
          realWorldExample: "Taking a 7% interest education loan to get a degree that doubles your salary is good debt. Taking a 36% interest personal loan to buy the latest iPhone is bad debt.",
          importantTakeaways: [
            "Good debt is an investment in your future.",
            "Bad debt drains your wealth through high interest.",
            "Avoid taking on debt for things that lose value quickly."
          ],
          quiz: {
            id: "good-debt-vs-bad-debt-quiz",
            question: "Which of the following is generally considered an example of 'Bad Debt'?",
            options: [
              "A student loan for a high-paying career path",
              "A home loan (mortgage) to buy a house",
              "A business loan to expand a profitable company",
              "A high-interest personal loan to go on vacation"
            ],
            correctAnswerIndex: 3,
            explanation: "A vacation is a consumption expense that loses value immediately. Financing it with high interest is bad debt."
          }
        },
        {
          id: "interest",
          title: "Interest",
          learningObjective: "Understand what interest is and how it affects the cost of debt.",
          coreConcept: "Interest is the cost of borrowing money, usually expressed as an annual percentage rate (APR).",
          simpleExplanation: "Interest is the 'rent' you pay for using someone else's money. When you borrow, you don't just pay back the original amount; you pay back the original amount plus this extra 'rent' fee.",
          realWorldExample: "If you borrow ₹10,000 at a 10% annual interest rate, you don't just owe ₹10,000. Over a year, you will owe an additional ₹1,000 in interest, meaning you pay back ₹11,000 total.",
          importantTakeaways: [
            "Interest makes borrowing more expensive than buying with cash.",
            "Higher interest rates mean you pay much more over time.",
            "Compounding interest on debt can snowball out of control."
          ],
          quiz: {
            id: "interest-quiz",
            question: "What is interest in the context of debt?",
            options: [
              "A discount given by the bank",
              "The cost or 'fee' paid for borrowing money",
              "The original amount of money borrowed",
              "The government tax on a loan"
            ],
            correctAnswerIndex: 1,
            explanation: "Interest is the extra charge lenders apply for letting you use their money."
          }
        },
        {
          id: "emi",
          title: "EMI",
          learningObjective: "Understand Equated Monthly Installments and how loans are repaid.",
          coreConcept: "EMI stands for Equated Monthly Installment, a fixed payment amount made by a borrower to a lender at a specified date each calendar month.",
          simpleExplanation: "When you take a large loan, you don't pay it back all at once. The bank divides the total amount you owe (including interest) into equal monthly chunks. This monthly payment is your EMI.",
          realWorldExample: "Sneha took a car loan and agreed to pay ₹8,500 every month for 5 years. That ₹8,500 is her EMI.",
          importantTakeaways: [
            "An EMI consists of both principal repayment and interest.",
            "Missing an EMI can result in penalties and hurt your credit score.",
            "Longer loan tenures have smaller EMIs but cost more in total interest."
          ],
          quiz: {
            id: "emi-quiz",
            question: "What does EMI stand for?",
            options: [
              "Estimated Monthly Income",
              "Equated Monthly Installment",
              "Extra Money Invested",
              "Economic Market Index"
            ],
            correctAnswerIndex: 1,
            explanation: "EMI stands for Equated Monthly Installment, which is the fixed payment you make towards a loan each month."
          }
        },
        {
          id: "debt-to-income-ratio",
          title: "Debt-to-Income Ratio",
          learningObjective: "Learn how to measure if you have too much debt.",
          coreConcept: "The Debt-to-Income (DTI) ratio is the percentage of your gross monthly income that goes toward paying your monthly debt payments.",
          simpleExplanation: "DTI tells you how much of your paycheck is eaten up by debt before you even get to spend it on yourself. It's a quick math check to see if you are borrowing more than you can handle.",
          realWorldExample: "If Rohan earns ₹50,000 a month and his total monthly loan EMIs add up to ₹20,000, his Debt-to-Income ratio is 40% (20,000 / 50,000).",
          importantTakeaways: [
            "DTI = (Total Monthly Debt Payments / Gross Monthly Income) x 100.",
            "A lower DTI indicates better financial health.",
            "Lenders use DTI to decide whether to give you a loan."
          ],
          quiz: {
            id: "debt-to-income-ratio-quiz",
            question: "If your monthly income is ₹1,00,000 and your total monthly EMIs are ₹30,000, what is your Debt-to-Income ratio?",
            options: [
              "15%",
              "30%",
              "45%",
              "60%"
            ],
            correctAnswerIndex: 1,
            explanation: "₹30,000 is 30% of ₹1,00,000."
          }
        },
        {
          id: "debt-repayment",
          title: "Debt Repayment",
          learningObjective: "Understand strategies for paying off debt.",
          coreConcept: "Debt repayment is the process of paying back borrowed money. Strategic repayment focuses on clearing debt efficiently to save on interest.",
          simpleExplanation: "You should always pay at least the minimum required amount on all debts. But to truly get out of debt, you need a strategy. The 'Avalanche' method targets the highest interest rate debt first to save money. The 'Snowball' method targets the smallest balance first for a psychological win.",
          realWorldExample: "Ananya has a 24% interest credit card debt and a 10% personal loan. Using the Avalanche method, she pays the minimum on the personal loan and puts every extra rupee towards paying off the credit card first.",
          importantTakeaways: [
            "Always pay at least the minimum amount due on time.",
            "High-interest debt (like credit cards) is a financial emergency.",
            "Choose a strategy (Snowball or Avalanche) and stick to it."
          ],
          quiz: {
            id: "debt-repayment-quiz",
            question: "What does the 'Debt Avalanche' repayment method prioritize?",
            options: [
              "Paying off the loan with the smallest balance first",
              "Paying off the debt with the highest interest rate first",
              "Ignoring debts until the lenders call",
              "Consolidating all loans into one"
            ],
            correctAnswerIndex: 1,
            explanation: "The Avalanche method focuses on the highest interest rate first to save the most money mathematically."
          }
        },
        {
          id: "how-debt-affects-investing",
          title: "How Debt Affects Investing",
          learningObjective: "Understand the relationship between holding debt and trying to build wealth through investing.",
          coreConcept: "The mathematical return on paying off high-interest debt is guaranteed, whereas investment returns are not, making debt payoff a priority.",
          simpleExplanation: "It makes no sense to invest in the stock market hoping to earn a 12% return while simultaneously paying 24% interest on a credit card. You are losing money mathematically. Pay off toxic debt before you start investing.",
          realWorldExample: "Arjun has ₹50,000. He can either invest it in a mutual fund (expected return 10%) or pay off his credit card debt (interest rate 30%). Paying off the credit card guarantees him a 30% 'return', which is far superior.",
          importantTakeaways: [
            "High-interest debt destroys wealth faster than investments can build it.",
            "Paying off a 20% debt is mathematically identical to earning a guaranteed 20% return.",
            "Clear toxic debt before focusing heavily on investing."
          ],
          quiz: {
            id: "how-debt-affects-investing-quiz",
            question: "Why should you generally pay off high-interest credit card debt before investing in the stock market?",
            options: [
              "Because the stock market is illegal if you have debt",
              "Because the interest charged on the debt is usually much higher than the expected return from investing",
              "Because credit card companies require you to",
              "Because investments always lose money"
            ],
            correctAnswerIndex: 1,
            explanation: "The high interest rate of the debt will quickly wipe out any potential gains from the investments."
          }
        }
      ]
    }
  ],
  videos: [
    {
      title: "What is an Emergency Fund? | How to build it?",
      provider: "YouTube",
      url: "https://www.youtube.com/watch?v=5q_7Qtv_QaA",
      description: "Learn why an emergency fund is critical for financial safety and how to construct one."
    },
    {
      title: "Saving wisely: Emergency funds",
      provider: "YouTube",
      url: "https://www.youtube.com/watch?v=n4YoZDQs6VA",
      description: "Khan Academy explains the role of emergency funds in budgeting and saving."
    },
    {
      title: "Introduction to Interest",
      provider: "YouTube",
      url: "https://www.youtube.com/watch?v=Lys4EVugJmk",
      description: "Khan Academy explains the concept of interest and how it affects borrowing and saving."
    }
  ],
  assessment: [
    {
      id: "assess-beginner-1",
      question: "Which of the following best defines 'Income'?",
      options: [
        "Money you spend on daily necessities",
        "Money you receive on a regular basis for work or investments",
        "Money you owe to a financial institution",
        "Money you save in a bank account"
      ],
      correctAnswerIndex: 1,
      explanation: "Income represents the inflow of money into your finances, typically from a job, business, or investments."
    },
    {
      id: "assess-beginner-2",
      question: "Dinesh earns ₹60,000 a month. His essential expenses are ₹30,000 and his discretionary expenses are ₹10,000. What is his monthly surplus?",
      options: [
        "₹10,000",
        "₹20,000",
        "₹30,000",
        "₹40,000"
      ],
      correctAnswerIndex: 1,
      explanation: "Surplus = Income - Total Expenses. ₹60,000 - (₹30,000 + ₹10,000) = ₹20,000."
    },
    {
      id: "assess-beginner-3",
      question: "How is Net Worth calculated?",
      options: [
        "Income minus Expenses",
        "Assets plus Liabilities",
        "Assets minus Liabilities",
        "Liabilities minus Assets"
      ],
      correctAnswerIndex: 2,
      explanation: "Net worth is calculated by taking the total value of everything you own (assets) and subtracting the total of everything you owe (liabilities)."
    },
    {
      id: "assess-beginner-4",
      question: "What is the primary purpose of an emergency fund?",
      options: [
        "To earn high returns in the stock market",
        "To save for a planned vacation next year",
        "To cover unexpected financial shocks without taking on debt",
        "To pay for your regular monthly rent"
      ],
      correctAnswerIndex: 2,
      explanation: "An emergency fund acts as a financial shock absorber to handle sudden, unplanned expenses."
    },
    {
      id: "assess-beginner-5",
      question: "How many months of essential living expenses should a standard emergency fund cover?",
      options: [
        "1 to 2 months",
        "3 to 6 months",
        "12 to 24 months",
        "It doesn't matter, just save ₹10,000"
      ],
      correctAnswerIndex: 1,
      explanation: "Financial experts generally recommend keeping 3 to 6 months of essential living expenses in an emergency fund."
    },
    {
      id: "assess-beginner-6",
      question: "Why is 'liquidity' important for an emergency fund?",
      options: [
        "So you can access the cash immediately when an emergency happens",
        "Because liquid accounts offer the highest interest rates",
        "Because it prevents inflation from eating your savings",
        "So it can be easily transferred to the stock market"
      ],
      correctAnswerIndex: 0,
      explanation: "Emergencies require immediate funds, so the money must be highly liquid and easily accessible without penalties."
    },
    {
      id: "assess-beginner-7",
      question: "Which of the following is considered 'Good Debt'?",
      options: [
        "A 30% interest loan to buy a designer handbag",
        "An education loan that will significantly increase your earning potential",
        "A credit card balance carried over for months to buy a TV",
        "A personal loan taken to pay for a luxury vacation"
      ],
      correctAnswerIndex: 1,
      explanation: "Good debt is used to acquire assets or skills that appreciate in value or generate income over time, like an education."
    },
    {
      id: "assess-beginner-8",
      question: "What does a Debt-to-Income (DTI) ratio measure?",
      options: [
        "How much income you have compared to your savings",
        "The percentage of your monthly income that goes toward paying debts",
        "The total amount of debt you owe compared to your assets",
        "How much interest you are paying per month"
      ],
      correctAnswerIndex: 1,
      explanation: "DTI compares your total monthly debt payments to your gross monthly income to see how much of your paycheck is consumed by debt."
    },
    {
      id: "assess-beginner-9",
      question: "If a person has multiple debts, what is the 'Debt Avalanche' strategy?",
      options: [
        "Paying off the debt with the smallest balance first",
        "Consolidating all debts into one massive loan",
        "Paying off the debt with the highest interest rate first",
        "Ignoring the debts entirely"
      ],
      correctAnswerIndex: 2,
      explanation: "The Avalanche method prioritizes the highest interest rate debt to minimize the total amount of interest paid over time."
    },
    {
      id: "assess-beginner-10",
      question: "Why should you pay off high-interest debt (like credit cards) before investing heavily?",
      options: [
        "Because investments are guaranteed to lose money",
        "Because the high interest rate on the debt will outpace any potential investment returns",
        "Because you are legally required to be debt-free to buy stocks",
        "Because high-interest debt actually builds your net worth"
      ],
      correctAnswerIndex: 1,
      explanation: "Paying off a 24% debt guarantees a 24% return, which is far higher than what you can reliably earn in the stock market."
    }
  ]
};
