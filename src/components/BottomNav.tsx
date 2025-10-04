import { NavLink } from "react-router-dom";
import { Home, Clock, CheckSquare, Settings } from "lucide-react";

const BottomNav = () => {
  const navItems = [
    { to: "/", icon: Home, label: "首页" },
    { to: "/timepool", icon: Clock, label: "时间池" },
    { to: "/todos", icon: CheckSquare, label: "任务" },
    { to: "/settings", icon: Settings, label: "设置" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-smooth ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
