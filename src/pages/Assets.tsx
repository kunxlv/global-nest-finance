import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Package } from "lucide-react";
import AssetForm from "@/components/forms/AssetForm";
import AssetCard from "@/components/assets/AssetCard";
import AssetSummary from "@/components/assets/AssetSummary";
import AssetFilters from "@/components/assets/AssetFilters";
import { supabase, Asset, RecurringPayment } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CurrencyCode } from "@/lib/currencyConversion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [linkedPayments, setLinkedPayments] = useState<Record<string, RecurringPayment[]>>({});
  const [linkedGoals, setLinkedGoals] = useState<Record<string, {
    id: string;
    title: string;
  }>>({});
  const [loading, setLoading] = useState(true);
  const {
    user
  } = useAuth();
  const {
    convertToDisplayCurrency
  } = useCurrency();

  // Filter and sort states
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [holderFilter, setHolderFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("valuation_desc");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  // Edit dialog state
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const fetchAssets = async () => {
    if (!user) return;
    setLoading(true);
    const {
      data,
      error
    } = await supabase.from("assets").select("*").eq("user_id", user.id).order("created_at", {
      ascending: false
    });
    if (error) {
      toast.error("Failed to load assets");
      console.error(error);
    } else {
      setAssets(data || []);
      if (data && data.length > 0) {
        const {
          data: payments
        } = await supabase.from("recurring_payments").select("*").eq("user_id", user.id).not("linked_asset_id", "is", null).eq("is_active", true);
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
        const {
          data: goalLinks
        } = await supabase.from("goal_assets").select("asset_id, goals(id, title)").eq("user_id", user.id);
        if (goalLinks) {
          const goalsMap: Record<string, {
            id: string;
            title: string;
          }> = {};
          goalLinks.forEach((link: any) => {
            if (link.goals) {
              goalsMap[link.asset_id] = {
                id: link.goals.id,
                title: link.goals.title
              };
            }
          });
          setLinkedGoals(goalsMap);
        }
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchAssets();
  }, [user]);
  const handleDelete = async () => {
    if (!assetToDelete) return;
    const {
      error
    } = await supabase.from("assets").delete().eq("id", assetToDelete);
    if (error) {
      toast.error("Failed to delete asset");
    } else {
      toast.success("Asset deleted successfully");
      fetchAssets();
    }
    setDeleteDialogOpen(false);
    setAssetToDelete(null);
  };
  const clearFilters = () => {
    setTypeFilter("ALL");
    setCountryFilter("ALL");
    setHolderFilter("ALL");
  };

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Apply filters
    if (typeFilter !== "ALL") {
      result = result.filter(a => a.type === typeFilter);
    }
    if (countryFilter !== "ALL") {
      result = result.filter(a => a.country === countryFilter);
    }
    if (holderFilter !== "ALL") {
      result = result.filter(a => a.holder === holderFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "valuation_desc":
          return convertToDisplayCurrency(Number(b.valuation), b.currency as CurrencyCode) - convertToDisplayCurrency(Number(a.valuation), a.currency as CurrencyCode);
        case "valuation_asc":
          return convertToDisplayCurrency(Number(a.valuation), a.currency as CurrencyCode) - convertToDisplayCurrency(Number(b.valuation), b.currency as CurrencyCode);
        case "date_desc":
          return new Date(b.purchase_date || b.created_at || 0).getTime() - new Date(a.purchase_date || a.created_at || 0).getTime();
        case "date_asc":
          return new Date(a.purchase_date || a.created_at || 0).getTime() - new Date(b.purchase_date || b.created_at || 0).getTime();
        case "name_asc":
          return a.description.localeCompare(b.description);
        case "name_desc":
          return b.description.localeCompare(a.description);
        default:
          return 0;
      }
    });
    return result;
  }, [assets, typeFilter, countryFilter, holderFilter, sortBy, convertToDisplayCurrency]);
  return <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Assets.</h1>
            <p className="text-muted-foreground mt-1">Track and manage your portfolio</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <AssetForm onSuccess={fetchAssets}>
              <Button size="sm" className="flex-1 sm:flex-initial">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Asset</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </AssetForm>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
              <FileDown className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Summary Section */}
        <AssetSummary assets={assets} isLoading={loading} />

        {/* All Assets Section */}
        <div className="bg-card rounded-3xl border border-border/50 p-5">
          <h2 className="text-lg font-semibold mb-4 text-secondary-foreground">All Assets</h2>
          
          {/* Filters */}
          <AssetFilters typeFilter={typeFilter} countryFilter={countryFilter} holderFilter={holderFilter} sortBy={sortBy} onTypeChange={setTypeFilter} onCountryChange={setCountryFilter} onHolderChange={setHolderFilter} onSortChange={setSortBy} onClearFilters={clearFilters} className="rounded-xl shadow-lg" />

          {/* Asset Cards Grid */}
          {loading ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-muted/50 rounded-2xl p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-muted rounded-2xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-6 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                </div>)}
            </div> : filteredAssets.length === 0 ? <div className="bg-muted/30 rounded-2xl p-12 text-center mt-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No assets found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {assets.length === 0 ? "Start building your portfolio by adding your first asset." : "No assets match your current filters. Try adjusting them."}
              </p>
              {assets.length === 0 && <AssetForm onSuccess={fetchAssets}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Asset
                  </Button>
                </AssetForm>}
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
              {filteredAssets.map(asset => <AssetCard key={asset.id} asset={asset} linkedPayments={linkedPayments[asset.id]} linkedGoal={linkedGoals[asset.id]} onEdit={() => {
            setEditingAsset(asset);
            setEditDialogOpen(true);
          }} onDelete={() => {
            setAssetToDelete(asset.id);
            setDeleteDialogOpen(true);
          }} className="rounded-xl shadow-lg" />)}
            </div>}
        </div>

        {/* Edit Dialog */}
        {editingAsset && <AssetForm asset={editingAsset} onSuccess={() => {
        fetchAssets();
        setEditDialogOpen(false);
        setEditingAsset(null);
      }} open={editDialogOpen} onOpenChange={open => {
        setEditDialogOpen(open);
        if (!open) setEditingAsset(null);
      }} />}

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Asset</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this asset? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>;
}