import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Dashboard.</h1>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Widgets
            </Button>
            <Button variant="outline" size="sm">
              $ USD
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="NET WORTH" 
            value="$ 37,457.4" 
            trend={11.9}
          />
          <StatCard 
            title="ASSETS" 
            value="$ 52,257.2" 
            trend={29.1}
          />
          <StatCard 
            title="DEBT" 
            value="$ 14,799.8" 
          />
          <div className="bg-[#2a2a2a] rounded-3xl p-6 text-white flex flex-col justify-center items-center text-center">
            <p className="text-sm mb-2 text-white/70">Get more features and strategies.</p>
            <Button variant="secondary" size="sm" className="bg-white text-black hover:bg-white/90">
              GO PRO
            </Button>
          </div>
        </div>

        {/* Salary Countdown */}
        <div className="bg-white rounded-3xl p-6 relative">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4">
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-6xl font-bold">19</span>
              <span className="text-xl ml-2">days until the next salary...</span>
            </div>
            <Button variant="link" className="underline">
              Manage Budget
            </Button>
          </div>
        </div>

        {/* Gainers and Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4">
              <X className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold mb-4">Top gainers</h2>
            <div className="flex justify-center items-center h-40">
              <div className="w-full max-w-xs h-32 bg-black rounded-2xl flex items-end p-4 relative">
                <svg className="w-full h-full absolute inset-0 p-4" viewBox="0 0 200 80">
                  <path 
                    d="M 0,60 Q 30,40 50,45 T 100,35 T 150,25 T 200,20" 
                    fill="none" 
                    stroke="hsl(var(--success))" 
                    strokeWidth="2"
                  />
                  <path 
                    d="M 0,60 Q 30,40 50,45 T 100,35 T 150,25 T 200,20 L 200,80 L 0,80 Z" 
                    fill="url(#greenGradient)" 
                    opacity="0.3"
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-white/60 text-xs absolute bottom-2 left-2">15 April - 21 April</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4">
              <X className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold mb-4">Top losers</h2>
            <div className="flex justify-center items-center h-40">
              <div className="w-full max-w-xs h-32 bg-black rounded-2xl flex items-end p-4 relative">
                <svg className="w-full h-full absolute inset-0 p-4" viewBox="0 0 200 80">
                  <path 
                    d="M 0,20 Q 30,30 50,35 T 100,45 T 150,55 T 200,60" 
                    fill="none" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth="2"
                  />
                  <path 
                    d="M 0,20 Q 30,30 50,35 T 100,45 T 150,55 T 200,60 L 200,80 L 0,80 Z" 
                    fill="url(#redGradient)" 
                    opacity="0.3"
                  />
                  <defs>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-white/60 text-xs absolute bottom-2 left-2">15 April - 21 April</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="bg-white rounded-3xl p-6 relative">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4">
            <X className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold mb-4">Upcoming Payments</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>Credit card XX87 Repayment - <span className="underline">13th June 2024</span></li>
            <li>Chase Personal Loan(10th Installment) - <span className="underline">15th June 2024</span></li>
            <li>S&P 100 Mutual Fund SIP - <span className="underline">23rd June 2024</span></li>
          </ul>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-3xl p-6 relative">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4">
            <X className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold mb-6">Goals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GoalCard
              title="Travel Fund"
              target="$500"
              current="$345"
              progress={69}
            />
            <GoalCard
              title="Retirement Fund"
              target="$20,000"
              current="$2740"
              progress={14}
              timeframe="16 years"
              assetLinked
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
