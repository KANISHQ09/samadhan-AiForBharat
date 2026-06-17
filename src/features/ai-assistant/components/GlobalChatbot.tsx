import { Button } from "@/shared/components/ui/button";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import { ROUTES } from "@/shared/config/routes";
import {
  FileText, Upload, Mic, Volume2, MessageSquare,
  CheckCircle2, Sparkles, Languages, HelpCircle,
  Bot, User, Send, Loader2, MicOff, AlertCircle,
  Check, Clock, ExternalLink, RefreshCw, X,
  FileQuestion, MapPin, DollarSign, Calendar, Info, Play, Square, LogIn
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { aiService } from "../services/aiService";
import { useToast } from "@/shared/hooks/use-toast";

/* ---------------- SAMPLE QUESTIONS ---------------- */
const sampleQuestions = {
  en: [
    "What documents do I need for Aadhaar update?",
    "Am I eligible for PM-Kisan?",
    "What is the PMAY Urban subsidy?",
    "How to apply for Ayushman Bharat?",
  ],
  hi: [
    "आधार सुधार के लिए कौन से दस्तावेज चाहिए?",
    "क्या मैं पीएम-किसान के लिए पात्र हूँ?",
    "पीएमएवाई अर्बन सब्सिडी क्या है?",
    "आयुष्मान भारत के लिए आवेदन कैसे करें?",
  ],
};

export function GlobalChatbot() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  /* ---------------- AUTHENTICATION STATE ---------------- */
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------------- CHAT STATE ---------------- */
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: language === "hi"
        ? "नमस्ते! मैं आपके फॉर्म, सरकारी योजनाओं और अन्य नागरिक प्रश्नों में सहायता कर सकता हूँ।"
        : "Hello! I can help with forms, government schemes & queries.",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  /* ---------------- SPEECH RECOGNITION ---------------- */
  const isSpeechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSpeechSupported) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInputValue(transcript);
    };
    recognitionRef.current.onend = () => setIsListening(false);
  }, [language, isSpeechSupported]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  /* ---------------- CHAT SEND ---------------- */
  const handleSend = async (directText?: string) => {
    const textToSend = directText || inputValue;
    if (!textToSend.trim()) return;

    // Reject locally if not logged in
    if (!session) {
      toast({
        title: language === "hi" ? "लॉगिन आवश्यक है" : "Login Required",
        description: language === "hi" ? "चैट का उपयोग करने के लिए कृपया साइन इन करें।" : "Please sign in to chat with Samadhan AI.",
        variant: "destructive",
      });
      return;
    }

    const userMsg = { role: "user" as const, content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!directText) setInputValue("");
    setIsChatLoading(true);

    let assistantText = "";

    await aiService.streamChat({
      messages: [...messages, userMsg],
      onDelta: (chunk) => {
        assistantText += chunk;
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { role: "assistant" as const, content: assistantText },
            ];
          } else {
            return [
              ...prev,
              { role: "assistant" as const, content: assistantText },
            ];
          }
        });
      },
      onDone: () => setIsChatLoading(false),
      onError: (err) => {
        setIsChatLoading(false);
        // If it's an auth error from server
        if (err.toLowerCase().includes("auth") || err.toLowerCase().includes("jwt")) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive"
          });
        } else {
          toast({ title: "Error", description: err });
        }
      },
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Panel */}
      <div className={`mb-4 w-96 max-w-[calc(100vw-2rem)] h-[550px] bg-card rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isChatOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-90 translate-y-10 pointer-events-none"
        }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center border border-white/10 shadow-sm relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-primary rounded-full"></span>
            </div>
            <div className="text-left">
              <h4 className="font-extrabold text-sm tracking-wide">Samadhan AI</h4>
              <p className="text-[10px] text-white/80 font-medium">Online • Responds in Hindi & English</p>
            </div>
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Checker Guard Screen */}
        {!session ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-muted/5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <LogIn className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-lg">
                {language === "hi" ? "लॉगिन आवश्यक है" : "Sign In Required"}
              </h4>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                {language === "hi"
                  ? "समाधान AI के साथ चैट करने के लिए कृपया अपने नागरिक खाते में लॉग इन करें।"
                  : "Please sign in to your citizen account to chat with Samadhan AI assistant."}
              </p>
            </div>
            <Button
              onClick={() => {
                setIsChatOpen(false);
                navigate(ROUTES.SIGN_IN);
              }}
              className="rounded-full px-6 font-bold flex gap-2"
            >
              <LogIn className="w-4 h-4" />
              {language === "hi" ? "साइन इन करें" : "Sign In Now"}
            </Button>
          </div>
        ) : (
          <>
            {/* Messages Window */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/5 min-h-0">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "text-left"}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm ${m.role === "user" ? "bg-secondary" : "bg-primary"
                    }`}>
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-xs font-medium leading-relaxed border shadow-sm ${m.role === "user"
                      ? "bg-secondary/10 border-secondary/20 text-foreground text-left rounded-tr-none"
                      : "bg-card border-border/80 text-foreground rounded-tl-none"
                    }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card border border-border/80 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-muted-foreground shadow-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    Samadhan is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Helper / Suggestion Chips */}
            <div className="px-4 py-2 bg-muted/10 border-t border-border/40">
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-1">
                {sampleQuestions[language].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[10px] text-left px-3 py-1.5 rounded-full border border-border/80 bg-card hover:bg-muted transition-colors font-semibold text-foreground/80 hover:text-foreground shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Controls */}
            <div className="p-3 border-t border-border flex gap-2 bg-card items-center">
              {isSpeechSupported && (
                <Button
                  onClick={toggleListening}
                  variant="outline"
                  size="icon"
                  className={`rounded-full shrink-0 w-9 h-9 ${isListening ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30 animate-pulse" : ""}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={language === "hi" ? "सरकारी योजनाओं के बारे में कुछ भी पूछें..." : "Ask anything about government schemes..."}
                className="flex-1 min-w-0 px-3 py-2 rounded-full bg-muted border border-transparent focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 text-xs transition-all"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isChatLoading}
                size="icon"
                className="rounded-full shrink-0 w-9 h-9 bg-primary hover:bg-primary/95 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Circular Sparkle FAB Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none hover:shadow-primary/30 hover:shadow-xl ${isChatOpen
            ? "bg-slate-700 hover:bg-slate-800 text-white"
            : "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-650 text-white"
          }`}
      >
        {isChatOpen ? (
          <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
        ) : (
          <Sparkles className="w-6 h-6 transition-transform duration-300 animate-pulse" />
        )}
      </button>
    </div>
  );
}
