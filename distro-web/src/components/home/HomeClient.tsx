"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BarChart3,
  Box,
  Check,
  Clock,
  Plus,
  ShieldCheck,
  Truck,
  TrendingUp,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { AppStoreButton } from "@/components/ui/app-store-button";
import { PlayStoreButton } from "@/components/ui/play-store-button";
import ClientFeedback from "@/components/ui/testimonial";
import { useReveal } from "@/hooks/useReveal";
import { getImageUrl, formatPrice } from "@/lib/utils";
import type { Product } from "@/components/ProductCard";

interface Category {
  id: number | string;
  name: string;
  emoji?: string;
  productCount?: number;
  _count?: { products?: number };
}

interface Props {
  categories: Category[];
  products: Product[];
  totalProducts: number;
  districtsCount: number;
}

const BRAND_PILLS = [
  "All",
  "Gorkha",
  "Barahsinghe",
  "Tuborg",
  "Carlsberg",
  "8848 Vodka",
  "Signature",
  "Red Bull",
  "Mustang",
  "Max Tiger",
];

function categoryColor(name: string): { bg: string; stroke: string } {
  const n = name.toLowerCase();
  if (n.includes("liquor") || n.includes("whisky") || n.includes("vodka"))
    return { bg: "#EFF6FF", stroke: "#2563EB" };
  if (n.includes("beer")) return { bg: "#D1FAE5", stroke: "#00A05A" };
  if (n.includes("energy")) return { bg: "#FEF3C7", stroke: "#F59E0B" };
  return { bg: "#F3F4F6", stroke: "#6B7280" };
}

function CategoryIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  const { stroke } = categoryColor(name);
  if (n.includes("liquor") || n.includes("whisky") || n.includes("vodka")) {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="24" y="18" width="14" height="52" rx="3" fill={stroke} opacity="0.9" />
        <rect x="42" y="12" width="14" height="58" rx="3" fill={stroke} />
        <rect x="27" y="12" width="8" height="10" rx="1.5" fill="#0D1120" />
        <rect x="45" y="6" width="8" height="10" rx="1.5" fill="#0D1120" />
      </svg>
    );
  }
  if (n.includes("beer")) {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="22" y="16" width="14" height="54" rx="3" fill="#00C46F" />
        <rect x="44" y="16" width="14" height="54" rx="3" fill="#00A05A" />
        <rect x="22" y="24" width="14" height="6" fill="#FFFFFF" opacity=".6" />
        <rect x="44" y="24" width="14" height="6" fill="#FFFFFF" opacity=".6" />
      </svg>
    );
  }
  if (n.includes("energy") || n.includes("drink") || n.includes("beverage")) {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="22" y="16" width="14" height="52" rx="3" fill="#F59E0B" />
        <rect x="44" y="16" width="14" height="52" rx="3" fill="#D97706" />
        <rect x="22" y="30" width="14" height="3" fill="#FFFFFF" opacity=".7" />
        <rect x="44" y="30" width="14" height="3" fill="#FFFFFF" opacity=".7" />
      </svg>
    );
  }
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M40 14 L64 26 L64 58 L40 70 L16 58 L16 26 Z" fill="#B45309" />
      <path d="M40 14 L64 26 L40 38 L16 26 Z" fill="#D97706" />
      <path d="M40 38 L40 70" stroke="#78350F" strokeWidth="1.5" />
    </svg>
  );
}

