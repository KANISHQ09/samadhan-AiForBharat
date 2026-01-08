import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  FileText, 
  Shield, 
  Mic, 
  ArrowRight,
  CheckCircle2,
  Users,
  Clock
} from "lucide-react";

const stats = [
  { value: "50K+", label: "Issues Resolved", icon: CheckCircle2 },
  { value: "2.5L+", label: "Active Citizens", icon: Users },
  { value: "24hr", label: "Avg Response", icon: Clock },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen hero-gradient pt-24 pb-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8 animate-fade-in">
            <Shield className="w-4 h-4" />
            <span>AI-Powered Civic Governance Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 animate-slide-up leading-tight">
            Your Voice,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">Your City,</span>
            <br />
            Your <span className="text-secondary">Samadhan</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Report civic issues, access government schemes, and get AI-powered assistance for all your civic needs—in your language, with your voice.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" className="group">
              <MapPin className="w-5 h-5" />
              Report an Issue
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroSecondary">
              <Shield className="w-5 h-5" />
              Explore Schemes
            </Button>
            <Button variant="voice" size="lg" className="sm:w-auto">
              <Mic className="w-5 h-5" />
              Speak Now
            </Button>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
            <QuickActionCard
              icon={<MapPin className="w-6 h-6" />}
              title="Issues Near You"
              description="See and support problems in your area"
              delay="0.3s"
            />
            <QuickActionCard
              icon={<FileText className="w-6 h-6" />}
              title="Form Analyzer"
              description="AI explains any government form"
              delay="0.4s"
            />
            <QuickActionCard
              icon={<Shield className="w-6 h-6" />}
              title="Verified Schemes"
              description="Check eligibility for benefits"
              delay="0.5s"
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

function QuickActionCard({ 
  icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  delay: string;
}) {
  return (
    <a
      href="#"
      className="group glass-card p-6 rounded-2xl text-left hover:shadow-xl hover:-translate-y-1 transition-all animate-slide-up"
      style={{ animationDelay: delay }}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </a>
  );
}
