import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Mic, 
  Send,
  Bot,
  User,
  Sparkles,
  Volume2
} from "lucide-react";

const chatMessages = [
  {
    role: "assistant",
    content: "नमस्ते! मैं आपका सहायक हूं। मैं नागरिक समस्याओं, सरकारी योजनाओं और फॉर्म संबंधी सवालों में मदद कर सकता हूं।",
    translation: "Hello! I'm your assistant. I can help with civic issues, government schemes, and form-related questions."
  },
  {
    role: "user",
    content: "PM Kisan scheme ke liye kaise apply karun?"
  },
  {
    role: "assistant",
    content: "PM Kisan Yojana के लिए आवेदन करने के लिए:\n\n1. pmkisan.gov.in पर जाएं\n2. 'New Farmer Registration' पर क्लिक करें\n3. आधार नंबर और राज्य चुनें\n4. फॉर्म भरें और जमीन के दस्तावेज़ अपलोड करें\n\nक्या आप चाहते हैं कि मैं फॉर्म समझाऊं?",
  },
];

export function AIAssistantSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Chat Demo */}
          <div className="order-2 lg:order-1">
            <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-primary p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-foreground">Samadhan AI</h4>
                  <p className="text-xs text-primary-foreground/70">Online • Responds in Hindi & English</p>
                </div>
                <Button variant="ghost" size="iconSm" className="ml-auto text-primary-foreground hover:bg-primary-foreground/10">
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-4 h-80 overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <div 
                    key={index}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""} animate-slide-up`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === "assistant" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    }`}>
                      {message.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                      <div className={`inline-block p-3 rounded-2xl text-sm ${
                        message.role === "assistant" 
                          ? "bg-muted text-foreground rounded-tl-none" 
                          : "bg-secondary text-secondary-foreground rounded-tr-none"
                      }`}>
                        <p className="whitespace-pre-line">{message.content}</p>
                      </div>
                      {message.translation && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {message.translation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button variant="voice" size="icon">
                    <Mic className="w-5 h-5" />
                  </Button>
                  <input 
                    type="text"
                    placeholder="Type or speak your question..."
                    className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="icon">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              24/7 AI Support
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Your Personal{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">Civic Assistant</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Ask anything about civic issues, government schemes, or forms. 
              Get instant answers in Hindi, English, or your preferred language.
            </p>

            <div className="space-y-4 mb-8">
              <AssistantFeature 
                title="Multilingual Support"
                description="Speak or type in Hindi, English, or regional languages"
              />
              <AssistantFeature 
                title="Voice Interaction"
                description="Use voice commands for hands-free assistance"
              />
              <AssistantFeature 
                title="Contextual Help"
                description="Get relevant suggestions based on your queries"
              />
              <AssistantFeature 
                title="Document Assistance"
                description="Help with forms, applications, and document uploads"
              />
            </div>

            <Button variant="hero">
              <MessageSquare className="w-5 h-5" />
              Start Chatting
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AssistantFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3 h-3" />
      </div>
      <div>
        <h4 className="font-medium text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
