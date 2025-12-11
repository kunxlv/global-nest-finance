import { Link } from "react-router-dom";
interface CalculatorCardProps {
  title: string;
  description: string;
  href: string;
}
export default function CalculatorCard({
  title,
  description,
  href
}: CalculatorCardProps) {
  return <Link to={href}>
      <div className="bg-card rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[140px] flex flex-col justify-between shadow-sm">
        <h3 className="text-xl font-semibold mb-2 text-secondary-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Link>;
}