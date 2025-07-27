import { Link, useLocation } from "wouter";
import { 
  Home, Briefcase, Calendar, Users, Car, Package, 
  Truck, Receipt, BarChart, Download, Settings, Wrench 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Vehicles", href: "/vehicles", icon: Car },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Receipts", href: "/receipts", icon: Receipt },
  { name: "Reports", href: "/reports", icon: BarChart },
  { name: "Backup", href: "/backup", icon: Download },
];

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location === "/" || location === "/dashboard";
    }
    return location === href;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      {/* Logo Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-wrench-green rounded flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">WRENCH'D</h1>
            <p className="text-xs text-gray-500">Workshop Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? "bg-wrench-light text-wrench-dark"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings at Bottom */}
      <div className="absolute bottom-4 left-4 right-4">
        <Link 
          href="/settings"
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            isActive("/settings")
              ? "bg-wrench-light text-wrench-dark"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
