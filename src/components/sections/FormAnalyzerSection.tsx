import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  FileText, Upload, Mic, Volume2, MessageSquare,
  CheckCircle2, Sparkles, Languages, HelpCircle,
  Bot, User, Send, Loader2, MicOff
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { streamChat } from "@/lib/chatService";
import { useToast } from "@/hooks/use-toast";

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

/* ---------------- MAIN COMPONENT ---------------- */
export function AnalyzerAndAssistant() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  /* ---------------- CHAT STATE ---------------- */
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I can help with forms, government schemes & queries.",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  /* ---------------- SPEECH ---------------- */
  const isSpeechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window ||
      "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSpeechSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "hi-IN";

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setInputValue(transcript);
    };

    recognitionRef.current.onend = () => setIsListening(false);
  }, []);

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
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = { role: "user", content: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    let assistantText = "";

    await streamChat({
      messages: [...messages, userMsg],
      onDelta: (chunk) => {
        assistantText += chunk;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          userMsg,
          { role: "assistant", content: assistantText },
        ]);
      },
      onDone: () => setIsLoading(false),
      onError: () => {
        setIsLoading(false);
        toast({ title: "Error", description: "Try again" });
      },
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <section className="py-20 min-h-screen bg-background relative overflow-hidden">
      
      {/* 🔥 ONE COMMON BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />

      <div className="container mx-auto px-4 relative space-y-24">

        {/* ================= FORM ANALYZER ================= */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Smart Form Analyzer
            </h2>
            <p className="text-muted-foreground mb-6">
              Upload any government form and get AI-powered guidance instantly.
            </p>

            <div className="flex gap-3">
              <Button>
                <Upload className="w-4 h-4" />
                Upload Form
              </Button>
              <Button variant="outline">
                <Mic className="w-4 h-4" />
                Voice Input
              </Button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-card rounded-3xl p-6 border shadow-xl">
            <div className="border-dashed border-2 rounded-xl p-8 text-center">
              <FileText className="mx-auto mb-3" />
              Drop file here
            </div>
          </div>
        </div>

        {/* ================= AI ASSISTANT ================= */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* CHAT UI */}
          <div className="bg-card rounded-3xl border shadow-xl overflow-hidden">
            
            {/* Header */}
            <div className="bg-primary p-4 text-white flex items-center gap-2">
              <Bot /> Samadhan AI
            </div>

            {/* Messages */}
            <div className="p-4 h-80 overflow-y-auto space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : ""}>
                  <div className="inline-block bg-muted p-2 rounded-xl">
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="animate-spin" />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2">
              <Button onClick={toggleListening}>
                {isListening ? <MicOff /> : <Mic />}
              </Button>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-3 rounded-full bg-muted"
              />
              <Button onClick={handleSend}>
                <Send />
              </Button>
            </div>
          </div>

          {/* TEXT */}
          <div>
            <h2 className="text-4xl font-bold mb-4">
              AI Civic Assistant
            </h2>
            <p className="text-muted-foreground">
              Ask anything about forms, schemes, or issues.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
