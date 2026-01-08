import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  ThumbsUp, 
  Clock, 
  ArrowRight,
  Droplets,
  Trash2,
  Zap,
  Construction,
  AlertTriangle,
  CheckCircle2,
  Timer
} from "lucide-react";

type IssueStatus = "reported" | "in-progress" | "resolved";

interface Issue {
  id: string;
  title: string;
  category: string;
  location: string;
  distance: string;
  status: IssueStatus;
  supports: number;
  timeAgo: string;
  image?: string;
}

const issues: Issue[] = [
  {
    id: "1",
    title: "Broken water pipeline causing flooding",
    category: "Water Supply",
    location: "Sector 21, Main Road",
    distance: "0.5 km",
    status: "in-progress",
    supports: 156,
    timeAgo: "2 hours ago",
  },
  {
    id: "2",
    title: "Garbage not collected for 3 days",
    category: "Sanitation",
    location: "Green Park Colony",
    distance: "0.8 km",
    status: "reported",
    supports: 89,
    timeAgo: "5 hours ago",
  },
  {
    id: "3",
    title: "Street lights not working",
    category: "Electricity",
    location: "Market Area, Block B",
    distance: "1.2 km",
    status: "resolved",
    supports: 234,
    timeAgo: "1 day ago",
  },
  {
    id: "4",
    title: "Pothole on main highway causing accidents",
    category: "Roads",
    location: "NH-48 Junction",
    distance: "1.5 km",
    status: "in-progress",
    supports: 312,
    timeAgo: "3 days ago",
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  "Water Supply": <Droplets className="w-4 h-4" />,
  "Sanitation": <Trash2 className="w-4 h-4" />,
  "Electricity": <Zap className="w-4 h-4" />,
  "Roads": <Construction className="w-4 h-4" />,
};

const statusConfig: Record<IssueStatus, { label: string; class: string; icon: React.ReactNode }> = {
  reported: { 
    label: "Reported", 
    class: "status-reported",
    icon: <AlertTriangle className="w-3 h-3" />
  },
  "in-progress": { 
    label: "In Progress", 
    class: "status-in-progress",
    icon: <Timer className="w-3 h-3" />
  },
  resolved: { 
    label: "Resolved", 
    class: "status-resolved",
    icon: <CheckCircle2 className="w-3 h-3" />
  },
};

export function IssuesNearYou() {
  return (
    <section id="dashboard" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <MapPin className="w-4 h-4" />
              Near Your Location
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Issues Near You
            </h2>
            <p className="text-muted-foreground">
              Support problems affecting your community. Together, we make change happen.
            </p>
          </div>
          <Button variant="outline" className="shrink-0">
            View All Issues
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard value="23" label="Active Issues" trend="+5 this week" color="warning" />
          <StatCard value="156" label="Resolved" trend="This month" color="accent" />
          <StatCard value="18hrs" label="Avg. Response" trend="↓ 2hrs faster" color="info" />
          <StatCard value="1.2K" label="Community Supports" trend="+200 today" color="primary" />
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.map((issue, index) => (
            <IssueCard key={issue.id} issue={issue} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ 
  value, 
  label, 
  trend, 
  color 
}: { 
  value: string; 
  label: string; 
  trend: string; 
  color: "primary" | "accent" | "warning" | "info";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
      <p className={`text-3xl font-bold mb-1 ${colorClasses[color].split(" ")[1]}`}>{value}</p>
      <p className="text-sm font-medium text-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground">{trend}</p>
    </div>
  );
}

function IssueCard({ issue, index }: { issue: Issue; index: number }) {
  const status = statusConfig[issue.status];
  const categoryIcon = categoryIcons[issue.category] || <AlertTriangle className="w-4 h-4" />;

  return (
    <div 
      className="group bg-card rounded-2xl border border-border shadow-card hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              {categoryIcon}
            </div>
            <div>
              <Badge variant="secondary" className="text-xs mb-1">
                {issue.category}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {issue.distance} away
              </div>
            </div>
          </div>
          <div className={`status-badge ${status.class}`}>
            {status.icon}
            {status.label}
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {issue.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {issue.location}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {issue.timeAgo}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary">
            <ThumbsUp className="w-4 h-4" />
            Support ({issue.supports})
          </Button>
        </div>
      </div>
    </div>
  );
}
