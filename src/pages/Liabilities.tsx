import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, Pencil, Trash } from "lucide-react";
import LiabilityForm from "@/components/forms/LiabilityForm";
import { supabase, Liability } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Liabilities() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLiabilities = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("liabilities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load liabilities");
      console.error(error);
    } else {
      setLiabilities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLiabilities();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("liabilities").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete liability");
    } else {
      toast.success("Liability deleted successfully");
      fetchLiabilities();
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
    };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Liabilities.</h1>
          <div className="flex gap-3">
            <LiabilityForm onSuccess={fetchLiabilities}>
              <Button size="sm" className="bg-black text-white hover:bg-black/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Liability
              </Button>
            </LiabilityForm>
          </div>
        </div>

        {/* Liabilities Table */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold">All liabilities</h2>
            <ChevronDown className="w-5 h-5" />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading liabilities...</p>
            </div>
          ) : liabilities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No liabilities yet. Add your first liability to track your debts.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Lender</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liabilities.map((liability) => (
                  <TableRow key={liability.id}>
                    <TableCell className="font-semibold">
                      {formatCurrency(Number(liability.valuation), liability.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{liability.type}</Badge>
                    </TableCell>
                    <TableCell>{liability.description}</TableCell>
                    <TableCell>{liability.country || "-"}</TableCell>
                    <TableCell>{liability.holder || "-"}</TableCell>
                    <TableCell>
                      {liability.interest_rate ? `${liability.interest_rate}%` : "-"}
                    </TableCell>
                    <TableCell>
                      {liability.start_date
                        ? new Date(liability.start_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <LiabilityForm liability={liability} onSuccess={fetchLiabilities}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </LiabilityForm>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Liability</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this liability? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(liability.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
}
