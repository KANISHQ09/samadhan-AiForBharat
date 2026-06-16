import { Button } from "@/shared/components/ui/button";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { BackgroundPattern } from "@/shared/components/BackgroundPattern";
import {
  FileText, Upload, Mic, MicOff, Bot, Send, Loader2,
  Sparkles, Volume2, Languages, HelpCircle, CheckCircle2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { aiService } from "../services/aiService";
import { useToast } from "@/shared/hooks/use-toast";

/* ---------------- SAMPLE QUESTIONS ---------------- */
const sampleQuestions = {
  en: [
    "What documents do I need?",
    "Which fields are mandatory?",
    "Am I eligible for this form?",
    "What's the submission deadline?",
  ],
  hi: [
    "मुझे कौन से दस्तावेज़ चाहिए?",
    "कौन से फ़ील्ड अनिवार्य हैं?",
    "क्या मैं इस फॉर्म के लिए पात्र हूं?",
    "सबमिशन की अंतिम तिथि क्या है?",
  ],
};

/* ---------------- FEATURE CARDS DATA ---------------- */
const analyzerFeatures = (t: (k: string) => string) => [
  { icon: Upload,       labelKey: "analyzer.uploadAnyForm", descKey: "analyzer.uploadDesc" },
  { icon: Sparkles,     labelKey: "analyzer.aiAnalysis",    descKey: "analyzer.analysisDesc" },
  { icon: Volume2,      labelKey: "analyzer.audioGuide",    descKey: "analyzer.audioDesc" },
  { icon: HelpCircle,   labelKey: "analyzer.askQuestions",  descKey: "analyzer.questionsDesc" },
];

const assistantFeatures = (t: (k: string) => string) => [
  { icon: Languages,      labelKey: "assistant.multilingualSupport", descKey: "assistant.multilingualDesc" },
  { icon: Mic,            labelKey: "assistant.voiceInteraction",    descKey: "assistant.voiceDesc" },
  { icon: HelpCircle,     labelKey: "assistant.contextualHelp",      descKey: "assistant.contextualDesc" },
  { icon: FileText,       labelKey: "assistant.documentAssistance",  descKey: "assistant.documentDesc" },
];

/* ---------------- TYPES ---------------- */
type ChatMsg = { role: "user" | "assistant"; content: string };

/* ================================================================
   MAIN COMPONENT
================================================================ */
export function AnalyzerAndAssistant() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  /* ---------- CHAT STATE ---------- */
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        language === "en"
          ? "Hello! I can help with forms, government schemes & queries."
          : "नमस्ते! मैं फॉर्म, सरकारी योजनाओं और प्रश्नों में सहायता कर सकता हूं।",
    },
  ]);

  const [inputValue, setInputValue]   = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const recognitionRef  = useRef<any>(null);

  /* ---------- AUTO-SCROLL (only after real messages, not on mount) ---------- */
  useEffect(() => {
    if (messages.length <= 1) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- SPEECH ---------- */
  const isSpeechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSpeechSupported) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SR();
    recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-US";
    recognitionRef.current.onresult = (e: any) => {
      const transcript = Array.from(e.results as SpeechRecognitionResultList)
        .map((r) => r[0].transcript)
        .join("");
      setInputValue(transcript);
    };
    recognitionRef.current.onend = () => setIsListening(false);
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
    setIsListening((v) => !v);
  };

  /* ---------- SEND ---------- */
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMsg: ChatMsg = { role: "user", content: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    let assistantText = "";
    await aiService.streamChat({
      messages: [...messages, userMsg],
      onDelta: (chunk) => {
        assistantText += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return last?.role === "assistant"
            ? [...prev.slice(0, -1), { role: "assistant", content: assistantText }]
            : [...prev,              { role: "assistant", content: assistantText }];
        });
      },
      onDone:  () => setIsLoading(false),
      onError: () => {
        setIsLoading(false);
        toast({
          title:       language === "en" ? "Error"     : "त्रुटि",
          description: language === "en" ? "Try again" : "पुनः प्रयास करें",
        });
      },
    });
  };

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* ── Shared page background (same dotted pattern as all other pages) ── */}
      <BackgroundPattern />

      <div className="container mx-auto px-4 py-12 relative space-y-24">

        {/* ════════════════════════════════════════
            SECTION 1 — FORM ANALYZER
        ════════════════════════════════════════ */}
        <div>
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {t("analyzer.badge")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t("analyzer.title")} {t("analyzer.audioGuidance")}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t("analyzer.subtitle")}
            </p>
          </div>

          {/* Two-column grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — feature list */}
            <div className="space-y-5 animate-fade-in">
              {analyzerFeatures(t).map(({ icon: Icon, labelKey, descKey }) => (
                <div
                  key={labelKey}
                  className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border shadow-card hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t(labelKey)}</p>
                    <p className="text-sm text-muted-foreground">{t(descKey)}</p>
                  </div>
                </div>
              ))}

              {/* CTA buttons */}
              <div className="flex gap-3 pt-2">
                <Button className="gap-2 flex-1 sm:flex-none">
                  <Upload className="w-4 h-4" />
                  {t("analyzer.uploadForm")}
                </Button>
                <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                  <FileText className="w-4 h-4" />
                  {t("analyzer.describeForm")}
                </Button>
              </div>
            </div>

            {/* RIGHT — upload card */}
            <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden animate-slide-up">
              {/* Card header */}
              <div className="civic-gradient p-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-primary-foreground">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">{t("analyzer.uploadAnyForm")}</p>
                    <p className="text-xs opacity-80">{t("analyzer.accessible")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                  <span className="text-xs text-primary-foreground font-medium">{t("analyzer.accessible")}</span>
                </div>
              </div>

              {/* Drop zone */}
              <div className="p-6">
                <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                    <FileText className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">{t("analyzer.dropHere")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("analyzer.uploadDesc")}</p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    {t("analyzer.browseFiles")}
                  </Button>
                </div>

                {/* Sample questions */}
                <div className="mt-5">
                  <p className="text-xs font-medium text-muted-foreground mb-3">{t("analyzer.tryAsking")}</p>
                  <div className="flex flex-wrap gap-2">
                    {sampleQuestions[language].map((q) => (
                      <span
                        key={q}
                        className="text-xs px-3 py-1.5 bg-muted rounded-full text-foreground cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            SECTION 2 — AI CIVIC ASSISTANT
        ════════════════════════════════════════ */}
        <div>
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full text-secondary text-sm font-medium mb-4">
              <Bot className="w-4 h-4" />
              {t("assistant.badge")}
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t("assistant.title")} {t("assistant.civicAssistant")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t("assistant.subtitle")}
            </p>
          </div>

          {/* Two-column grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — chat UI */}
            <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden animate-slide-up">
              {/* Chat header */}
              <div className="civic-gradient p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-primary-foreground">Samadhan AI</p>
                  <p className="text-xs text-primary-foreground/80">{t("assistant.online")}</p>
                </div>
                <div className="ml-auto w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              </div>

              {/* Messages */}
              <div className="p-4 h-72 overflow-y-auto space-y-3 bg-muted/30">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card text-foreground border border-border rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">{language === "en" ? "Thinking..." : "सोच रहा हूं..."}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="p-3 border-t border-border bg-card flex gap-2 items-center">
                <Button
                  variant={isListening ? "default" : "ghost"}
                  size="iconSm"
                  onClick={toggleListening}
                  disabled={!isSpeechSupported}
                  className={isListening ? "bg-destructive hover:bg-destructive/90" : ""}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={t("assistant.typePlaceholder")}
                  className="flex-1 px-4 py-2 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
                <Button size="iconSm" onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* RIGHT — feature list */}
            <div className="space-y-5 animate-fade-in">
              {assistantFeatures(t).map(({ icon: Icon, labelKey, descKey }) => (
                <div
                  key={labelKey}
                  className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border shadow-card hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t(labelKey)}</p>
                    <p className="text-sm text-muted-foreground">{t(descKey)}</p>
                  </div>
                </div>
              ))}

              <Button className="gap-2 w-full sm:w-auto">
                <Bot className="w-4 h-4" />
                {t("assistant.startChatting")}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
