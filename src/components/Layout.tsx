import { Link, useLocation } from "react-router-dom";
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
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--sidebar-text))]/70">Welcome back,</p>
            <p className="font-semibold">Kunal Vaidya</p>
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
