import { Link } from "react-router-dom";

interface CalculatorCardProps {
  title: string;
  description: string;
  href: string;
}

export default function CalculatorCard({ title, description, href }: CalculatorCardProps) {
  return (
    <Link to={href}>
      <div className="bg-[#2a2a2a] rounded-3xl p-6 text-white hover:bg-[#333333] transition-colors min-h-[140px] flex flex-col justify-between">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/70 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
