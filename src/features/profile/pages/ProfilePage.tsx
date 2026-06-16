import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { useAuth } from "@/features/auth";
import { useProfileData } from "../hooks/useProfileData";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { STATUS_LABELS } from "@/shared/constants/statuses";
import { IssueStatus } from "@/shared/types/domain/IssueStatus";
import { ROUTES } from "@/shared/config/routes";
import { LoadingState } from "@/shared/components/LoadingState";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  User,
  FileText,
  Bell,
  MapPin,
  Phone,
  Mail,
  Home,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Clock,
  LogOut
} from "lucide-react";

const statusConfig: Record<string, { class: string; icon: React.ReactNode }> = {
  [IssueStatus.REPORTED]: { 
    class: "bg-warning/15 text-warning",
    icon: <AlertTriangle className="w-3 h-3" />
  },
  [IssueStatus.IN_PROGRESS]: { 
    class: "bg-info/15 text-info",
    icon: <Timer className="w-3 h-3" />
  },
  [IssueStatus.RESOLVED]: { 
    class: "bg-accent/15 text-accent",
    icon: <CheckCircle2 className="w-3 h-3" />
  },
  [IssueStatus.REJECTED]: { 
    class: "bg-destructive/15 text-destructive",
    icon: <AlertTriangle className="w-3 h-3" />
  },
};

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "profile";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const [subTab, setSubTab] = useState<"reported" | "supported">("reported");

  const {
    profile,
    setProfile,
    issues,
    supportedIssues,
    notifications,
    loading,
    saving,
    handleProfileUpdate,
    handleNotificationUpdate,
  } = useProfileData(user, language);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LANDING);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState message={language === "en" ? "Loading profile..." : "प्रोफ़ाइल लोड हो रही है..."} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {language === "en" ? "My Profile" : "मेरी प्रोफ़ाइल"}
            </h1>
            <p className="text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            {language === "en" ? "Sign Out" : "साइन आउट"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === "en" ? "Profile" : "प्रोफ़ाइल"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === "en" ? "My Issues" : "मेरी समस्याएं"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === "en" ? "Notifications" : "अधिसूचनाएं"}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      {language === "en" ? "Full Name" : "पूरा नाम"}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        value={profile?.fullName || ""}
                        onChange={(e) => setProfile(p => p ? {...p, fullName: e.target.value} : null)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {language === "en" ? "Phone Number" : "फ़ोन नंबर"}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profile?.phone || ""}
                        onChange={(e) => setProfile(p => p ? {...p, phone: e.target.value} : null)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    {language === "en" ? "Address" : "पता"}
                  </Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={profile?.address || ""}
                      onChange={(e) => setProfile(p => p ? {...p, address: e.target.value} : null)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      {language === "en" ? "City" : "शहर"}
                    </Label>
                    <Input
                      id="city"
                      value={profile?.city || ""}
                      onChange={(e) => setProfile(p => p ? {...p, city: e.target.value} : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      {language === "en" ? "State" : "राज्य"}
                    </Label>
                    <Input
                      id="state"
                      value={profile?.state || ""}
                      onChange={(e) => setProfile(p => p ? {...p, state: e.target.value} : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">
                      {language === "en" ? "Pincode" : "पिनकोड"}
                    </Label>
                    <Input
                      id="pincode"
                      value={profile?.pincode || ""}
                      onChange={(e) => setProfile(p => p ? {...p, pincode: e.target.value} : null)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {language === "en" ? "Saving..." : "सहेजा जा रहा है..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {language === "en" ? "Save Changes" : "बदलाव सहेजें"}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
              {/* Sub-tabs / Pills for Reported vs Supported */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-4 mb-6 gap-4">
                <div className="flex bg-muted p-1 rounded-xl w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSubTab("reported")}
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      subTab === "reported"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {language === "en" ? `Reported (${issues.length})` : `दर्ज की गई (${issues.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubTab("supported")}
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      subTab === "supported"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {language === "en" ? `Supported (${supportedIssues.length})` : `समर्थित (${supportedIssues.length})`}
                  </button>
                </div>
                <Button size="sm" onClick={() => navigate(ROUTES.REPORT_ISSUE)} className="w-full sm:w-auto">
                  {language === "en" ? "Report New" : "नई रिपोर्ट"}
                </Button>
              </div>

              {subTab === "reported" ? (
                issues.length === 0 ? (
                  <EmptyState
                    title={language === "en" ? "No Issues Reported" : "कोई समस्या दर्ज नहीं"}
                    description={
                      language === "en" 
                        ? "You haven't reported any civic issues yet." 
                        : "आपने अभी तक कोई नागरिक समस्या दर्ज नहीं की है।"
                    }
                    actionText={language === "en" ? "Report an Issue" : "समस्या दर्ज करें"}
                    onAction={() => navigate(ROUTES.REPORT_ISSUE)}
                  />
                ) : (
                  <div className="space-y-4">
                    {issues.map((issue) => {
                      const status = statusConfig[issue.status] || statusConfig[IssueStatus.REPORTED];
                      const localizedLabel = STATUS_LABELS[issue.status]?.[language] || issue.status;
                      return (
                        <div 
                          key={issue.id}
                          className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => navigate(`${ROUTES.DASHBOARD}?issueId=${issue.id}`)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {issue.category}
                                </Badge>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.class}`}>
                                  {status.icon}
                                  {localizedLabel}
                                </span>
                              </div>
                              <h4 className="font-medium text-foreground mb-1">
                                {issue.title}
                              </h4>
                              {issue.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {issue.location}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <div className="flex items-center gap-1 justify-end">
                                <Clock className="w-3 h-3" />
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </div>
                              <p className="text-xs mt-1">
                                {issue.supportsCount} {language === "en" ? "supports" : "समर्थन"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                supportedIssues.length === 0 ? (
                  <EmptyState
                    title={language === "en" ? "No Supported Issues" : "कोई समर्थित समस्या नहीं"}
                    description={
                      language === "en" 
                        ? "You haven't supported or upvoted any issues yet." 
                        : "आपने अभी तक किसी समस्या का समर्थन या वोट नहीं किया है।"
                    }
                    actionText={language === "en" ? "Browse Issues" : "समस्याएं देखें"}
                    onAction={() => navigate(ROUTES.DASHBOARD)}
                  />
                ) : (
                  <div className="space-y-4">
                    {supportedIssues.map((issue) => {
                      const status = statusConfig[issue.status] || statusConfig[IssueStatus.REPORTED];
                      const localizedLabel = STATUS_LABELS[issue.status]?.[language] || issue.status;
                      return (
                        <div 
                          key={issue.id}
                          className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => navigate(`${ROUTES.DASHBOARD}?issueId=${issue.id}`)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {issue.category}
                                </Badge>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.class}`}>
                                  {status.icon}
                                  {localizedLabel}
                                </span>
                              </div>
                              <h4 className="font-medium text-foreground mb-1">
                                {issue.title}
                              </h4>
                              {issue.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {issue.location}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <div className="flex items-center gap-1 justify-end">
                                <Clock className="w-3 h-3" />
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </div>
                              <p className="text-xs mt-1">
                                {issue.supportsCount} {language === "en" ? "supports" : "समर्थन"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-card">
              <div>
                <h3 className="font-semibold text-foreground mb-4">
                  {language === "en" ? "Notification Channels" : "अधिसूचना चैनल"}
                </h3>
                <div className="space-y-4">
                  <NotificationToggle
                    label={language === "en" ? "Email Notifications" : "ईमेल अधिसूचनाएं"}
                    description={language === "en" ? "Receive updates via email" : "ईमेल द्वारा अपडेट प्राप्त करें"}
                    checked={notifications?.email_notifications || false}
                    onCheckedChange={(v) => handleNotificationUpdate("email_notifications", v)}
                    icon={<Mail className="w-5 h-5" />}
                  />
                  <NotificationToggle
                    label={language === "en" ? "SMS Notifications" : "SMS अधिसूचनाएं"}
                    description={language === "en" ? "Receive updates via SMS" : "SMS द्वारा अपडेट प्राप्त करें"}
                    checked={notifications?.sms_notifications || false}
                    onCheckedChange={(v) => handleNotificationUpdate("sms_notifications", v)}
                    icon={<Phone className="w-5 h-5" />}
                  />
                  <NotificationToggle
                    label={language === "en" ? "Push Notifications" : "पुश अधिसूचनाएं"}
                    description={language === "en" ? "Receive push notifications in browser" : "ब्राउज़र में पुश अधिसूचनाएं प्राप्त करें"}
                    checked={notifications?.push_notifications || false}
                    onCheckedChange={(v) => handleNotificationUpdate("push_notifications", v)}
                    icon={<Bell className="w-5 h-5" />}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-4">
                  {language === "en" ? "Notification Types" : "अधिसूचना प्रकार"}
                </h3>
                <div className="space-y-4">
                  <NotificationToggle
                    label={language === "en" ? "Issue Updates" : "समस्या अपडेट"}
                    description={language === "en" ? "Get notified when your issues are updated" : "जब आपकी समस्याएं अपडेट हों तो सूचित करें"}
                    checked={notifications?.issue_updates || false}
                    onCheckedChange={(v) => handleNotificationUpdate("issue_updates", v)}
                  />
                  <NotificationToggle
                    label={language === "en" ? "Scheme Alerts" : "योजना अलर्ट"}
                    description={language === "en" ? "New schemes matching your profile" : "आपकी प्रोफ़ाइल से मेल खाती नई योजनाएं"}
                    checked={notifications?.scheme_alerts || false}
                    onCheckedChange={(v) => handleNotificationUpdate("scheme_alerts", v)}
                  />
                  <NotificationToggle
                    label={language === "en" ? "Document Reminders" : "दस्तावेज़ अनुस्मारक"}
                    description={language === "en" ? "Expiry and renewal reminders" : "समाप्ति और नवीनीकरण अनुस्मारक"}
                    checked={notifications?.document_reminders || false}
                    onCheckedChange={(v) => handleNotificationUpdate("document_reminders", v)}
                  />
                  <NotificationToggle
                    label={language === "en" ? "Weekly Digest" : "साप्ताहिक सारांश"}
                    description={language === "en" ? "Weekly summary of activity in your area" : "आपके क्षेत्र में गतिविधि का साप्ताहिक सारांश"}
                    checked={notifications?.weekly_digest || false}
                    onCheckedChange={(v) => handleNotificationUpdate("weekly_digest", v)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onCheckedChange,
  icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-all">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
