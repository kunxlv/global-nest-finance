import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  RefreshCw, 
  Building2, 
  Landmark, 
  Target, 
  Calculator,
  Settings,
  Bell,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cash Flow", href: "/cash-flow", icon: RefreshCw },
  { name: "Assets", href: "/assets", icon: Building2 },
  { name: "Liabilities", href: "/liabilities", icon: Landmark },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Payments", href: "/payments", icon: Bell },
  { name: "Calculators", href: "/calculators", icon: Calculator },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!loading && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [profile, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">finance.</h1>
      </div>

      {/* User Profile */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] font-bold text-lg">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--sidebar-text))]/70">Welcome back,</p>
          <p className="font-semibold">{profile?.display_name || 'User'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-[hsl(var(--sidebar-hover))]" 
                  : "hover:bg-[hsl(var(--sidebar-hover))]"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <Link
        to="/settings"
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
      >
        <Settings className="w-5 h-5" />
        <span className="font-medium">Settings</span>
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-text))] flex items-center justify-between px-4 z-50">
        <h1 className="text-xl font-bold">finance.</h1>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-[hsl(var(--sidebar-text))]">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-text))] p-6 border-r-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-text))] p-6 flex-col fixed h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
