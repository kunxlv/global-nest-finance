import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ASSET_TYPES = ["ALL", "CASH", "EQUITY", "CRYPTO", "GOLD", "REAL_ESTATE", "OTHER"];
const COUNTRIES = ["ALL", "India", "USA", "Ireland", "UAE", "UK", "Germany", "Singapore", "Australia", "Canada"];
const HOLDERS = ["ALL", "Self", "Spouse", "Joint", "Parent", "Child"];
const SORT_OPTIONS = [
  { value: "valuation_desc", label: "Highest Value" },
  { value: "valuation_asc", label: "Lowest Value" },
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
];

interface AssetFiltersProps {
  typeFilter: string;
  countryFilter: string;
  holderFilter: string;
  sortBy: string;
  onTypeChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onHolderChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function AssetFilters({
  typeFilter,
  countryFilter,
  holderFilter,
  sortBy,
  onTypeChange,
  onCountryChange,
  onHolderChange,
  onSortChange,
  onClearFilters,
}: AssetFiltersProps) {
  const hasActiveFilters =
    typeFilter !== "ALL" || countryFilter !== "ALL" || holderFilter !== "ALL";

  return (
    <div className="bg-card rounded-3xl border border-border/50 shadow-xl p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Filter icon and label */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Type filter */}
          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "ALL" ? "All Types" : type.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Country filter */}
          <Select value={countryFilter} onValueChange={onCountryChange}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country === "ALL" ? "All Countries" : country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Holder filter */}
          <Select value={holderFilter} onValueChange={onHolderChange}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Holder" />
            </SelectTrigger>
            <SelectContent>
              {HOLDERS.map((holder) => (
                <SelectItem key={holder} value={holder}>
                  {holder === "ALL" ? "All Holders" : holder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-9 px-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
