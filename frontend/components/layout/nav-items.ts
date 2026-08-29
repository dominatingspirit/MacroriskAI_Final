import {
  Bot,
  Briefcase,
  Building2,
  Home,
  LayoutDashboard,
  LineChart,
  PieChart,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/forecast", label: "Inflation Outlook", icon: LineChart },
  { href: "/companies", label: "Corporate Analysis", icon: Building2 },
    { href: "/sectors", label: "Sector Intelligence", icon: PieChart },
  { href: "/leaderboard", label: "Corporate Leaderboard", icon: Trophy },
  { href: "/portfolio", label: "Portfolio Lab", icon: Briefcase },
  { href: "/analysis", label: "Econometric Projection", icon: Sparkles },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/salary-copilot", label: "Salary Copilot", icon: Wallet },
  { href: "/emi-shock", label: "EMI Shock Absorber", icon: Home },
] as const;
