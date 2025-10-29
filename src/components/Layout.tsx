import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  RefreshCw, 
  Building2, 
  Landmark, 
  Target, 
  Calculator,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cash Flow", href: "/cash-flow", icon: RefreshCw },
  { name: "Assets", href: "/assets", icon: Building2 },
  { name: "Liabilities", href: "/liabilities", icon: Landmark },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Calculators", href: "/calculators", icon: Calculator },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-text))] p-6 flex flex-col fixed h-screen">
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
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
