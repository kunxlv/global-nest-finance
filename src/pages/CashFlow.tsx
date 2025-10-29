import Layout from "@/components/Layout";
import BankAccountCard from "@/components/BankAccountCard";
import CreditCardDisplay from "@/components/CreditCardDisplay";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function CashFlow() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Cash flow.</h1>
          <Button variant="outline" size="sm">
            $ USD
          </Button>
        </div>

        {/* Income/Expenses Tabs */}
        <Tabs defaultValue="income" className="w-full">
          <TabsList>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-6">
            {/* Income Streams */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">Income</h2>
                  <Button variant="outline" size="sm">
                    MONTHLY
                  </Button>
                </div>
                <Button size="sm" className="bg-black text-white hover:bg-black/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Income Stream
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#2a2a2a] rounded-3xl p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold">Salary</h3>
                    <Badge className="bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/30">
                      Primary
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold">$ 10,796</p>
                </div>

                <div className="bg-[#2a2a2a] rounded-3xl p-6 text-white">
                  <h3 className="font-semibold mb-4">Freelance</h3>
                  <p className="text-3xl font-bold">$ 3,400</p>
                </div>
              </div>
            </div>

            {/* Bank Accounts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Bank Accounts</h2>
                <Button size="sm" className="bg-black text-white hover:bg-black/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bank Account
                </Button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                <BankAccountCard
                  name="AIB"
                  country="Ireland"
                  balance="$ 14,382"
                  variant="purple"
                  isPrimary="Salary"
                />
                <BankAccountCard
                  name="BOI"
                  country="Ireland"
                  balance="$ 2,100"
                  variant="blue"
                />
                <BankAccountCard
                  name="REVOLUT"
                  country="Ireland"
                  balance="$ 626"
                  variant="black"
                />
                <BankAccountCard
                  name="AXIS BANK"
                  country="India"
                  balance="$ 3,483"
                  variant="pink"
                />
              </div>
            </div>

            {/* Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Cards</h2>
                <Button size="sm" className="bg-black text-white hover:bg-black/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Card
                </Button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                <CreditCardDisplay
                  bankName="AIB"
                  last4="0329"
                  holderName="HILLERY NEVELIN"
                  expiry="10/28"
                  variant="purple"
                />
                <CreditCardDisplay
                  bankName="Revolut"
                  last4="0329"
                  holderName="HILLERY NEVELIN"
                  expiry="10/28"
                  variant="black"
                />
                <CreditCardDisplay
                  bankName="Axis Bank"
                  last4="0329"
                  holderName="HILLERY NEVELIN"
                  expiry="10/28"
                  variant="pink"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Expenses tracking coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
