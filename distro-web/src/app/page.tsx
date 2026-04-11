"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Package, MapPin, Search } from "lucide-react";
import TickerBar from "@/components/TickerBar";
import ProductCard, { Product } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface Category {
  id: string;
  name: string;
  emoji: string;
  productCount?: number;
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statCounts, setStatCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const targets = [20, 500, 1200, 15000];
    const duration = 1500;
    const startTime = Date.now();
    let frameId: number;

    function update() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setStatCounts(targets.map(t => Math.floor(t * easeOut)));

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      }
    }

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () =>
      api.get("/categories").then((r) => {
        const d = r.data;
        return Array.isArray(d) ? d : d?.categories ?? [];
      }),
    retry: false,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products", "newest"],
    queryFn: () =>
      api.get("/products?sort=newest&limit=12").then((r) => r.data.products ?? []),
    retry: false,
  });

  const fallbackCategories: Category[] = [
    { id: "1", name: "Beverages", emoji: "🥤" },
    { id: "2", name: "Snacks", emoji: "🍿" },
    { id: "3", name: "Dairy", emoji: "🥛" },
  ];

  const displayCategories = (categories.length > 0 ? categories : fallbackCategories).slice(0, 3);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.3s forwards;
        }
        .animate-slide-in-right {
          opacity: 0;
          animation: slideInRight 0.8s ease-out 0.6s forwards;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}} />
      <TickerBar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-pale via-white to-blue-light pt-14 pb-8 sm:pt-14 sm:pb-8 px-4">
        {/* Background shapes */}
        <div className="absolute top-10 right-10 rounded-full" style={{ width: '300px', height: '300px', backgroundColor: '#1A4BDB', opacity: 0.1, filter: 'blur(80px)' }} />
        <div className="absolute -bottom-10 left-10 rounded-full" style={{ width: '200px', height: '200px', backgroundColor: '#1A4BDB', opacity: 0.08, filter: 'blur(80px)' }} />
        <div className="absolute top-1/2 right-1/3 rounded-full" style={{ width: '150px', height: '150px', backgroundColor: '#1A4BDB', opacity: 0.09, filter: 'blur(80px)' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-blue text-sm font-medium uppercase tracking-widest mb-3">
            Nepal&apos;s B2B Wholesale Platform
          </p>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl lg:text-6xl text-ink leading-tight mb-3">
            <span className="inline-block animate-fade-in-up">Wholesale,</span>{" "}
            <span className="text-blue inline-block animate-slide-in-right">made simple.</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-medium mb-3">
            Order in bulk. Deliver to your door.
          </p>

          <p className="text-gray-500 text-base max-w-xl mx-auto mb-7">
            Nepal&apos;s easiest B2B ordering platform for shopkeepers. Browse
            thousands of products, place bulk orders, and get doorstep delivery.
          </p>

          {/* Primary Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex gap-2 p-1.5 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-blue/10 mb-3"
          >
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products e.g. Rice, Soap, Sugar..."
                className="w-full pl-12 pr-4 py-4 text-base focus:outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>
            <button
              type="submit"
              className="bg-blue hover:bg-blue-dark text-white font-semibold px-8 py-3 rounded-xl text-base transition-all shadow-[0_6px_16px_rgba(26,75,219,0.25)] hover:shadow-[0_8px_20px_rgba(26,75,219,0.35)]"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-2xl mx-auto">
            {["🍚 Rice", "🧼 Soap", "🧂 Sugar", "🛢️ Oil", "🌾 Flour", "🧃 Juice"].map((chip) => {
              const name = chip.split(" ")[1];
              return (
                <button
                  key={chip}
                  onClick={() => {
                    setSearchQuery(name);
                    router.push(`/catalogue?q=${encodeURIComponent(name)}`);
                  }}
                  className="bg-blue/10 text-blue hover:bg-blue hover:text-white transition-all rounded-full px-3 py-1 text-sm"
                >
                  {chip}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-7">
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center gap-2 bg-blue/10 hover:bg-blue/20 text-blue font-medium px-6 py-2.5 rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            >
              Browse Catalogue
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-6 py-2.5 rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            >
              Track My Order
            </Link>
          </div>


        </div>
      </section>

      {/* Stats bar */}
      <section className="px-4 pb-14">
        <div className="bg-white rounded-2xl shadow-md shadow-gray-200/50 border border-gray-100 px-8 py-6 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: "Active Districts", icon: "📍" },
            { label: "Products Available", icon: "📦" },
            { label: "Registered Shops", icon: "🏪" },
            { label: "Orders Delivered", icon: "🚚" },
          ].map((stat, i) => (
            <div key={stat.label} className={`${i < 3 ? "border-r border-gray-100" : ""}`}>
              <p className="text-2xl font-semibold text-blue-dark">
                {statCounts[i].toLocaleString()}+
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-grotesk font-bold text-2xl text-gray-900">
            Shop by Category
          </h2>
          <Link
            href="/catalogue"
            className="text-blue text-sm font-medium hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogue?category=${cat.id}`}
              className="group flex flex-col items-center gap-3 bg-white border border-gray-200 hover:border-blue hover:shadow-md rounded-2xl py-6 px-4 text-center transition-all duration-200"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">
                {cat.emoji}
              </span>
              <span className="text-sm font-medium text-ink">{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-xs text-gray-400">
                  {cat.productCount} items
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white border-y border-gray-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-grotesk font-bold text-2xl text-gray-900">
              Newest Products
            </h2>
            <Link
              href="/catalogue?sort=newest"
              className="text-blue text-sm font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={48} strokeWidth={1.2} className="mx-auto mb-4" />
              <p>No products yet. Check back soon!</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="flex w-max gap-4 animate-scroll hover:[animation-play-state:paused] py-2">
                {[...products, ...products].map((product, i) => (
                  <div key={`${product.id}-${i}`} className="w-[180px] sm:w-[220px] flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Coverage CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-gradient-to-r from-blue to-blue-dark rounded-3xl px-8 py-12 sm:py-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-white" />
          </div>
          <MapPin size={40} className="mx-auto mb-4 opacity-90" />
          <h2 className="font-grotesk font-bold text-2xl sm:text-3xl mb-3">
            We deliver across Nepal
          </h2>
          <p className="text-blue-light text-base mb-8 max-w-md mx-auto">
            Delivering to 20+ districts with competitive shipping rates. Check
            if we cover your area.
          </p>
          <Link
            href="/coverage"
            className="inline-flex items-center gap-2 bg-white text-blue font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-pale transition-colors"
          >
            View Coverage Map
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
