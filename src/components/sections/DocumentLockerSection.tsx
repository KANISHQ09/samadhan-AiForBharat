import { Button } from "@/components/ui/button";
import { 
  FolderLock, 
  Upload, 
  Shield, 
  Bell,
  FileText,
  CreditCard,
  GraduationCap,
  Home,
  ArrowRight,
  Lock,
  CheckCircle2
} from "lucide-react";

const documentTypes = [
  { icon: <CreditCard className="w-5 h-5" />, name: "Aadhaar Card", status: "verified" },
  { icon: <FileText className="w-5 h-5" />, name: "PAN Card", status: "verified" },
  { icon: <GraduationCap className="w-5 h-5" />, name: "Education Certificates", status: "3 files" },
  { icon: <Home className="w-5 h-5" />, name: "Property Documents", status: "expires soon" },
];

const features = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Bank-Grade Security",
    description: "End-to-end encryption for all your documents",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Smart Auto-Tagging",
    description: "AI automatically categorizes your documents",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Expiry Reminders",
    description: "Never miss a renewal deadline",
  },
  {
    icon: <Upload className="w-6 h-6" />,
    title: "Quick Reuse",
    description: "Attach documents to any application instantly",
  },
];

export function DocumentLockerSection() {
  return (
    <section id="documents" className="py-20 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <FolderLock className="w-4 h-4" />
              Secure Storage
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Your Digital{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">Document Locker</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Store all your important documents securely. Auto-tagged, always accessible, 
              and ready to attach to any government application.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-0.5">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero">
              <Lock className="w-5 h-5" />
              Open Document Locker
            </Button>
          </div>

          {/* Right - Document Preview */}
          <div className="relative">
            <div className="bg-card rounded-3xl border border-border shadow-xl p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FolderLock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">My Documents</h4>
                    <p className="text-sm text-muted-foreground">12 files • 24 MB used</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                {documentTypes.map((doc, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        {doc.icon}
                      </div>
                      <span className="font-medium text-foreground">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === "verified" && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {doc.status === "expires soon" && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                          <Bell className="w-3 h-3" />
                          Expires Soon
                        </span>
                      )}
                      {doc.status === "3 files" && (
                        <span className="text-xs text-muted-foreground">3 files</span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Tip */}
              <div className="mt-6 p-4 bg-accent/10 rounded-xl border border-accent/20">
                <p className="text-sm text-foreground">
                  <span className="font-medium">💡 Tip:</span>{" "}
                  Connect your DigiLocker for automatic document sync
                </p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-float">
              <Shield className="w-5 h-5" />
              <span className="font-medium">256-bit Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
