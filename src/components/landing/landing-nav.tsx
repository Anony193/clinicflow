"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-prose flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 motion-base hover:opacity-80"
          aria-label="ClinicFlow home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-md font-bold tracking-tight">ClinicFlow</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-muted-foreground motion-base hover:text-foreground rounded-md"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="motion-base">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="motion-base">
            <Link href="/login">Start free trial</Link>
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground motion-base hover:bg-muted"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      <div
        id="mobile-nav"
        className={cn(
          "md:hidden overflow-hidden border-t border-border bg-background motion-slow",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <nav
          className="container-prose flex flex-col gap-1 py-4"
          aria-label="Mobile"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-muted-foreground motion-base hover:text-foreground rounded-md"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border">
            <Button asChild variant="outline" size="sm" className="motion-base">
              <Link href="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            </Button>
            <Button asChild size="sm" className="motion-base">
              <Link href="/login" onClick={() => setOpen(false)}>
                Start free trial
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
