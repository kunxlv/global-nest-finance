import StatCard from "@/components/StatCard";

export function NetWorthWidget() {
  return (
    <div className="h-full flex items-center justify-center">
      <StatCard 
        title="NET WORTH" 
        value="$ 37,457.4" 
        trend={11.9}
      />
    </div>
  );
}