import Link from "next/link";

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
    <footer className="bg-[color:var(--off)] text-[color:var(--ink)] mt-16 py-32 border-t border-[color:var(--gray)]">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        {/* ── Top grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
          {/* Brand column — spans 2 on desktop */}
          <div className="col-span-2 mb-8 lg:mb-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-2xl text-[color:var(--blue)]">
                DISTRO
              </span>
            </div>
            <p className="mt-4 font-bold text-[color:var(--ink)]">
              Wholesale, made simple.
            </p>
            <p className="mt-2 text-sm text-[color:var(--gray2)] max-w-xs leading-relaxed">
              Nepal&apos;s easiest B2B ordering platform for shopkeepers. Order
              in bulk. Deliver to your door.
            </p>
            <div className="mt-5 text-xs text-[color:var(--gray2)]">
              <p>Payments accepted:</p>
              <p className="mt-1 font-medium">
                eSewa &middot; Khalti &middot; Cash on Delivery
              </p>
            </div>
          </div>

          {/* Menu columns */}
          {MENU_ITEMS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 font-bold text-[color:var(--ink)]">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.text}>
                    {link.href === "#" ? (
                      <span className="font-medium text-[color:var(--gray2)]">
                        {link.text}
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-medium text-[color:var(--gray2)] hover:text-[color:var(--blue)] transition-colors"
                      >
                        {link.text}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Extra — social / CTA column (optional, fills 6th col) */}
          <div>
            <h3 className="mb-4 font-bold text-[color:var(--ink)]">
              Get the app
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="font-medium text-[color:var(--gray2)] hover:text-[color:var(--blue)] transition-colors"
                >
                  App Store
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-medium text-[color:var(--gray2)] hover:text-[color:var(--blue)] transition-colors"
                >
                  Google Play
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div className="mt-24 flex flex-col justify-between gap-4 border-t border-[color:var(--gray)] pt-8 text-sm font-medium text-[color:var(--gray2)] md:flex-row md:items-center">
          <p>
            &copy; {new Date().getFullYear()} DISTRO. All rights reserved.
            &nbsp;Made in Nepal
          </p>
          <ul className="flex gap-4">
            {BOTTOM_LINKS.map((link) => (
              <li key={link.text}>
                <Link
                  href={link.href}
                  className="underline underline-offset-2 hover:text-[color:var(--blue)] transition-colors"
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
