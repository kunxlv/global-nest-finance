import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!loading && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [profile, loading, navigate]);

  // Auto-close sidebar after 10 seconds, reset timer on any interaction
  useEffect(() => {
    if (sidebarExpanded) {
      // Clear existing timer
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      
      // Set new timer
      closeTimerRef.current = setTimeout(() => {
        setSidebarExpanded(false);
      }, 10000);
    }
    
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, [sidebarExpanded, location.pathname]); // Reset timer when route changes

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  };

  const handleCloseSidebar = () => {
    setSidebarExpanded(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  };

  const handleNavClick = () => {
    // Reset the auto-close timer when navigating
    if (sidebarExpanded && closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setSidebarExpanded(false);
      }, 10000);
    }
  };

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
      {/* Logo/Brand with Close Button */}
      <div className="mb-8 px-4 flex items-center justify-between">
        {sidebarExpanded ? (
          <>
            <h1 className={cn(
              "text-xl font-bold text-sidebar-primary whitespace-nowrap transition-all duration-300",
              sidebarExpanded ? "opacity-100 delay-100" : "opacity-0"
            )}>
              finance.
            </h1>
            <button
              onClick={handleCloseSidebar}
              className={cn(
                "p-1.5 rounded-lg hover:bg-sidebar-accent transition-all duration-300",
                sidebarExpanded ? "opacity-100 delay-150" : "opacity-0"
              )}
            >
              <X className="w-4 h-4 text-sidebar-foreground" />
            </button>
          </>
        ) : (
          <button
            onClick={handleSidebarToggle}
            className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center shadow-sm hover:bg-sidebar-accent/80 transition-colors"
          >
            <span className="text-base font-bold text-sidebar-accent-foreground">F</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary hover:shadow-sm"
              )}
              title={!sidebarExpanded ? item.name : undefined}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform duration-300",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-sm font-semibold whitespace-nowrap transition-all duration-300",
                sidebarExpanded ? "opacity-100 delay-150 translate-x-0" : "opacity-0 -translate-x-2 absolute"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-4">
        <Link
          to="/settings"
          onClick={handleNavClick}
          className="flex items-center gap-4 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary transition-all duration-300 hover:shadow-sm group"
          title={!sidebarExpanded ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:rotate-90" />
          <span className={cn(
            "text-sm font-semibold whitespace-nowrap transition-all duration-300",
            sidebarExpanded ? "opacity-100 delay-150 translate-x-0" : "opacity-0 -translate-x-2 absolute"
          )}>
            Settings
          </span>
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

      {/* Desktop Sidebar - Collapsible with Manual Control */}
      <aside 
        className={cn(
          "hidden lg:flex bg-sidebar text-sidebar-foreground py-6 flex-col fixed h-screen border-r border-sidebar-border z-40 shadow-lg",
          "transition-all duration-500 ease-in-out",
          sidebarExpanded ? "w-[220px]" : "w-[76px]"
        )}
        onMouseEnter={() => !sidebarExpanded && setSidebarExpanded(true)}
      >
        <DesktopSidebarContent />
      </aside>

      {/* Main Content with Page Transition */}
      <main 
        className={cn(
          "flex-1 w-full p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8",
          "transition-all duration-500 ease-in-out",
          sidebarExpanded ? "lg:ml-[220px]" : "lg:ml-[76px]"
        )}
      >
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
