import { 
  MapPin, 
  Phone, 
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ExternalLink
} from "lucide-react";

const quickLinks = [
  { label: "Report Issue", href: "#report" },
  { label: "Track Status", href: "#dashboard" },
  { label: "Government Schemes", href: "#schemes" },
  { label: "Form Analyzer", href: "#analyzer" },
  { label: "Document Locker", href: "#documents" },
];

const resources = [
  { label: "Help Center", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Accessibility", href: "#" },
  { label: "RTI Portal", href: "#", external: true },
];

const socialLinks = [
  { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
  { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
  { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
  { icon: <Youtube className="w-5 h-5" />, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">स</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-background">Samadhan</h3>
                <p className="text-xs text-background/60">समाधान</p>
              </div>
            </a>
            <p className="text-background/70 text-sm mb-6">
              AI-powered civic governance platform connecting citizens with government services seamlessly.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-background/10 hover:bg-primary text-background flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-background mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-background/70 hover:text-background text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-background mb-4">Resources</h4>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-background/70 hover:text-background text-sm transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-background mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-background/70 text-sm">
                  Ministry of Electronics & IT,<br />
                  New Delhi - 110003
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-background/70 text-sm">1800-111-555 (Toll Free)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-background/70 text-sm">support@samadhan.gov.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm text-center sm:text-left">
            © 2025 Samadhan. An initiative of Government of India.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-background/50 text-xs">Made with ❤️ for every citizen</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
