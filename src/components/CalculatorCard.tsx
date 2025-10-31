import { Link } from "react-router-dom";

interface CalculatorCardProps {
  title: string;
  description: string;
  href: string;
}

export default function CalculatorCard({ title, description, href }: CalculatorCardProps) {
  return (
    <Link to={href}>
      <div className="bg-card rounded-lg p-6 hover:shadow-md transition-all min-h-[140px] flex flex-col justify-between shadow-sm">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
