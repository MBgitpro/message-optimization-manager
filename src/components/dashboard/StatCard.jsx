import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue" }) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-green-500/10 text-green-600",
    purple: "bg-purple-500/10 text-purple-600",
    amber: "bg-amber-500/10 text-amber-600",
    red: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-500"}`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-1">{title}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
    </div>
  );
}