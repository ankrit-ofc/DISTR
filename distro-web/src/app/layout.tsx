import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Providers from "@/components/Providers";
import BuyerChatWrapper from "@/components/BuyerChatWrapper";
import PwaRegister from "@/components/PwaRegister";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#1A4BDB",
};

export const metadata: Metadata = {
  title: "DISTRO — Wholesale, made simple.",
  description: "Nepal's easiest B2B ordering platform for shopkeepers. Order in bulk. Deliver to your door.",
  keywords: "wholesale, B2B, Nepal, bulk order, shopkeeper, DISTRO",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DISTRO",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakarta.variable}`}>
      <body className="font-jakarta bg-off-white text-ink min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 pb-mobile-nav">{children}</main>
          <Footer />
          <MobileBottomNav />
          <BuyerChatWrapper />
          <PwaRegister />
        </Providers>
      </body>
    </html>
  );
}
