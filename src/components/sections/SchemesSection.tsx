import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Sparkles,
  AlertCircle
} from "lucide-react";

interface Scheme {
  id: string;
  title: string;
  description: string;
  category: string;
  eligibility: string[];
  deadline?: string;
  isEligible: boolean;
  trustScore: number;
  icon: React.ReactNode;
}

const schemes: Scheme[] = [
  {
    id: "1",
    title: "PM Awas Yojana - Urban",
    description: "Financial assistance for construction of pucca house to eligible urban poor",
    category: "Housing",
    eligibility: ["Annual income < ₹3L", "No pucca house"],
    deadline: "March 2026",
    isEligible: true,
    trustScore: 98,
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: "2",
    title: "Ayushman Bharat Yojana",
    description: "Health coverage of ₹5 lakh per family per year for secondary and tertiary care",
    category: "Healthcare",
    eligibility: ["SECC database listed", "No other insurance"],
    isEligible: true,
    trustScore: 100,
    icon: <Heart className="w-5 h-5" />,
  },
  {
    id: "3",
    title: "PM Vishwakarma Scheme",
    description: "Support for traditional artisans with skill training and financial assistance",
    category: "Employment",
    eligibility: ["Traditional artisan", "Age 18+"],
    isEligible: false,
    trustScore: 95,
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    id: "4",
    title: "National Scholarship Portal",
    description: "Various scholarships for students from pre-matric to post-doctoral level",
    category: "Education",
    eligibility: ["Student status", "Income criteria varies"],
    deadline: "December 2025",
    isEligible: true,
    trustScore: 100,
    icon: <GraduationCap className="w-5 h-5" />,
  },
];

export function SchemesSection() {
  return (
    <section id="schemes" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Verified Government Schemes
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Benefits You May Be Eligible For
          </h2>
          <p className="text-muted-foreground">
            AI-verified schemes with authenticity checks. Never miss a benefit you deserve.
          </p>
        </div>

        {/* Eligible Highlight */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">You may be eligible for 3 schemes</h3>
              <p className="text-sm text-muted-foreground">Based on your profile and location</p>
            </div>
          </div>
          <Button variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
            Check All Eligibility
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {schemes.map((scheme, index) => (
            <SchemeCard key={scheme.id} scheme={scheme} index={index} />
          ))}
        </div>

        {/* Fake Policy Warning */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">Beware of Fake Policies</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our AI detects and flags misleading or fake government schemes. Always verify authenticity before applying.
            </p>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Report Fake Scheme
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SchemeCard({ scheme, index }: { scheme: Scheme; index: number }) {
  return (
    <div 
      className="group bg-card rounded-2xl border border-border shadow-card hover:shadow-lg transition-all overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {scheme.icon}
            </div>
            <div>
              <Badge variant="secondary" className="text-xs mb-1">
                {scheme.category}
              </Badge>
              {scheme.deadline && (
                <p className="text-xs text-warning font-medium">
                  Deadline: {scheme.deadline}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded-full">
            <Shield className="w-3 h-3 text-accent" />
            <span className="text-xs font-medium text-accent">{scheme.trustScore}%</span>
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {scheme.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {scheme.description}
        </p>

        {/* Eligibility */}
        <div className="flex flex-wrap gap-2 mb-4">
          {scheme.eligibility.map((item, i) => (
            <span 
              key={i}
              className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-lg text-xs"
            >
              <Users className="w-3 h-3" />
              {item}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {scheme.isEligible ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              <CheckCircle2 className="w-4 h-4" />
              You may be eligible
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Check eligibility
            </span>
          )}
          <Button variant="ghost" size="sm" className="gap-1">
            Learn More
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
