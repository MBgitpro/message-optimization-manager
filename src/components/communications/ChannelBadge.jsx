import { Mail, MessageSquare, Smartphone, Phone, Monitor } from "lucide-react";

const channelConfig = {
  email: { icon: Mail, label: "Email / Outlook", color: "bg-blue-500/10 text-blue-600" },
  teams: { icon: Monitor, label: "Teams", color: "bg-purple-500/10 text-purple-600" },
  text: { icon: Smartphone, label: "SMS / Text", color: "bg-green-500/10 text-green-600" },
  phone: { icon: Phone, label: "Phone", color: "bg-amber-500/10 text-amber-600" },
  in_app: { icon: MessageSquare, label: "In-App", color: "bg-cyan-500/10 text-cyan-600" },
};

export default function ChannelBadge({ channel, showLabel = true }) {
  const config = channelConfig[channel] || channelConfig.in_app;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {showLabel && config.label}
    </span>
  );
}