function ProductMini({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  const [added, setAdded] = useState(false);
  const mrp = product.mrp ?? 0;
  const discount =
    mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col"
    >
      <div className="relative h-48 bg-gray-50 overflow-hidden">
        <Image
          src={getImageUrl(product.imageUrl ?? product.image)}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-contain p-4"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
      </div>

      <div className="relative p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mb-auto">
          <p className="text-base font-semibold text-gray-900">
            Rs {product.price.toFixed(2)}
          </p>
          {mrp > product.price && (
            <p className="text-xs line-through text-gray-400">
              Rs {mrp.toFixed(2)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="absolute bottom-4 right-4 w-7 h-7 bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all duration-200"
          aria-label="Add to cart"
        >
          {added ? <Check size={14} /> : <Plus size={14} />}
        </button>
      </div>
    </Link>
  );
}

export default function HomeClient({
  categories,
  products,
  totalProducts,
  districtsCount,
}: Props) {
  useReveal();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [activeBrand, setActiveBrand] = useState("All");

  const filtered = useMemo(() => {
    const list = activeBrand === "All"
      ? products
      : products.filter((p) => (p.brand ?? "").toLowerCase() === activeBrand.toLowerCase());
    return list.slice(0, 8);
  }, [products, activeBrand]);

  function addToCart(product: Product) {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      unit: product.unit,
      moq: product.moq,
      image: product.imageUrl ?? product.image,
      brand: product.brand,
    }, product.moq);
    toast.success(`${product.name} added to cart`);
  }

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-2 pb-24 lg:pt-4 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT */}
            <div className="max-w-xl">
              <div className="fade-up inline-flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-8 shadow-sm shadow-blue-100/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-blue-700 font-medium">Nepal&apos;s wholesale platform</span>
              </div>

              <h1 className="fade-up delay-1 font-['Alegreya_Sans'] text-5xl lg:text-6xl font-normal text-gray-900 tracking-tight mb-6 leading-[1.1]">
                Everything your shop needs, in{" "}
                <span className="text-blue-600 font-bold">one place</span>
              </h1>

              <p className="fade-up delay-2 text-lg text-gray-600 leading-relaxed mb-10 max-w-lg">
                Browse products, compare prices, and order in bulk. Fast, reliable delivery across Nepal.
              </p>

              <div className="fade-up delay-3 flex flex-wrap gap-4 mb-12">
                <button
                  type="button"
                  onClick={() => router.push("/catalogue")}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-8 py-4 text-base font-semibold hover:bg-blue-700 hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all duration-300"
                >
                  Browse catalogue
                  <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/track")}
                  className="inline-flex items-center gap-2 bg-black text-white rounded-xl px-8 py-4 text-base font-semibold hover:bg-gray-900 shadow-lg active:scale-[0.98] transition-all duration-200"
                >
                  Track my order
                </button>
              </div>

              <div className="fade-up delay-4 grid grid-cols-4 gap-8 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts || 39}+</p>
                  <p className="text-sm text-gray-600 mt-1">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{districtsCount || 10}</p>
                  <p className="text-sm text-gray-600 mt-1">Districts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">24h</p>
                  <p className="text-sm text-gray-600 mt-1">Delivery</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">1K+</p>
                  <p className="text-sm text-gray-600 mt-1">Orders</p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="float-anim relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-3xl blur-3xl opacity-20"></div>
                <Image
                  src="/image.png"
                  alt="DISTRO wholesale cart"
                  width={580}
                  height={500}
                  priority
                  className="relative z-10"
                  style={{ objectFit: "contain", width: "100%", height: "auto" }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.endsWith("/image.svg")) target.src = "/image.svg";
                  }}
                />
              </div>

              {/* Floating badges */}
              <div className="pop-in absolute top-8 left-0 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 flex items-center gap-3 backdrop-blur-sm" style={{ animationDelay: ".8s" }}>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Check size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order placed!</p>
                  <p className="text-xs text-gray-500 mt-0.5">ORD-20240315-0042</p>
                </div>
              </div>

              <div className="pop-in absolute bottom-12 right-0 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 flex items-center gap-3 backdrop-blur-sm" style={{ animationDelay: "1s" }}>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Rs 1.2L</p>
                  <p className="text-xs text-gray-500 mt-0.5">This month</p>
                </div>
              </div>

              <div className="pop-in absolute top-1/2 right-4 -translate-y-1/2 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 flex items-center gap-3 backdrop-blur-sm" style={{ animationDelay: "1.2s" }}>
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Box size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{totalProducts || 39} products</p>
                  <p className="text-xs text-gray-500 mt-0.5">In stock now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────── */}
      <section className="reveal max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <BarChart3 size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 mb-1">Wholesale prices</p>
              <p className="text-sm text-gray-600">Best rates on all products</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <Truck size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 mb-1">Fast delivery</p>
              <p className="text-sm text-gray-600">1 day Kathmandu valley</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={22} className="text-purple-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 mb-1">IRD invoices</p>
              <p className="text-sm text-gray-600">VAT invoices on every order</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={22} className="text-amber-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 mb-1">Credit available</p>
              <p className="text-sm text-gray-600">Udhari for trusted buyers</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────── */}
      <section className="reveal max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-['Alegreya_Sans'] text-3xl font-bold text-gray-900 mb-2">Shop by category</h2>
            <p className="text-base text-gray-600">Explore our full range of wholesale products</p>
          </div>
          <Link
            href="/catalogue"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:gap-3 transition-all"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((cat) => {
              const count = cat.productCount ?? cat._count?.products ?? 0;
              const tone = categoryColor(cat.name);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => router.push(`/catalogue?categoryId=${cat.id}`)}
                  className="group text-left bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-1">{cat.name}</p>
                      <p className="text-sm text-gray-600">{count} products</p>
                    </div>
                  </div>
                  <div
                    className="h-32 flex items-center justify-center rounded-xl"
                    style={{ background: tone.bg }}
                  >
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      <CategoryIcon name={cat.name} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FEATURED PRODUCTS ───────────────────────────────── */}
      <section className="reveal bg-slate-50/30 py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-['Alegreya_Sans'] text-3xl font-bold text-gray-900 mb-2">Featured products</h2>
              <p className="text-base text-gray-600">Popular items from trusted brands</p>
            </div>
            <Link
              href="/catalogue"
              className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:gap-3 transition-all"
            >
              See all {totalProducts || products.length}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex gap-3 mb-8 flex-wrap">
            {BRAND_PILLS.map((b) => {
              const active = activeBrand === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setActiveBrand(b)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                >
                  {b}
                </button>
              );
            })}
          </div>

          {products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <ProductMini key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => router.push("/catalogue")}
              className="inline-flex items-center gap-2 bg-white text-gray-900 border border-gray-200 rounded-xl px-8 py-4 text-base font-semibold hover:border-gray-300 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            >
              Browse all products
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ─────────────────────────────────────── */}
      <section className="reveal max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 lg:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8 overflow-hidden shadow-2xl shadow-blue-500/20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100 bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></span>
              Limited time offer
            </p>
            <h3 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
              Register today — get {formatPrice(200)} credit on your first order
            </h3>
            <p className="text-base text-blue-100">
              For registered shopkeepers only · Valid this week
            </p>
          </div>

          <div className="relative z-10">
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-200"
            >
              Create free account
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="reveal max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <ClientFeedback />
      </section>
    </>
  );
}
