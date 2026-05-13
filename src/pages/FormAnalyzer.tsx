import { Header } from "@/components/layout/Header";
import { AnalyzerAndAssistant } from "@/components/sections/FormAnalyzerSection";
import { Footer } from "@/components/sections/Footer";
import { BackgroundPattern } from "@/components/BackgroundPattern";

const FormAnalyzer = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundPattern />
      <Header />
      <main className="pt-16">
        <AnalyzerAndAssistant />
        
      </main>
      <Footer />
    </div>
  );
};

export default FormAnalyzer;
