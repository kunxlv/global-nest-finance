import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import CurrencyAmount from "@/components/CurrencyAmount";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, Pencil, Trash, Bell } from "lucide-react";
import LiabilityForm from "@/components/forms/LiabilityForm";
import { supabase, Liability, RecurringPayment } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CurrencyCode } from "@/lib/currencyConversion";
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
  const [linkedPayments, setLinkedPayments] = useState<Record<string, RecurringPayment[]>>({});
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
      
      if (data && data.length > 0) {
        const { data: payments } = await supabase
          .from("recurring_payments")
          .select("*")
          .eq("user_id", user.id)
          .not("linked_liability_id", "is", null)
          .eq("is_active", true);

        if (payments) {
          const grouped = payments.reduce((acc, payment) => {
            if (payment.linked_liability_id) {
              if (!acc[payment.linked_liability_id]) acc[payment.linked_liability_id] = [];
              acc[payment.linked_liability_id].push(payment);
            }
            return acc;
          }, {} as Record<string, RecurringPayment[]>);
          setLinkedPayments(grouped);
        }
      }
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


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Liabilities.</h1>
          <div className="flex gap-3">
            <LiabilityForm onSuccess={fetchLiabilities}>
              <Button size="sm" className="bg-black text-white hover:bg-black/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Liability</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </LiabilityForm>
          </div>
        </div>

        {/* Liabilities Table */}
        <div className="bg-white rounded-3xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">All liabilities</h2>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Amount</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[150px]">Description</TableHead>
                    <TableHead className="min-w-[100px]">Country</TableHead>
                    <TableHead className="min-w-[100px]">Lender</TableHead>
                    <TableHead className="min-w-[100px]">Interest Rate</TableHead>
                    <TableHead className="min-w-[120px]">Start Date</TableHead>
                    <TableHead className="min-w-[120px]">Linked Payments</TableHead>
                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liabilities.map((liability) => (
                    <TableRow key={liability.id}>
                      <TableCell className="font-semibold">
                        <CurrencyAmount 
                          amount={Number(liability.valuation)} 
                          originalCurrency={liability.currency as CurrencyCode}
                          showOriginal
                        />
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
                      <TableCell>
                        {linkedPayments[liability.id]?.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Bell className="w-3 h-3 mr-1" />
                            {linkedPayments[liability.id].length} payment{linkedPayments[liability.id].length !== 1 ? 's' : ''}
                          </Badge>
                        )}
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
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
