import Layout from "@/components/Layout";
import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Goals() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Goals.</h1>
          <div className="flex gap-3">
            <Button size="sm" className="bg-black text-white hover:bg-black/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
            <Button variant="outline" size="sm">
              $ USD
            </Button>
          </div>
        </div>

        {/* Short Term Goals */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Short term goals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GoalCard
              title="Travel Fund"
              target="$500"
              current="$345"
              progress={69}
            />
            <GoalCard
              title="Wedding fund"
              target="$20,000"
              current="$2740"
              progress={14}
              assetLinked
            />
            <GoalCard
              title="Emergency Fund"
              target="$5000"
              current="$500"
              progress={10}
            />
          </div>
        </div>

        {/* Long Term Goals */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Long term goals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GoalCard
              title="Education Fund"
              target="$50,000"
              current="$900"
              progress={2}
              timeframe="7 years"
              assetLinked
            />
            <GoalCard
              title="Retirement Fund"
              target="$500,000"
              current="$2740"
              progress={1}
              timeframe="16 years"
              assetLinked
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
