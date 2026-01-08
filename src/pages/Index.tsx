import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { IssuesNearYou } from "@/components/sections/IssuesNearYou";
import { SchemesSection } from "@/components/sections/SchemesSection";
import { FormAnalyzerSection } from "@/components/sections/FormAnalyzerSection";
import { AIAssistantSection } from "@/components/sections/AIAssistantSection";
import { DocumentLockerSection } from "@/components/sections/DocumentLockerSection";
import { Footer } from "@/components/sections/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <IssuesNearYou />
        <SchemesSection />
        <FormAnalyzerSection />
        <AIAssistantSection />
        <DocumentLockerSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
