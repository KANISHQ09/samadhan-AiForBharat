import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Mic, 
  MicOff,
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  Loader2
} from "lucide-react";
import { streamChat, type ChatMessage } from "@/lib/chatService";
import { useToast } from "@/hooks/use-toast";

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "नमस्ते! मैं आपका सहायक हूं। मैं नागरिक समस्याओं, सरकारी योजनाओं और फॉर्म संबंधी सवालों में मदद कर सकता हूं।\n\nHello! I'm your assistant. I can help with civic issues, government schemes, and form-related questions.",
  },
];

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function AIAssistantSection() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Check for speech recognition support
  const isSpeechSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'hi-IN'; // Default to Hindi, also understands English

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInputValue(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
      if (event.error !== 'aborted') {
        toast({
          title: "Voice Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognitionRef.current?.stop();
    };
  }, [isSpeechSupported, toast]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputValue("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistantMessage = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    await streamChat({
      messages: [...messages, userMessage],
      onDelta: updateAssistantMessage,
      onDone: () => setIsLoading(false),
      onError: (error) => {
        setIsLoading(false);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
                {messages.map((message, index) => (
                  <div 
                    key={index}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
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
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                  <Button 
                    variant={isListening ? "destructive" : "voice"} 
                    size="icon" 
                    onClick={toggleListening}
                    disabled={isLoading || !isSpeechSupported}
                    className={isListening ? "animate-pulse" : ""}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question..."
                    className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  />
                  <Button size="icon" onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow pb-1">Civic Assistant</span>
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
