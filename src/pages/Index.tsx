import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { IssuesNearYou } from "@/components/sections/IssuesNearYou";
import { SchemesSection } from "@/components/sections/SchemesSection";
import { AnalyzerAndAssistant } from "@/components/sections/FormAnalyzerSection";
import { DocumentLockerSection } from "@/components/sections/DocumentLockerSection";
import { Footer } from "@/components/sections/Footer";
import { BackgroundPattern } from "@/components/BackgroundPattern";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundPattern />
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
