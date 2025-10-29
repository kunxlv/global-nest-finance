import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileDown, ChevronDown } from "lucide-react";

const assetCharts = [
  { name: "Cash", dateRange: "15 April - 21 April", color: "hsl(var(--chart-green))" },
  { name: "Equity", dateRange: "15 April - 21 April", color: "hsl(var(--chart-pink))" },
  { name: "Gold", dateRange: "15 April - 21 April", color: "hsl(var(--chart-yellow))" },
  { name: "Crypto", dateRange: "15 April - 21 April", color: "hsl(var(--chart-blue))" },
];

const assetData = [
  { valuation: "€ 1200", type: "CASH", description: "Savings account", country: "🇮🇪 Ireland", holder: "AIB", date: "NA" },
  { valuation: "$ 2890", type: "EQUITY", description: "Apple Stocks", country: "🇺🇸 U.S.A", holder: "Etoro", date: "12th Feb 2024" },
  { valuation: "€ 500", type: "CRYPTO", description: "Ethereum", country: "🇮🇪 Ireland", holder: "Binance", date: "10th Jan 2024" },
  { valuation: "₹ 500,000", type: "CASH", description: "Fixed Deposit", country: "🇮🇳 India", holder: "Axis Bank", date: "20th Dec 2023" },
  { valuation: "₹ 50,000", type: "GOLD", description: "Golden Harvest", country: "🇮🇳 India", holder: "Tanishq", date: "15th Nov 2023" },
  { valuation: "₹ 20,000", type: "EQUITY", description: "ITC Stocks", country: "🇮🇳 India", holder: "Zerodha", date: "12th June 2023" },
];

export default function Assets() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Assets.</h1>
          <div className="flex gap-3">
            <Button size="sm" className="bg-black text-white hover:bg-black/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              $ USD
            </Button>
          </div>
        </div>

        {/* Asset Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assetCharts.map((asset) => (
            <div key={asset.name} className="bg-black rounded-3xl p-6 text-white">
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-1">{asset.name}</h3>
                <p className="text-xs text-white/60">{asset.dateRange}</p>
              </div>
              <div className="h-32 flex items-end">
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  <path 
                    d="M 0,70 Q 30,50 50,55 T 100,45 T 150,60 T 200,50" 
                    fill="none" 
                    stroke={asset.color} 
                    strokeWidth="2"
                  />
                  <path 
                    d="M 0,70 Q 30,50 50,55 T 100,45 T 150,60 T 200,50 L 200,100 L 0,100 Z" 
                    fill={asset.color} 
                    opacity="0.3"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-white/50 mt-2">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>
            </div>
          ))}
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold">All assets</h2>
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
              {assetData.map((asset, index) => (
                <TableRow key={index}>
                  <TableCell className="font-semibold">{asset.valuation}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{asset.type}</Badge>
                  </TableCell>
                  <TableCell>{asset.description}</TableCell>
                  <TableCell>{asset.country}</TableCell>
                  <TableCell>{asset.holder}</TableCell>
                  <TableCell>{asset.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
