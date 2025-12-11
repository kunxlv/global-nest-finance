import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { LayoutDashboard, RefreshCw, Building2, Landmark, Target, Calculator, Settings, Bell, Menu, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
const navigation = [{
  name: "Dashboard",
  href: "/",
  icon: LayoutDashboard
}, {
  name: "Cash Flow",
  href: "/cash-flow",
  icon: RefreshCw
}, {
  name: "Assets",
  href: "/assets",
  icon: Building2
}, {
  name: "Liabilities",
  href: "/liabilities",
  icon: Landmark
}, {
  name: "Goals",
  href: "/goals",
  icon: Target
}, {
  name: "Payments",
  href: "/payments",
  icon: Bell
}, {
  name: "Calculators",
  href: "/calculators",
  icon: Calculator
}];
export default function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    profile,
    loading
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!loading && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [profile, loading, navigate]);
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>;
  }
  const NavItem = ({
    item,
    onClick
  }: {
    item: typeof navigation[0];
    onClick?: () => void;
  }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;
    return <Link to={item.href} onClick={onClick} className="relative flex items-center justify-center w-12 h-12 group" title={item.name}>
        {/* Icon container */}
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200", isActive ? "bg-card text-card-foreground shadow-md" : "text-muted-foreground hover:bg-card/50 hover:text-card-foreground")}>
          <Icon className="w-5 h-5" />
        </div>
      </Link>;
  };
  const MobileSidebarContent = () => <div className="flex flex-col h-full py-6">
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-accent-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">FINANCE</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-accent/20 text-accent font-semibold">
                {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <p className="font-medium text-foreground">{profile?.display_name || 'User'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return <Link key={item.name} to={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200", isActive ? "bg-card text-card-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-card/50 hover:text-card-foreground")}>
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>;
      })}
      </nav>

      {/* Settings */}
      <div className="px-4 pt-4">
        <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-card/50 hover:text-card-foreground transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </Link>
      </div>
    </div>;
  return <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-accent-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">FINANCE</span>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-background border-r border-border p-0">
            <MobileSidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Minimal Icon Only */}
      <aside className="hidden lg:flex w-[72px] bg-background py-6 flex-col fixed h-screen z-40">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
            <Wallet className="w-5 h-5 text-accent-foreground" />
          </div>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col items-center gap-1 px-2">
          {navigation.map(item => <NavItem key={item.name} item={item} />)}
        </nav>

        {/* Settings */}
        <div className="flex flex-col items-center px-2">
          <Link to="/settings" className="relative flex items-center justify-center w-12 h-12 group" title="Settings">
            <div className={cn("flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200", location.pathname === "/settings" ? "bg-card text-card-foreground shadow-md" : "text-muted-foreground hover:bg-card/50 hover:text-card-foreground")}>
              <Settings className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full pt-14 lg:pt-0 lg:ml-[72px]">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 border-0">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>;
}