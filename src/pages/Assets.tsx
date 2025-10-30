import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileDown, ChevronDown, Pencil, Trash, Bell } from "lucide-react";
import AssetForm from "@/components/forms/AssetForm";
import RecurringPaymentForm from "@/components/forms/RecurringPaymentForm";
import { supabase, Asset, RecurringPayment } from "@/lib/supabase";
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

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [linkedPayments, setLinkedPayments] = useState<Record<string, RecurringPayment[]>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAssets = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load assets");
      console.error(error);
    } else {
      setAssets(data || []);
      
      if (data && data.length > 0) {
        const { data: payments } = await supabase
          .from("recurring_payments")
          .select("*")
          .eq("user_id", user.id)
          .not("linked_asset_id", "is", null)
          .eq("is_active", true);

        if (payments) {
          const grouped = payments.reduce((acc, payment) => {
            if (payment.linked_asset_id) {
              if (!acc[payment.linked_asset_id]) acc[payment.linked_asset_id] = [];
              acc[payment.linked_asset_id].push(payment);
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
    fetchAssets();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete asset");
    } else {
      toast.success("Asset deleted successfully");
      fetchAssets();
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
          <h1 className="text-4xl font-bold">Assets.</h1>
          <div className="flex gap-3">
            <AssetForm onSuccess={fetchAssets}>
              <Button size="sm" className="bg-black text-white hover:bg-black/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </AssetForm>
            <Button variant="outline" size="sm">
              <FileDown className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold">All assets</h2>
            <ChevronDown className="w-5 h-5" />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading assets...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No assets yet. Add your first asset to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valuation</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Holder</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Linked Payments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-semibold">
                      {formatCurrency(Number(asset.valuation), asset.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{asset.type}</Badge>
                    </TableCell>
                    <TableCell>{asset.description}</TableCell>
                    <TableCell>{asset.country || "-"}</TableCell>
                    <TableCell>{asset.holder || "-"}</TableCell>
                    <TableCell>
                      {asset.purchase_date
                        ? new Date(asset.purchase_date).toLocaleDateString()
                        : "NA"}
                    </TableCell>
                    <TableCell>
                      {linkedPayments[asset.id]?.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Bell className="w-3 h-3 mr-1" />
                          {linkedPayments[asset.id].length} payment{linkedPayments[asset.id].length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AssetForm asset={asset} onSuccess={fetchAssets}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </AssetForm>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this asset? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(asset.id)}>
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
