"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, UserCircle, Package, LogOut, Menu, X, Search } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { getSessionDisplayName, getSessionInitial } from "@/lib/utils";
import CartDrawer from "./CartDrawer";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/track", label: "Track Order" },
  { href: "/coverage", label: "Coverage" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCart } = useCartStore();
  const { token, user, clearAuth } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const count = totalItems();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  useEffect(() => {
    const activeIndex = LINKS.findIndex(
      (l) => pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href + "/"))
    );
    if (activeIndex !== -1 && navRefs.current[activeIndex]) {
      const el = navRefs.current[activeIndex];
      if (el) {
        setPillStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
        });
      }
    }
  }, [pathname, mounted]);

  const showBadge = mounted && count > 0;
  const loggedIn = mounted && !!token && !!user;
  const sessionHref = user?.role === "ADMIN" ? "/admin" : "/account";
  const sessionInitial = getSessionInitial(user ?? undefined);
  const sessionLabel = getSessionDisplayName(user);

  function handleLogout() {
    clearAuth();
    setMenuOpen(false);
    router.push("/login");
  }

  return (
    <>
      <nav
        className={`distro-navbar${scrolled ? " scrolled" : ""}`}
        aria-label="Primary"
      >
        {/* MOBILE HAMBURGER */}
        <button
          type="button"
          className="nav-hamburger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* LEFT — Logo */}
        <div className="nav-left">
          <Link href="/" className="nav-logo" aria-label="DISTRO home">
            <img src="/logo.png" alt="DISTRO" className="nav-logo-img" />
          </Link>
        </div>

        {/* CENTER — Nav links with sliding pill */}
        <div className="nav-center">
          <div className="nav-links-wrapper">
            <div className="nav-pill" style={{ left: `${pillStyle.left}px`, width: `${pillStyle.width}px` }} />
            {LINKS.map((l, idx) => {
              const active =
                pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href + "/"));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  ref={(el) => { navRefs.current[idx] = el; }}
                  className={`nav-link${active ? " is-active" : ""}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Search + Cart + User */}
        <div className="nav-right">
          <div className="nav-search">
            <Search size={16} className="nav-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              className="nav-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm.trim()) {
                  router.push(`/catalogue?q=${encodeURIComponent(searchTerm.trim())}`);
                }
              }}
            />
          </div>

          <button
            id="cartBtn"
            type="button"
            onClick={openCart}
            className="nav-cart-btn"
            aria-label="Open cart"
          >
            <ShoppingCart size={20} strokeWidth={2} />
            <span
              id="cartCount"
              className={`nav-cart-badge${showBadge ? " is-visible" : ""}`}
              aria-hidden={!showBadge}
            >
              {count > 99 ? "99+" : count}
            </span>
          </button>

          {!loggedIn && (
            <Link href="/login" className="nav-login-btn">
              Login
            </Link>
          )}

          {loggedIn && user && (
            <div ref={menuRef} className="nav-session">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="nav-session-btn"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title={sessionLabel}
              >
                <span className="nav-session-avatar" aria-hidden>
                  {sessionInitial}
                </span>
              </button>

              {menuOpen && (
                <div role="menu" className="nav-session-menu">
                  <div className="nav-session-menu-head">
                    <p className="nav-session-menu-name">{sessionLabel}</p>
                    <p className="nav-session-menu-phone">{user.phone}</p>
                    <p className="nav-session-menu-role">{user.role}</p>
                  </div>
                  <Link
                    href={sessionHref}
                    onClick={() => setMenuOpen(false)}
                    className="nav-session-menu-item"
                  >
                    <UserCircle size={16} />
                    {user.role === "ADMIN" ? "Admin Dashboard" : "My Account"}
                  </Link>
                  {user.role === "BUYER" && (
                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="nav-session-menu-item"
                    >
                      <Package size={16} />
                      My Orders
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="nav-session-menu-item nav-session-menu-logout"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="nav-mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="nav-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="nav-mobile-links">
              {LINKS.map((l) => {
                const active = pathname === l.href || pathname?.startsWith(l.href + "/");
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`nav-mobile-link${active ? " is-active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
            {loggedIn && user && (
              <div className="nav-mobile-user">
                <div className="nav-mobile-user-info">
                  <span className="nav-session-avatar" aria-hidden>{sessionInitial}</span>
                  <div>
                    <p className="nav-session-menu-name">{sessionLabel}</p>
                    <p className="nav-session-menu-phone">{user.phone}</p>
                  </div>
                </div>
                <Link href={sessionHref} className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                  {user.role === "ADMIN" ? "Admin Dashboard" : "My Account"}
                </Link>
                {user.role === "BUYER" && (
                  <Link href="/orders" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                    My Orders
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className="nav-mobile-link nav-mobile-logout">
                  Logout
                </button>
              </div>
            )}
            {!loggedIn && (
              <Link href="/login" className="nav-login-btn nav-mobile-login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      <CartDrawer />

      <style jsx global>{`
        .distro-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          padding: 0 32px;
          background: transparent;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          position: sticky;
          top: 0;
          z-index: 200;
          transition: box-shadow 0.3s ease, background 0.3s ease;
        }
        .distro-navbar.scrolled {
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.95);
        }

        /* LEFT — Logo */
        .nav-left {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .nav-logo-img {
          height: 150px;
          width: auto;
          object-fit: contain;
        }

        /* CENTER — Nav links with sliding pill */
        .nav-center {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
        }
        .nav-links-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px;
          border-radius: 12px;
        }
        .nav-pill {
          position: absolute;
          height: calc(100% - 8px);
          background: rgba(37, 99, 235, 0.12);
          border: 1px solid rgba(37, 99, 235, 0.25);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.6);
          border-radius: 8px;
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
          pointer-events: none;
        }
        .nav-link {
          position: relative;
          z-index: 1;
          padding: 8px 18px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: #334155;
        }
        .nav-link.is-active {
          color: #2563eb;
          font-weight: 600;
        }

        /* RIGHT — Search + Cart + User */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: flex-end;
          flex-shrink: 0;
        }

        .nav-search {
          position: relative;
          display: flex;
          align-items: center;
        }
        .nav-search-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          pointer-events: none;
        }
        .nav-search-input {
          width: 200px;
          height: 38px;
          padding: 0 12px 0 36px;
          background: rgba(248, 250, 252, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.6);
          border-radius: 20px;
          font-size: 13px;
          color: #0d1120;
          outline: none;
          transition: all 0.2s ease;
        }
        .nav-search-input::placeholder {
          color: #94a3b8;
        }
        .nav-search-input:focus {
          width: 240px;
          background: rgba(255, 255, 255, 0.95);
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .nav-cart-btn {
          position: relative;
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #475569;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .nav-cart-btn:hover {
          background: rgba(239, 246, 255, 0.8);
          color: #2563eb;
        }
        .nav-cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: #2563eb;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          line-height: 18px;
          text-align: center;
          opacity: 0;
          transform: scale(0);
          transition: opacity 0.2s ease, transform 0.2s ease;
          pointer-events: none;
        }
        .nav-cart-badge.is-visible {
          opacity: 1;
          transform: scale(1);
        }

        .nav-login-btn {
          background: #2563eb;
          color: #ffffff;
          border-radius: 20px;
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .nav-login-btn:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .nav-session {
          position: relative;
        }
        .nav-session-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .nav-session-btn:hover {
          transform: scale(1.05);
        }
        .nav-session-avatar {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: #2563eb;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-grotesk), "Space Grotesk", system-ui, sans-serif;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
        }
        .nav-session-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 12px);
          width: 240px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.6);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(13, 17, 32, 0.12);
          overflow: hidden;
          z-index: 210;
        }
        .nav-session-menu-head {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(241, 245, 249, 0.8);
        }
        .nav-session-menu-name {
          font-size: 13px;
          font-weight: 700;
          color: #0d1120;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .nav-session-menu-phone {
          font-size: 11px;
          color: #64748b;
          margin: 2px 0 0 0;
        }
        .nav-session-menu-role {
          font-size: 10px;
          font-weight: 700;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 4px 0 0 0;
        }
        .nav-session-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          font-size: 13px;
          color: #0d1120;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          text-decoration: none;
          transition: background-color 0.2s ease;
        }
        .nav-session-menu-item:hover {
          background: rgba(239, 246, 255, 0.8);
        }
        .nav-session-menu-logout {
          color: #ef4444;
          border-top: 1px solid rgba(241, 245, 249, 0.8);
        }
        .nav-session-menu-logout:hover {
          background: rgba(254, 242, 242, 0.8);
        }

        /* ── Hamburger (hidden on desktop) ── */
        .nav-hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #334155;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-hamburger:hover {
          background: rgba(239, 246, 255, 0.8);
          color: #2563eb;
        }

        /* ── Mobile overlay + drawer ── */
        .nav-mobile-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .distro-navbar {
            padding: 0 16px;
            height: 60px;
          }
          .nav-hamburger {
            display: inline-flex;
            order: -1;
          }
          .nav-center {
            display: none;
          }
          .nav-logo-img {
            height: 55px;
          }
          .nav-search {
            display: none;
          }
          .nav-right {
            gap: 8px;
          }
          .nav-cart-btn {
            width: 36px;
            height: 36px;
          }
          .nav-session-btn {
            padding: 0;
          }
          .nav-session-avatar {
            width: 36px;
            height: 36px;
          }
          .nav-login-btn {
            padding: 8px 16px;
            font-size: 12px;
          }

          .nav-mobile-overlay {
            display: block;
            position: fixed;
            inset: 60px 0 0 0;
            background: rgba(13, 17, 32, 0.5);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 250;
            animation: fadeIn 0.2s ease;
          }
          .nav-mobile-drawer {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(226, 232, 240, 0.6);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 8px 24px rgba(13, 17, 32, 0.15);
          }
          .nav-mobile-links {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .nav-mobile-link {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            font-size: 15px;
            font-weight: 500;
            color: #334155;
            text-decoration: none;
            border-radius: 10px;
            background: transparent;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            transition: all 0.2s ease;
          }
          .nav-mobile-link:hover,
          .nav-mobile-link:active {
            background: rgba(239, 246, 255, 0.9);
            color: #2563eb;
          }
          .nav-mobile-link.is-active {
            color: #ffffff;
            font-weight: 700;
            background: #2563eb;
          }
          .nav-mobile-user {
            border-top: 1px solid rgba(226, 232, 240, 0.6);
            padding-top: 12px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .nav-mobile-user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 16px 12px;
          }
          .nav-mobile-logout {
            color: #ef4444;
          }
          .nav-mobile-logout:hover,
          .nav-mobile-logout:active {
            background: rgba(254, 242, 242, 0.9);
            color: #ef4444;
          }
          .nav-mobile-login {
            display: block;
            text-align: center;
            margin-top: 8px;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>
    </>
  );
}
