import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import RecurringPaymentForm from "@/components/forms/RecurringPaymentForm";
import PaymentAlert from "@/components/PaymentAlert";
import CurrencyAmount from "@/components/CurrencyAmount";
import { supabase, PaymentHistory, RecurringPayment } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CurrencyCode } from "@/lib/currencyConversion";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
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
import { Pencil, Trash } from "lucide-react";

type PaymentWithRecurring = PaymentHistory & {
  recurring_payment: RecurringPayment;
};

export default function Payments() {
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentWithRecurring[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentWithRecurring[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [upcomingRes, historyRes, recurringRes] = await Promise.all([
      supabase
        .from("payment_history")
        .select("*, recurring_payment:recurring_payments(*)")
        .eq("user_id", user.id)
        .eq("status", "UPCOMING")
        .lte("due_date", thirtyDaysLater)
        .order("due_date", { ascending: true }),
      
      supabase
        .from("payment_history")
        .select("*, recurring_payment:recurring_payments(*)")
        .eq("user_id", user.id)
        .in("status", ["PAID", "SKIPPED", "OVERDUE"])
        .order("due_date", { ascending: false })
        .limit(50),
      
      supabase
        .from("recurring_payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (upcomingRes.error) toast.error("Failed to load upcoming payments");
    else setUpcomingPayments(upcomingRes.data as PaymentWithRecurring[]);

    if (historyRes.error) toast.error("Failed to load payment history");
    else setPaymentHistory(historyRes.data as PaymentWithRecurring[]);

    if (recurringRes.error) toast.error("Failed to load recurring payments");
    else setRecurringPayments(recurringRes.data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleMarkAsPaid = async (historyId: string) => {
    const { error } = await supabase
      .from("payment_history")
      .update({ 
        status: "PAID", 
        paid_date: new Date().toISOString().split('T')[0] 
      })
      .eq("id", historyId);

    if (error) {
      toast.error("Failed to mark payment as paid");
    } else {
      toast.success("Payment marked as paid");
      fetchData();
    }
  };

  const handleMarkAsUnpaid = async (historyId: string) => {
    const { error } = await supabase
      .from("payment_history")
      .update({ 
        status: "UPCOMING", 
        paid_date: null 
      })
      .eq("id", historyId);

    if (error) {
      toast.error("Failed to mark payment as unpaid");
    } else {
      toast.success("Payment marked as unpaid");
      fetchData();
    }
  };

  const handleToggleActive = async (paymentId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("recurring_payments")
      .update({ is_active: !isActive })
      .eq("id", paymentId);

    if (error) {
      toast.error("Failed to update payment");
    } else {
      toast.success(`Payment ${!isActive ? "activated" : "deactivated"}`);
      fetchData();
    }
  };

  const handleDelete = async (paymentId: string) => {
    const { error } = await supabase
      .from("recurring_payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      toast.error("Failed to delete payment");
    } else {
      toast.success("Payment deleted successfully");
      fetchData();
    }
  };


  const filteredUpcoming = upcomingPayments.filter(p =>
    p.recurring_payment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = paymentHistory.filter(p =>
    p.recurring_payment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecurring = recurringPayments.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Payments.</h1>
          <RecurringPaymentForm onSuccess={fetchData}>
            <Button className="bg-black text-white hover:bg-black/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Recurring Payment</span>
              <span className="sm:hidden">Add Payment</span>
            </Button>
          </RecurringPaymentForm>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading payments...</p>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({filteredUpcoming.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                History ({filteredHistory.length})
              </TabsTrigger>
              <TabsTrigger value="recurring">
                Recurring Setup ({filteredRecurring.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {filteredUpcoming.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-2xl">
                  <p className="text-muted-foreground">
                    No upcoming payments in the next 30 days
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredUpcoming.map((payment) => (
                    <PaymentAlert
                      key={payment.id}
                      payment={payment}
                      onMarkPaid={handleMarkAsPaid}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-2xl">
                  <p className="text-muted-foreground">No payment history yet</p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Payment</TableHead>
                        <TableHead className="min-w-[100px]">Category</TableHead>
                        <TableHead className="min-w-[100px]">Amount</TableHead>
                        <TableHead className="min-w-[120px]">Due Date</TableHead>
                        <TableHead className="min-w-[120px]">Paid Date</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.recurring_payment.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {payment.recurring_payment.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <CurrencyAmount 
                              amount={Number(payment.amount)} 
                              originalCurrency={payment.currency as CurrencyCode}
                              showOriginal
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(payment.due_date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {payment.paid_date 
                              ? format(new Date(payment.paid_date), "MMM d, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === "PAID"
                                  ? "default"
                                  : payment.status === "OVERDUE"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {payment.status === "PAID" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleMarkAsUnpaid(payment.id)}
                              >
                                Mark as Unpaid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recurring">
              {filteredRecurring.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-2xl">
                  <p className="text-muted-foreground">
                    No recurring payments configured yet
                  </p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Name</TableHead>
                        <TableHead className="min-w-[100px]">Category</TableHead>
                        <TableHead className="min-w-[100px]">Amount</TableHead>
                        <TableHead className="min-w-[100px]">Frequency</TableHead>
                        <TableHead className="min-w-[120px]">Next Due</TableHead>
                        <TableHead className="min-w-[80px]">Active</TableHead>
                        <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecurring.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{payment.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <CurrencyAmount 
                              amount={Number(payment.amount)} 
                              originalCurrency={payment.currency as CurrencyCode}
                              showOriginal
                            />
                          </TableCell>
                          <TableCell>{payment.frequency}</TableCell>
                          <TableCell>
                            {format(new Date(payment.next_due_date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={payment.is_active || false}
                              onCheckedChange={() =>
                                handleToggleActive(payment.id, payment.is_active || false)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <RecurringPaymentForm payment={payment} onSuccess={fetchData}>
                                <Button variant="ghost" size="sm">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </RecurringPaymentForm>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{payment.name}"? This will
                                      also delete all payment history.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(payment.id)}>
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
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
