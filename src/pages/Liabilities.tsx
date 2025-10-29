import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown } from "lucide-react";

const liabilityData = [
  { valuation: "€ 1200", type: "CASH", description: "Savings account", country: "🇮🇪 Ireland", holder: "AIB", date: "NA" },
  { valuation: "$ 2890", type: "EQUITY", description: "Apple Stocks", country: "🇺🇸 U.S.A", holder: "Etoro", date: "12th Feb 2024" },
  { valuation: "€ 500", type: "CRYPTO", description: "Ethereum", country: "🇮🇪 Ireland", holder: "Binance", date: "10th Jan 2024" },
  { valuation: "₹ 500,000", type: "CASH", description: "Fixed Deposit", country: "🇮🇳 India", holder: "Axis Bank", date: "20th Dec 2023" },
  { valuation: "₹ 50,000", type: "GOLD", description: "Golden Harvest", country: "🇮🇳 India", holder: "Tanishq", date: "15th Nov 2023" },
  { valuation: "₹ 20,000", type: "EQUITY", description: "ITC Stocks", country: "🇮🇳 India", holder: "Zerodha", date: "12th June 2023" },
];

export default function Liabilities() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Liabilities.</h1>
          <div className="flex gap-3">
            <Button size="sm" className="bg-black text-white hover:bg-black/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Liability
            </Button>
            <Button variant="outline" size="sm">
              $ USD
            </Button>
          </div>
        </div>

        {/* Liabilities Table */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold">All liabilities</h2>
            <ChevronDown className="w-5 h-5" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Valuation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Holder</TableHead>
                <TableHead>Purchase Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liabilityData.map((liability, index) => (
                <TableRow key={index}>
                  <TableCell className="font-semibold">{liability.valuation}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{liability.type}</Badge>
                  </TableCell>
                  <TableCell>{liability.description}</TableCell>
                  <TableCell>{liability.country}</TableCell>
                  <TableCell>{liability.holder}</TableCell>
                  <TableCell>{liability.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
