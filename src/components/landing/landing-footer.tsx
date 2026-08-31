import Link from "next/link";
import { Activity } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Patient portal", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Help center", href: "#" },
    { label: "PT CPT code guide", href: "#" },
    { label: "HIPAA & compliance", href: "#" },
    { label: "API documentation", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "BAA", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container-prose py-12">
        <div className="grid gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="md:col-span-2">
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
            <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Practice management built for independent physical therapy
              clinics. Scheduling, SOAP notes, billing, and claims — one
              platform.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
                {title}
              </h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground motion-base hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ClinicFlow, Inc. All rights reserved.
            HIPAA-compliant. BAAs in place with all subprocessors.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
