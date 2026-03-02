import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import APYCalculator from "@/components/calculators/APYCalculator";
import CAGRCalculator from "@/components/calculators/CAGRCalculator";
import SIPCalculator from "@/components/calculators/SIPCalculator";
import DailyCompoundingCalculator from "@/components/calculators/DailyCompoundingCalculator";
import AmortizationCalculator from "@/components/calculators/AmortizationCalculator";
import DebtPayoffCalculator from "@/components/calculators/DebtPayoffCalculator";
import InterestRateCalculator from "@/components/calculators/InterestRateCalculator";
import CreditCardPaymentCalculator from "@/components/calculators/CreditCardPaymentCalculator";
import PayRaiseCalculator from "@/components/calculators/PayRaiseCalculator";
import OvertimeCalculator from "@/components/calculators/OvertimeCalculator";
import SalaryToHourlyCalculator from "@/components/calculators/SalaryToHourlyCalculator";

const calculatorMap: Record<string, () => JSX.Element> = {
  apy: APYCalculator,
  cagr: CAGRCalculator,
  sip: SIPCalculator,
  "daily-compounding": DailyCompoundingCalculator,
  amortization: AmortizationCalculator,
  "debt-payoff": DebtPayoffCalculator,
  "interest-rate": InterestRateCalculator,
  "credit-card-payment": CreditCardPaymentCalculator,
  "pay-raise": PayRaiseCalculator,
  overtime: OvertimeCalculator,
  "salary-to-hourly": SalaryToHourlyCalculator,
};

export default function CalculatorDetail() {
  const { type } = useParams<{ type: string }>();
  const Calculator = type ? calculatorMap[type] : null;

  return (
    <Layout>
      {Calculator ? <Calculator /> : <p className="text-muted-foreground">Calculator not found.</p>}
    </Layout>
  );
}
