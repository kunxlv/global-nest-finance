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
  ChevronRight
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

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
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const DesktopSidebarContent = () => (
    <>
      {/* Logo/Brand */}
      <div className="mb-6 px-4">
        {sidebarExpanded ? (
          <h1 className="text-xl font-semibold text-sidebar-primary">finance.</h1>
        ) : (
          <div className="w-8 h-8 rounded-md bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-bold text-sidebar-accent-foreground">F</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
              )}
              title={!sidebarExpanded ? item.name : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarExpanded && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-4">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary transition-all text-sm"
          title={!sidebarExpanded ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {sidebarExpanded && <span>Settings</span>}
        </Link>
      </div>
    </>
  );

  const MobileSidebarContent = () => (
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
            <div className="w-full h-full flex items-center justify-center bg-accent/10 text-accent font-bold text-lg">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Welcome back,</p>
          <p className="font-semibold text-foreground">{profile?.display_name || 'User'}</p>
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
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                isActive 
                  ? "bg-secondary text-accent font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <Link
        to="/settings"
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar text-sidebar-foreground flex items-center justify-between px-4 z-50 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary">finance.</h1>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-card text-foreground p-6 border-r">
            <MobileSidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Collapsible with Hover */}
      <aside 
        className={cn(
          "hidden lg:flex bg-sidebar text-sidebar-foreground py-6 flex-col fixed h-screen border-r border-sidebar-border transition-all duration-300 z-40",
          sidebarExpanded ? "w-[200px]" : "w-[64px]"
        )}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <DesktopSidebarContent />
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 w-full p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300",
          sidebarExpanded ? "lg:ml-[200px]" : "lg:ml-[64px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}
