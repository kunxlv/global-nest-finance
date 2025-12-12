import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import BankAccountCard from "@/components/BankAccountCard";
import CreditCardDisplay from "@/components/CreditCardDisplay";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash, Bell } from "lucide-react";
import IncomeStreamForm from "@/components/forms/IncomeStreamForm";
import BankAccountForm from "@/components/forms/BankAccountForm";
import CardForm from "@/components/forms/CardForm";
import { supabase, IncomeStream, BankAccount, Card, RecurringPayment } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, CurrencyCode } from "@/lib/currencyConversion";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
export default function CashFlow() {
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [linkedPayments, setLinkedPayments] = useState<Record<string, RecurringPayment[]>>({});
  const [loading, setLoading] = useState(true);
  const {
    user
  } = useAuth();
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [incomeRes, bankRes, cardsRes, paymentsRes] = await Promise.all([supabase.from("income_streams").select("*").eq("user_id", user.id), supabase.from("bank_accounts").select("*").eq("user_id", user.id), supabase.from("cards").select("*").eq("user_id", user.id), supabase.from("recurring_payments").select("*").eq("user_id", user.id).eq("is_active", true)]);
    if (incomeRes.error) toast.error("Failed to load income streams");else setIncomeStreams(incomeRes.data || []);
    if (bankRes.error) toast.error("Failed to load bank accounts");else setBankAccounts(bankRes.data || []);
    if (cardsRes.error) toast.error("Failed to load cards");else setCards(cardsRes.data || []);
    if (paymentsRes.data) {
      const grouped = paymentsRes.data.reduce((acc, payment) => {
        if (payment.linked_card_id) {
          if (!acc[payment.linked_card_id]) acc[payment.linked_card_id] = [];
          acc[payment.linked_card_id].push(payment);
        }
        return acc;
      }, {} as Record<string, RecurringPayment[]>);
      setLinkedPayments(grouped);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, [user]);
  const deleteIncomeStream = async (id: string) => {
    const {
      error
    } = await supabase.from("income_streams").delete().eq("id", id);
    if (error) toast.error("Failed to delete income stream");else {
      toast.success("Income stream deleted");
      fetchData();
    }
  };
  const deleteBankAccount = async (id: string) => {
    const {
      error
    } = await supabase.from("bank_accounts").delete().eq("id", id);
    if (error) toast.error("Failed to delete bank account");else {
      toast.success("Bank account deleted");
      fetchData();
    }
  };
  const deleteCard = async (id: string) => {
    const {
      error
    } = await supabase.from("cards").delete().eq("id", id);
    if (error) toast.error("Failed to delete card");else {
      toast.success("Card deleted");
      fetchData();
    }
  };
  return <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-bold">Cash flow.</h1>
        </div>

        {loading ? <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div> : <Tabs defaultValue="income" className="w-full">
            <TabsList>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="space-y-6">
              {/* Income Streams */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold">Income</h2>
                  <IncomeStreamForm onSuccess={fetchData}>
                    <Button size="sm" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Add Income Stream</span>
                      <span className="sm:hidden">Add Income</span>
                    </Button>
                  </IncomeStreamForm>
                </div>

                {incomeStreams.length === 0 ? <div className="card-empty">
                    <p className="text-muted-foreground">No income streams yet. Add one to get started!</p>
                  </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {incomeStreams.map(income => <div key={income.id} className="card-interactive p-6 relative">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-semibold text-secondary-foreground">{income.name}</h3>
                          <div className="flex gap-1">
                            {income.is_primary && <Badge variant="success">
                                Primary
                              </Badge>}
                            <IncomeStreamForm incomeStream={income} onSuccess={fetchData}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Pencil className="w-3 h-3" />
                              </Button>
                            </IncomeStreamForm>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <Trash className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Income Stream</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{income.name}"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteIncomeStream(income.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-secondary-foreground">
                          {formatCurrency(Number(income.amount), income.currency as CurrencyCode)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 uppercase">{income.frequency}</p>
                      </div>)}
                  </div>}
              </div>

              {/* Bank Accounts */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold">Bank Accounts</h2>
                  <BankAccountForm onSuccess={fetchData}>
                    <Button size="sm" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Add Bank Account</span>
                      <span className="sm:hidden">Add Account</span>
                    </Button>
                  </BankAccountForm>
                </div>

                {bankAccounts.length === 0 ? <div className="card-empty">
                    <p className="text-muted-foreground">No bank accounts yet. Add one to track your balances!</p>
                  </div> : <div className="flex gap-4 overflow-x-auto pb-2">
                    {bankAccounts.map(account => <div key={account.id} className="relative group">
                        <BankAccountCard name={account.name} country={account.country || ""} balance={formatCurrency(Number(account.balance), account.currency as CurrencyCode)} variant={account.color_variant as "purple" | "blue" | "black" | "pink"} isPrimary={account.is_primary ? "Primary" : undefined} />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <BankAccountForm bankAccount={account} onSuccess={fetchData}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white hover:bg-white/20">
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </BankAccountForm>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white hover:bg-white/20">
                                <Trash className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{account.name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteBankAccount(account.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>)}
                  </div>}
              </div>

              {/* Cards */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold">Cards</h2>
                  <CardForm onSuccess={fetchData}>
                    <Button size="sm" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Card
                    </Button>
                  </CardForm>
                </div>

                {cards.length === 0 ? <div className="card-empty">
                    <p className="text-muted-foreground">No cards yet. Add one to track your credit cards!</p>
                  </div> : <div className="flex gap-4 overflow-x-auto pb-2">
                    {cards.map(card => <div key={card.id} className="relative group">
                        <CreditCardDisplay bankName={card.bank_name} last4={card.last_four} holderName={card.holder_name} expiry={card.expiry} variant={card.color_variant as "purple" | "blue" | "black" | "pink"} />
                        {linkedPayments[card.id]?.length > 0 && <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
                            <Bell className="w-3 h-3 mr-1" />
                            {linkedPayments[card.id].length} payment{linkedPayments[card.id].length !== 1 ? 's' : ''}
                          </Badge>}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CardForm card={card} onSuccess={fetchData}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white hover:bg-white/20">
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </CardForm>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white hover:bg-white/20">
                                <Trash className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Card</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete card ending in {card.last_four}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCard(card.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>)}
                  </div>}
              </div>
            </TabsContent>

            <TabsContent value="expenses">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Expenses tracking coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>}
      </div>
    </Layout>;
}