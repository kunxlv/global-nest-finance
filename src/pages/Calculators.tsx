import Layout from "@/components/Layout";
import CalculatorCard from "@/components/CalculatorCard";

const savingsCalculators = [
  {
    title: "APY",
    description: "Work out how much interest you might earn on your savings.",
    href: "#"
  },
  {
    title: "CAGR",
    description: "Work out the annual growth rate of an investment.",
    href: "#"
  },
  {
    title: "SIP",
    description: "Work out what returns you might receive made through your Systematic Investment Plan (SIP).",
    href: "#"
  },
  {
    title: "Daily compounding",
    description: "Calculate the daily compound interest/earnings you might receive on your investment.",
    href: "#"
  }
];

const debtCalculators = [
  {
    title: "Amortization",
    description: "Work out your schedule of monthly repayments and the split of principal and interest on your loan or mortgage.",
    href: "#"
  },
  {
    title: "Debt Payoff",
    description: "See how long it might take to pay off your loan and what interest you will pay.",
    href: "#"
  },
  {
    title: "Interest Rate",
    description: "Work out what interest rate you're currently paying on your loan or mortgage.",
    href: "#"
  },
  {
    title: "Credit Card Payment",
    description: "Work out effective strategies for paying off your credit card debt.",
    href: "#"
  }
];

const salaryCalculators = [
  {
    title: "Pay raise",
    description: "Calculate the pay increase for an hourly, weekly, monthly or annual salary and see how your earnings increase.",
    href: "#"
  },
  {
    title: "Overtime",
    description: "Calculate the amount of overtime pay you're due for the additional overtime hours you have worked.",
    href: "#"
  },
  {
    title: "Salary to hourly",
    description: "Convert your annual wage to an hourly pay figure and see how much you're earning per hour.",
    href: "#"
  }
];

export default function Calculators() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <h1 className="text-4xl font-bold">Calculators.</h1>

        {/* Savings & Investments */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Savings & Investments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {savingsCalculators.map((calc) => (
              <CalculatorCard key={calc.title} {...calc} />
            ))}
          </div>
        </div>

        {/* Debts & Mortgages */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Debts & Mortgages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {debtCalculators.map((calc) => (
              <CalculatorCard key={calc.title} {...calc} />
            ))}
          </div>
        </div>

        {/* Pay & Salary */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Pay & Salary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salaryCalculators.map((calc) => (
              <CalculatorCard key={calc.title} {...calc} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
