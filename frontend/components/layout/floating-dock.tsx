"use client";

import { useState, type CSSProperties } from "react";

const DESKTOP_LINKS = [
  { label: "Home", tone: "home" },
  { label: "Explore", tone: "explore" },
  { label: "Artists", tone: "artists" },
  { label: "Events", tone: "events" },
  { label: "Creative Map", tone: "map" },
  { label: "Live rooms", tone: "live" },
  { label: "Spaces", tone: "spaces" },
  { label: "Collectives", tone: "collectives" },
  { label: "Open Calls", tone: "opportunities" },
  { label: "AI Match", tone: "match" },
  { label: "Activity", tone: "activity" },
] as const;

const MOBILE_LINKS = [
  { label: "Home", tone: "home", accent: "#FF3D7F" },
  { label: "Map", tone: "map", accent: "#9B7FFF" },
  { label: "Create", tone: "create", accent: "#FF3D7F" },
  { label: "Live rooms", tone: "live", accent: "#00D4B4" },
  { label: "Activity", tone: "activity", accent: "#F2F0FA" },
] as const;

export function FloatingDock() {
  const [activeItem, setActiveItem] = useState("Home");

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
          {DESKTOP_LINKS.map(({ label, tone }) => (
            <button
              key={label}
              type="button"
              className={`sidebar-link sidebar-${tone} ${activeItem === label ? "is-active" : ""}`}
              aria-current={activeItem === label ? "page" : undefined}
              onClick={() => setActiveItem(label)}
            >
              <span className={`nav-glyph nav-${tone}`} aria-hidden="true" />
              <span className="sidebar-label">{label}</span>
              <span className="sidebar-live-pulse" aria-hidden="true" />
            </button>
          ))}
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
        {MOBILE_LINKS.map(({ label, tone, accent }) => {
          const active = activeItem === label;

          return (
            <button
              key={label}
              type="button"
              className={`mobile-nav-link mobile-${tone} ${active ? "is-active" : ""}`}
              style={{ "--dock-accent": accent } as CSSProperties}
              aria-current={active ? "page" : undefined}
              onClick={() => setActiveItem(label)}
            >
              <span className={`mobile-nav-glyph nav-${tone}`} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
