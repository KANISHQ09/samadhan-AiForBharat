import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { useAuth } from "@/features/auth";
import { useDashboardIssues } from "../hooks/useDashboardIssues";
import { Issue } from "@/shared/types/domain/Issue";
import { IssueStatus } from "@/shared/types/domain/IssueStatus";
import { ROUTES } from "@/shared/config/routes";
import { STATUS_LABELS, STATUSES } from "@/shared/constants/statuses";
import { CATEGORY_LABELS } from "@/shared/constants/categories";
import { LoadingState } from "@/shared/components/LoadingState";
import { EmptyState } from "@/shared/components/EmptyState";
import { 
  MapPin, 
  ThumbsUp, 
  Clock, 
  Droplets,
  Trash2,
  Zap,
  Construction,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Loader2,
  Plus,
  TreePine,
  Building2
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  "Water Supply": <Droplets className="w-4 h-4" />,
  "जल आपूर्ति": <Droplets className="w-4 h-4" />,
  "Sanitation": <Trash2 className="w-4 h-4" />,
  "स्वच्छता": <Trash2 className="w-4 h-4" />,
  "Electricity": <Zap className="w-4 h-4" />,
  "बिजली": <Zap className="w-4 h-4" />,
  "Roads": <Construction className="w-4 h-4" />,
  "सड़कें": <Construction className="w-4 h-4" />,
  "Parks & Gardens": <TreePine className="w-4 h-4" />,
  "पार्क और बगीचे": <TreePine className="w-4 h-4" />,
  "Buildings": <Building2 className="w-4 h-4" />,
  "भवन": <Building2 className="w-4 h-4" />,
};

const statusConfig: Record<string, { class: string; icon: React.ReactNode }> = {
  [IssueStatus.REPORTED]: { 
    class: "status-reported",
    icon: <AlertTriangle className="w-3 h-3" />
  },
  [IssueStatus.IN_PROGRESS]: { 
    class: "status-in-progress",
    icon: <Timer className="w-3 h-3" />
  },
  [IssueStatus.RESOLVED]: { 
    class: "status-resolved",
    icon: <CheckCircle2 className="w-3 h-3" />
  },
};

import { getTimeAgo as getTimeAgoUtil } from "@/shared/utils/time";

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    issues,
    supportedIssues,
    loading,
    supportingId,
    stats,
    handleSupport,
  } = useDashboardIssues(user, language);

  const getTimeAgo = (date: Date) => getTimeAgoUtil(date, language);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            {t("issues.badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {t("issues.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("issues.subtitle")}
          </p>
        </div>
        <Link to={ROUTES.REPORT_ISSUE}>
          <Button className="shrink-0 gap-2">
            <Plus className="w-4 h-4" />
            {language === "en" ? "Report Issue" : "समस्या दर्ज करें"}
          </Button>
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard 
          value={stats.activeCount.toString()} 
          labelKey="issues.activeIssues" 
          trend={language === "en" ? "Active now" : "अभी सक्रिय"} 
          color="warning" 
        />
        <StatCard 
          value={stats.resolvedCount.toString()} 
          labelKey="issues.resolved" 
          trend={language === "en" ? "All time" : "कुल"} 
          color="accent" 
        />
        <StatCard 
          value="18hrs" 
          labelKey="issues.avgResponseTime" 
          trend={language === "en" ? "↓ Faster" : "↓ तेज"} 
          color="info" 
        />
        <StatCard 
          value={stats.totalSupportsCount.toString()} 
          labelKey="issues.communitySupports" 
          trend={language === "en" ? "Total" : "कुल"} 
          color="primary" 
        />
      </div>

      {/* Issues Grid */}
      {loading ? (
        <LoadingState message={language === "en" ? "Loading issues..." : "समस्याएं लोड हो रही हैं..."} />
      ) : issues.length === 0 ? (
        <EmptyState
          title={language === "en" ? "No Issues Reported" : "कोई समस्या दर्ज नहीं"}
          description={
            language === "en" 
              ? "Be the first to report an issue in your community." 
              : "अपने समुदाय में पहली समस्या दर्ज करने वाले बनें।"
          }
          actionText={language === "en" ? "Report an Issue" : "समस्या दर्ज करें"}
          onAction={() => navigate(ROUTES.REPORT_ISSUE)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.map((issue, index) => (
            <IssueCard 
              key={issue.id} 
              issue={issue} 
              index={index} 
              isSupported={supportedIssues.has(issue.id)}
              isSupporting={supportingId === issue.id}
              onSupport={() => handleSupport(issue.id)}
              getTimeAgo={getTimeAgo}
              activeLanguage={language}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  value, 
  labelKey, 
  trend, 
  color 
}: { 
  value: string; 
  labelKey: string; 
  trend: string; 
  color: "primary" | "accent" | "warning" | "info";
}) {
  const { t } = useLanguage();
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
      <p className={`text-3xl font-bold mb-1 ${colorClasses[color].split(" ")[1]}`}>{value}</p>
      <p className="text-sm font-medium text-foreground mb-1">{t(labelKey)}</p>
      <p className="text-xs text-muted-foreground">{trend}</p>
    </div>
  );
}

function IssueCard({ 
  issue, 
  index,
  isSupported,
  isSupporting,
  onSupport,
  getTimeAgo,
  activeLanguage,
}: { 
  issue: Issue; 
  index: number;
  isSupported: boolean;
  isSupporting: boolean;
  onSupport: () => void;
  getTimeAgo: (date: Date) => string;
  activeLanguage: "en" | "hi";
}) {
  const { t } = useLanguage();
  const config = statusConfig[issue.status] || statusConfig[IssueStatus.REPORTED];
  const categoryIcon = categoryIcons[issue.category] || <AlertTriangle className="w-4 h-4" />;
  const localizedStatusLabel = STATUS_LABELS[issue.status]?.[activeLanguage] || issue.status;

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
            </div>
          </div>
          <div className={`status-badge ${config.class}`}>
            {config.icon}
            {localizedStatusLabel}
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {issue.title}
        </h3>
        {issue.location && (
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{issue.location}</span>
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTimeAgo(issue.createdAt)}
            </span>
          </div>
          <Button 
            variant={isSupported ? "default" : "ghost"} 
            size="sm" 
            className={`gap-2 ${isSupported ? "" : "text-primary hover:text-primary"}`}
            onClick={onSupport}
            disabled={isSupporting}
          >
            {isSupporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ThumbsUp className={`w-4 h-4 ${isSupported ? "fill-current" : ""}`} />
            )}
            {activeLanguage === "en" ? "Support" : "समर्थन"} ({issue.supportsCount})
          </Button>
        </div>
      </div>
    </div>
  );
}
