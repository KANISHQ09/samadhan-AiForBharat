import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  Timer,
  Loader2,
  Plus,
  TreePine,
  Building2
} from "lucide-react";

type IssueStatus = "reported" | "in-progress" | "resolved";

interface Issue {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  status: string;
  supports_count: number;
  created_at: string;
  user_id: string;
}

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

const Dashboard = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [supportedIssues, setSupportedIssues] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [supportingId, setSupportingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    active: 0,
    resolved: 0,
    totalSupports: 0,
  });

  const statusConfig: Record<string, { label: string; labelHi: string; class: string; icon: React.ReactNode }> = {
    reported: { 
      label: "Reported", 
      labelHi: "रिपोर्ट की गई",
      class: "status-reported",
      icon: <AlertTriangle className="w-3 h-3" />
    },
    "in-progress": { 
      label: "In Progress", 
      labelHi: "प्रगति में",
      class: "status-in-progress",
      icon: <Timer className="w-3 h-3" />
    },
    resolved: { 
      label: "Resolved", 
      labelHi: "हल",
      class: "status-resolved",
      icon: <CheckCircle2 className="w-3 h-3" />
    },
  };

  useEffect(() => {
    fetchIssues();
    if (user) {
      fetchUserSupports();
    }
  }, [user]);

  // Set up realtime subscription for issues and supports
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reported_issues',
        },
        (payload) => {
          console.log('Issue change:', payload);
          if (payload.eventType === 'INSERT') {
            setIssues(prev => [payload.new as Issue, ...prev]);
            setStats(prev => ({
              ...prev,
              active: prev.active + 1,
            }));
          } else if (payload.eventType === 'UPDATE') {
            setIssues(prev => prev.map(issue => 
              issue.id === payload.new.id ? payload.new as Issue : issue
            ));
          } else if (payload.eventType === 'DELETE') {
            setIssues(prev => prev.filter(issue => issue.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issue_supports',
        },
        (payload) => {
          console.log('Support change:', payload);
          // Refresh issues to get updated support counts
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from("reported_issues")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setIssues(data || []);
      
      // Calculate stats
      const active = data?.filter(i => i.status !== "resolved").length || 0;
      const resolved = data?.filter(i => i.status === "resolved").length || 0;
      const totalSupports = data?.reduce((sum, i) => sum + (i.supports_count || 0), 0) || 0;
      
      setStats({ active, resolved, totalSupports });
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSupports = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("issue_supports")
        .select("issue_id")
        .eq("user_id", user.id);

      if (error) throw error;
      
      setSupportedIssues(new Set(data?.map(s => s.issue_id) || []));
    } catch (error) {
      console.error("Error fetching user supports:", error);
    }
  };

  const handleSupport = async (issueId: string) => {
    if (!user) {
      toast({
        title: language === "en" ? "Sign in Required" : "साइन इन आवश्यक",
        description: language === "en" 
          ? "Please sign in to support this issue." 
          : "इस समस्या का समर्थन करने के लिए कृपया साइन इन करें।",
        variant: "destructive",
      });
      return;
    }

    setSupportingId(issueId);
    const isSupported = supportedIssues.has(issueId);

    try {
      if (isSupported) {
        // Remove support
        const { error } = await supabase
          .from("issue_supports")
          .delete()
          .eq("issue_id", issueId)
          .eq("user_id", user.id);

        if (error) throw error;

        setSupportedIssues(prev => {
          const newSet = new Set(prev);
          newSet.delete(issueId);
          return newSet;
        });

        setIssues(prev => prev.map(issue => 
          issue.id === issueId 
            ? { ...issue, supports_count: Math.max(0, issue.supports_count - 1) }
            : issue
        ));
      } else {
        // Add support
        const { error } = await supabase
          .from("issue_supports")
          .insert({ issue_id: issueId, user_id: user.id });

        if (error) throw error;

        setSupportedIssues(prev => new Set([...prev, issueId]));

        setIssues(prev => prev.map(issue => 
          issue.id === issueId 
            ? { ...issue, supports_count: issue.supports_count + 1 }
            : issue
        ));

        toast({
          title: language === "en" ? "Issue Supported!" : "समस्या समर्थित!",
          description: language === "en" 
            ? "Thank you for supporting this community issue." 
            : "इस सामुदायिक समस्या का समर्थन करने के लिए धन्यवाद।",
        });
      }
    } catch (error: any) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSupportingId(null);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (language === "en") {
      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      if (diffHours < 1) return "अभी";
      if (diffHours < 24) return `${diffHours} घंटे पहले`;
      return `${diffDays} दिन पहले`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
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
            <Link to="/report">
              <Button className="shrink-0 gap-2">
                <Plus className="w-4 h-4" />
                {language === "en" ? "Report Issue" : "समस्या दर्ज करें"}
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatCard 
              value={stats.active.toString()} 
              labelKey="issues.activeIssues" 
              trend={language === "en" ? "Active now" : "अभी सक्रिय"} 
              color="warning" 
            />
            <StatCard 
              value={stats.resolved.toString()} 
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
              value={stats.totalSupports.toString()} 
              labelKey="issues.communitySupports" 
              trend={language === "en" ? "Total" : "कुल"} 
              color="primary" 
            />
          </div>

          {/* Issues Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {language === "en" ? "No Issues Reported" : "कोई समस्या दर्ज नहीं"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {language === "en" 
                  ? "Be the first to report an issue in your community." 
                  : "अपने समुदाय में पहली समस्या दर्ज करने वाले बनें।"}
              </p>
              <Link to="/report">
                <Button>
                  {language === "en" ? "Report an Issue" : "समस्या दर्ज करें"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {issues.map((issue, index) => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  index={index} 
                  statusConfig={statusConfig}
                  isSupported={supportedIssues.has(issue.id)}
                  isSupporting={supportingId === issue.id}
                  onSupport={() => handleSupport(issue.id)}
                  getTimeAgo={getTimeAgo}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

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
  statusConfig,
  isSupported,
  isSupporting,
  onSupport,
  getTimeAgo,
}: { 
  issue: Issue; 
  index: number;
  statusConfig: Record<string, { label: string; labelHi: string; class: string; icon: React.ReactNode }>;
  isSupported: boolean;
  isSupporting: boolean;
  onSupport: () => void;
  getTimeAgo: (date: string) => string;
}) {
  const { language } = useLanguage();
  const status = statusConfig[issue.status] || statusConfig.reported;
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
            </div>
          </div>
          <div className={`status-badge ${status.class}`}>
            {status.icon}
            {language === "en" ? status.label : status.labelHi}
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
              {getTimeAgo(issue.created_at)}
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
            {language === "en" ? "Support" : "समर्थन"} ({issue.supports_count})
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
