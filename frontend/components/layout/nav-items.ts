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
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, agent: undefined as string | undefined },
  { href: "/forecast", label: "Inflation Outlook", icon: LineChart, agent: "A1" },
  { href: "/companies", label: "Corporate Analysis", icon: Building2, agent: "A2" },
  { href: "/sectors", label: "Sector Intelligence", icon: PieChart, agent: "A3" },
  { href: "/leaderboard", label: "Corporate Leaderboard", icon: Trophy, agent: "A2" },
  { href: "/portfolio", label: "Portfolio Lab", icon: Briefcase, agent: "A3" },
  { href: "/analysis", label: "Econometric Projection", icon: Sparkles, agent: "A4" },
  { href: "/assistant", label: "Assistant", icon: Bot, agent: "RAG" },
  { href: "/salary-copilot", label: "Salary Copilot", icon: Wallet, agent: "Retail" },
  { href: "/emi-shock", label: "EMI Shock Absorber", icon: Home, agent: "Retail" },
] as const;
