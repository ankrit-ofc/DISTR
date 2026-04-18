import Link from "next/link";
import { MessageCircle, Clock } from "lucide-react";
import { AppStoreButton } from "@/components/ui/app-store-button";
import { PlayStoreButton } from "@/components/ui/play-store-button";

interface FooterLink {
  text: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const MENU_ITEMS: FooterSection[] = [
  {
    title: "Shop",
    links: [
      { text: "Catalogue", href: "/catalogue" },
      { text: "Coverage Area", href: "/coverage" },
      { text: "Track Order", href: "/track" },
      { text: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { text: "About DISTRO", href: "/about" },
      { text: "Privacy Policy", href: "/privacy" },
      { text: "Terms & Conditions", href: "/terms" },
    ],
  },
  {
    title: "Support",
    links: [
      { text: "WhatsApp: +977 9800000000", href: "#" },
      { text: "Mon–Sat, 9 AM – 6 PM", href: "#" },
    ],
  },
];

const BOTTOM_LINKS: FooterLink[] = [
  { text: "Terms & Conditions", href: "/terms" },
  { text: "Privacy Policy", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0A0F1C] to-[#050911] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] gap-12 lg:gap-x-16">
            {/* Left: Brand section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
                Wholesale, made simple.
              </h3>
              <p className="text-[13px] text-slate-400/90 leading-relaxed">
                Nepal&apos;s easiest B2B ordering platform for shopkeepers. Order in bulk. Deliver to your door.
              </p>
            </div>

            {/* Navigation columns */}
            {MENU_ITEMS.map((section) => (
              <div key={section.title}>
                <h4 className="text-[13px] font-semibold text-white/95 mb-5 tracking-tight">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      {link.href === "#" ? (
                        <span className="text-[13px] text-slate-400/80 flex items-start gap-2 leading-snug">
                          {link.text.includes("WhatsApp") && (
                            <MessageCircle size={13} className="text-slate-500 mt-[3px] flex-shrink-0" />
                          )}
                          {link.text.includes("Mon") && (
                            <Clock size={13} className="text-slate-500 mt-[3px] flex-shrink-0" />
                          )}
                          <span>{link.text}</span>
                        </span>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[13px] text-slate-400/80 hover:text-white transition-colors duration-150 block leading-snug"
                        >
                          {link.text}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Right: Get the app */}
            <div>
              <h4 className="text-[13px] font-semibold text-white/95 mb-5 tracking-tight">
                Get the App
              </h4>
              <div className="space-y-2">
                <AppStoreButton
                  variant="outline"
                  className="w-full justify-start h-10 bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-150 shadow-sm hover:shadow-md"
                />
                <PlayStoreButton
                  variant="outline"
                  className="w-full justify-start h-10 bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-150 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom strip - matching reference image */}
        <div className="border-t border-white/5 py-10">
          <div className="flex flex-col items-center gap-6">
            {/* Row 1: Payment logos - eSewa + Khalti centered and bigger */}
            <div className="flex items-center justify-center gap-8">
              <img src="/esewa.png" alt="eSewa" className="h-12 object-contain" />
              <img src="/khalti.png" alt="Khalti" className="h-14 object-contain" />
            </div>

            {/* Row 2: DISTRO company logo centered */}
            <div className="flex justify-center">
              <img src="/logo2.png" alt="DISTRO" className="h-40 object-contain opacity-50" />
            </div>

            {/* Row 3: Copyright and legal links centered */}
            <div className="flex items-center justify-center gap-2 text-[12px] text-slate-500/70">
              <span>&copy; 2026 DISTRO. Built for Nepal&apos;s retailers.</span>
              <span>|</span>
              <Link href="/terms" className="hover:text-white transition-colors duration-150">
                Terms & Conditions
              </Link>
              <span>|</span>
              <Link href="/privacy" className="hover:text-white transition-colors duration-150">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
