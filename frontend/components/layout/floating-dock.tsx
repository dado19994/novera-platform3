"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

const DESKTOP_LINKS = [
  { label: "Home", tone: "home", href: "/" },
  { label: "Explore", tone: "explore", href: "/explore" },
  { label: "Artists", tone: "artists", href: "/artists" },
  { label: "Events", tone: "events", href: "/events" },
  { label: "Creative Map", tone: "map", href: "/creative-map" },
  { label: "Live rooms", tone: "live", href: "/live-rooms" },
  { label: "Spaces", tone: "spaces", href: "/spaces" },
  { label: "Collectives", tone: "collectives", href: "/collectives" },
  { label: "Open Calls", tone: "opportunities", href: "/open-calls" },
  { label: "AI Match", tone: "match", href: "/ai-match" },
  { label: "Activity", tone: "activity", href: "/activity" },
] as const;

const MOBILE_LINKS = [
  { label: "Home", tone: "home", accent: "#FF3D7F", href: "/" },
  { label: "Map", tone: "map", accent: "#9B7FFF", href: "/creative-map" },
  { label: "Create", tone: "create", accent: "#FF3D7F", href: "/open-calls" },
  { label: "Live rooms", tone: "live", accent: "#00D4B4", href: "/live-rooms" },
  { label: "Activity", tone: "activity", accent: "#F2F0FA", href: "/activity" },
] as const;

export function FloatingDock() {
  const pathname = usePathname();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <aside className="desktop-sidebar" aria-label="Workspace navigation">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark"><span /></span>
          <div>
            <p className="sidebar-wordmark">Novera</p>
            <p className="sidebar-caption">Creative map</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {DESKTOP_LINKS.map(({ label, tone, href }) => {
            const active = isActive(href);

            return (
            <Link
              key={label}
              href={href}
              className={`sidebar-link sidebar-${tone} ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className={`nav-glyph nav-${tone}`} aria-hidden="true" />
              <span className="sidebar-label">{label}</span>
              <span className="sidebar-live-pulse" aria-hidden="true" />
            </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="creator-card">
            <span className="creator-avatar">LM<span /></span>
            <span>
              <strong>Luca Moretti</strong>
              <small>Creator / Visionary</small>
            </span>
            <span className="creator-chevron" aria-hidden="true" />
          </button>
          <div className="sidebar-utilities" role="group" aria-label="Utilities">
            <button type="button" aria-label="Settings"><span className="utility-settings" /></button>
            <button type="button" aria-label="Notifications"><span className="utility-notifications" /></button>
            <button type="button" aria-label="Theme and mood"><span className="utility-theme" /></button>
          </div>
        </div>
      </aside>

      <nav aria-label="Primary" className="mobile-navigation fixed bottom-0 left-0 right-0 z-30">
        {MOBILE_LINKS.map(({ label, tone, accent, href }) => {
          const active = isActive(href);

          return (
            <Link
              key={label}
              href={href}
              className={`mobile-nav-link mobile-${tone} ${active ? "is-active" : ""}`}
              style={{ "--dock-accent": accent } as CSSProperties}
              aria-current={active ? "page" : undefined}
            >
              <span className={`mobile-nav-glyph nav-${tone}`} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
