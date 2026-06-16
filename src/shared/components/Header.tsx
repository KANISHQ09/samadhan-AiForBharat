import React, { useState, forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { useAuth } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";
import { isFeatureEnabled, FeatureFlagName } from "@/shared/config/featureFlags";
import { 
  Menu, 
  X, 
  Globe, 
  Mic, 
  Bell, 
  User,
  FileText,
  MapPin,
  MessageSquare,
  Shield,
  FolderLock,
  LogIn,
  LogOut,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  flag?: FeatureFlagName;
}

const navItems: NavItem[] = [
  { labelKey: "nav.dashboard", href: ROUTES.DASHBOARD, icon: MapPin },
  { labelKey: "nav.report", href: ROUTES.REPORT_ISSUE, icon: FileText },
  { labelKey: "nav.schemes", href: ROUTES.SCHEMES, icon: Shield, flag: "SCHEMES_ENGINE" },
  { labelKey: "nav.analyzer", href: ROUTES.FORM_ANALYZER, icon: MessageSquare, flag: "FORM_ANALYZER" },
  { labelKey: "nav.documents", href: ROUTES.DOCUMENTS, icon: FolderLock, flag: "DOCUMENT_LOCKER" },
];

export const Header = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  const isActive = (href: string) => location.pathname === href;

  const handleSignOut = async () => {
    await signOut();
  };

  const visibleNavItems = navItems.filter(
    (item) => !item.flag || isFeatureEnabled(item.flag)
  );

  return (
    <header ref={ref} className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border" {...props}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl civic-gradient flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-lg">स</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">Samadhan</h1>
              <p className="text-[10px] text-muted-foreground -mt-1">समाधान</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.labelKey}
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">
                {language === "en" ? "English" : "हिंदी"}
              </span>
            </Button>

            {/* Voice Assistant */}
            <Button variant="voice" size="iconSm" className="hidden sm:flex">
              <Mic className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="iconSm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu or Sign In */}
            {loading ? (
              <Button variant="ghost" size="iconSm" disabled>
                <Loader2 className="w-4 h-4 animate-spin" />
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="iconSm" className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.PROFILE} className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {language === "en" ? "My Profile" : "मेरी प्रोफ़ाइल"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`${ROUTES.PROFILE}?tab=issues`} className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {language === "en" ? "My Issues" : "मेरी समस्याएं"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`${ROUTES.PROFILE}?tab=notifications`} className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      {language === "en" ? "Notifications" : "अधिसूचनाएं"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    {language === "en" ? "Sign Out" : "साइन आउट"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to={ROUTES.SIGN_IN}>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                  <LogIn className="w-4 h-4" />
                  {t("nav.signin")}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="iconSm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-1">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.labelKey}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {t(item.labelKey)}
                </Link>
              ))}
              
              {/* Auth Links */}
              <div className="mt-2 pt-2 border-t border-border space-y-1">
                {user ? (
                  <>
                    <Link
                      to={ROUTES.PROFILE}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      {language === "en" ? "My Profile" : "मेरी प्रोफ़ाइल"}
                    </Link>
                    <Link
                      to={`${ROUTES.PROFILE}?tab=issues`}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FileText className="w-5 h-5" />
                      {language === "en" ? "My Issues" : "मेरी समस्याएं"}
                    </Link>
                    <Link
                      to={`${ROUTES.PROFILE}?tab=notifications`}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bell className="w-5 h-5" />
                      {language === "en" ? "Notifications" : "अधिसूचनाएं"}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-muted rounded-lg transition-colors w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      {language === "en" ? "Sign Out" : "साइन आउट"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={ROUTES.SIGN_IN}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      {t("nav.signin")}
                    </Link>
                    <Link
                      to={ROUTES.SIGN_UP}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      {t("nav.signup")}
                    </Link>
                  </>
                )}
              </div>
              
              <div className="mt-2 pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={toggleLanguage}
                  className="w-full justify-start gap-3"
                >
                  <Globe className="w-5 h-5" />
                  {language === "en" ? "English" : "हिंदी"}
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
});

Header.displayName = "Header";
