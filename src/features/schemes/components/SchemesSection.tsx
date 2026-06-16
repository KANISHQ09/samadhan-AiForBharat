/**
 * SchemesSection.tsx
 * ------------------
 * Renders government welfare schemes segmented into:
 *  ✅ "Eligible For You" — schemes the algorithm matched to the user profile
 *  📋 "All Schemes"     — remaining schemes for general browsing
 *
 * Task 4.2 — Schemes UI Integration (ImplementationPlan.md)
 */

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { useAuth } from "@/features/auth";
import { useProfileData } from "@/features/profile";
import { useSchemes } from "../hooks/useSchemes";
import { Scheme } from "@/shared/types/domain/Scheme";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  Users,
  Sparkles,
  AlertCircle,
  ListFilter,
} from "lucide-react";

// --------------------------------------------------------------------------
// Main component
// --------------------------------------------------------------------------

export function SchemesSection() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { profile } = useProfileData(user, language);
  const { eligibleSchemes, otherSchemes, loading, error } = useSchemes(user, profile);

  const [activeTab, setActiveTab] = useState<"eligible" | "all">("eligible");

  const displayedSchemes =
    activeTab === "eligible" ? eligibleSchemes : [...eligibleSchemes, ...otherSchemes];

  return (
    <section id="schemes" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            {t("schemes.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("schemes.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("schemes.subtitle")}
          </p>
        </div>

        {/* Eligible Highlight Banner */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {loading
                  ? (language === "en" ? "Analysing your eligibility..." : "पात्रता जाँच हो रही है...")
                  : (language === "en"
                    ? `${eligibleSchemes.length} schemes matched for you`
                    : `आपके लिए ${eligibleSchemes.length} योजनाएं मिलीं`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en"
                  ? "Based on your profile and location"
                  : "आपकी प्रोफ़ाइल और स्थान के आधार पर"}
              </p>
            </div>
          </div>
          <Button
            variant="default"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setActiveTab("eligible")}
          >
            {t("schemes.checkEligibility")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-8 p-1 bg-muted rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("eligible")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "eligible"
                ? "bg-card shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-accent" />
            {language === "en" ? "Eligible For You" : "आपके लिए पात्र"}
            {!loading && (
              <span className="ml-1 text-xs bg-accent/15 text-accent px-1.5 py-0.5 rounded-full">
                {eligibleSchemes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-card shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListFilter className="w-4 h-4" />
            {language === "en" ? "All Schemes" : "सभी योजनाएं"}
            {!loading && (
              <span className="ml-1 text-xs bg-muted-foreground/15 text-muted-foreground px-1.5 py-0.5 rounded-full">
                {eligibleSchemes.length + otherSchemes.length}
              </span>
            )}
          </button>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="py-12 bg-card rounded-2xl border border-border">
            <LoadingState
              message={
                language === "en"
                  ? "Fetching government schemes..."
                  : "सरकारी योजनाएं लोड हो रही हैं..."
              }
            />
          </div>
        ) : error ? (
          <div className="py-12 bg-card rounded-2xl border border-border">
            <ErrorState message={error} />
          </div>
        ) : displayedSchemes.length === 0 ? (
          <EmptyState
            title={
              activeTab === "eligible"
                ? (language === "en" ? "No Eligible Schemes Found" : "कोई पात्र योजना नहीं मिली")
                : (language === "en" ? "No Schemes Found" : "कोई योजना नहीं मिली")
            }
            description={
              activeTab === "eligible"
                ? (language === "en"
                  ? "Complete your profile to improve eligibility matching."
                  : "पात्रता मिलान सुधारने के लिए अपनी प्रोफ़ाइल पूरी करें।")
                : (language === "en"
                  ? "We couldn't find any schemes in the database."
                  : "हमें डेटाबेस में कोई योजना नहीं मिली।")
            }
          />
        ) : (
          /* Schemes Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {displayedSchemes.map((scheme, index) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                index={index}
                isHighlighted={activeTab === "eligible" && scheme.isEligible}
              />
            ))}
          </div>
        )}

        {/* Fake Policy Warning */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">{t("schemes.fakeWarning")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("schemes.fakeDesc")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {t("schemes.reportFake")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// SchemeCard
// --------------------------------------------------------------------------

function SchemeCard({
  scheme,
  index,
  isHighlighted,
}: {
  scheme: Scheme;
  index: number;
  isHighlighted?: boolean;
}) {
  const { t, language } = useLanguage();

  const title = language === "en" ? scheme.titleEn : scheme.titleHi;
  const description = language === "en" ? scheme.descriptionEn : scheme.descriptionHi;
  const category = language === "en" ? scheme.categoryEn : scheme.categoryHi;
  const eligibility = language === "en" ? scheme.eligibilityEn : scheme.eligibilityHi;
  const deadline = language === "en" ? scheme.deadlineEn : scheme.deadlineHi;

  return (
    <div
      className={`group bg-card rounded-2xl border shadow-card hover:shadow-lg transition-all overflow-hidden animate-slide-up ${
        isHighlighted
          ? "border-accent/40 ring-1 ring-accent/20"
          : "border-border"
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Eligible ribbon */}
      {isHighlighted && (
        <div className="bg-accent/10 border-b border-accent/20 px-4 py-1.5 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-accent">
            {language === "en" ? "Likely Eligible" : "संभवतः पात्र"}
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {scheme.icon || <Shield className="w-5 h-5" />}
            </div>
            <div>
              <Badge variant="secondary" className="text-xs mb-1">
                {category}
              </Badge>
              {deadline && (
                <p className="text-xs text-warning font-medium">
                  {t("schemes.deadline")}: {deadline}
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
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        {/* Eligibility Criteria */}
        <div className="flex flex-wrap gap-2 mb-4">
          {eligibility.map((item, i) => (
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
              {t("schemes.mayBeEligible")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              {t("schemes.checkEligibility")}
            </span>
          )}
          <Button variant="ghost" size="sm" className="gap-1">
            {t("schemes.learnMore")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
