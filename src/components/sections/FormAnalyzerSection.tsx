import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Upload, 
  Mic, 
  Volume2, 
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Languages,
  HelpCircle
} from "lucide-react";

const features = [
  {
    icon: <Upload className="w-5 h-5" />,
    title: "Upload Any Form",
    description: "PDF, image, or link to any government form",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI Analysis",
    description: "Instant explanation of purpose and requirements",
  },
  {
    icon: <Volume2 className="w-5 h-5" />,
    title: "Audio Guidance",
    description: "Listen to step-by-step instructions in your language",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Ask Questions",
    description: "Get answers about any field or requirement",
  },
];

const sampleQuestions = [
  "What documents do I need?",
  "Which fields are mandatory?",
  "Am I eligible for this form?",
  "What's the submission deadline?",
];

export function FormAnalyzerSection() {
  return (
    <section id="analyzer" className="py-20 bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full text-secondary text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Key Feature
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              AI Form Analyzer with{" "}
              <span className="text-secondary">Audio Guidance</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Upload any government form and get instant, simple explanations with voice narration. 
              Never struggle with complex forms again.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-0.5">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="saffron" size="lg">
                <Upload className="w-5 h-5" />
                Upload a Form
              </Button>
              <Button variant="voice" size="lg">
                <Mic className="w-5 h-5" />
                Describe Form
              </Button>
            </div>
          </div>

          {/* Right - Interactive Demo */}
          <div className="relative">
            <div className="bg-card rounded-3xl border border-border shadow-xl p-6 sm:p-8">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center mb-6 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Drop your form here</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse • PDF, JPG, PNG
                </p>
                <Button variant="outline" size="sm">
                  Browse Files
                </Button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Audio Language</span>
                </div>
                <select className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>हिंदी (Hindi)</option>
                  <option>English</option>
                  <option>தமிழ் (Tamil)</option>
                  <option>తెలుగు (Telugu)</option>
                </select>
              </div>

              {/* Sample Questions */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions.map((question, index) => (
                    <button 
                      key={index}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-sm text-foreground transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Preview */}
              <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-4">
                <Button variant="default" size="icon" className="shrink-0">
                  <Volume2 className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                  <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary rounded-full" />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">1:23 / 4:56</span>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-float">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">100% Accessible</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
