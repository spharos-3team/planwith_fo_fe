import { Camera } from "lucide-react";
import Link from "next/link";

const footerGroups = [
  {
    title: "Company",
    links: [{ label: "Spharos Academy", href: "/company" }],
  },
  {
    title: "Service",
    links: [
      { label: "Planner", href: "/schedules" },
      { label: "AI", href: "/schedules/ai" },
      { label: "Memory", href: "/community" },
      { label: "HotSpots", href: "/community/hotspots" },
    ],
  },
  {
    title: "TEAM",
    links: [{ label: "Juseok MatJib", href: "/team" }],
  },
  {
    title: "About Us",
    links: [
      { label: "PARK YEON HUI", href: "/about" },
      { label: "YOON HWI MYUING", href: "/about" },
      { label: "GWAK JI EUN", href: "/about" },
      { label: "LEE KYUNG MIN", href: "/about" },
    ],
  },
];

interface FooterProps {
  variant?: "overlay" | "solid";
}

export function Footer({ variant = "solid" }: FooterProps) {
  const isOverlay = variant === "overlay";

  return (
    <footer className="bg-header-branded text-white" id="footer">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1.5fr_2fr] lg:py-20">
        <section aria-labelledby="footer-brand">
          <h2
            className="text-base font-medium tracking-[0.12em]"
            id="footer-brand"
          >
            PLAN &amp; WITH
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">
            Your journey starts here. Plan, share, and explore travel stories
            with fellow travelers.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              aria-label="Facebook"
              className="grid h-8 w-8 place-items-center rounded bg-white/10 text-sm font-bold transition hover:bg-white/20"
              href="/"
            >
              f
            </Link>
            <Link
              aria-label="X"
              className="grid h-8 w-8 place-items-center rounded bg-white/10 text-sm transition hover:bg-white/20"
              href="/"
            >
              𝕏
            </Link>
            <Link
              aria-label="Instagram"
              className="grid h-8 w-8 place-items-center rounded bg-white/10 transition hover:bg-white/20"
              href="/"
            >
              <Camera aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <nav
          aria-label="푸터 메뉴"
          className="grid grid-cols-2 gap-10 sm:grid-cols-4"
        >
          {footerGroups.map((group) => (
            <section key={group.title}>
              <h2 className="text-sm font-semibold">{group.title}</h2>
              <ul className="mt-4 grid gap-3 text-xs text-white/75">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <Link
                      className="transition hover:text-white"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>

      {!isOverlay ? (
        <div className="bg-footer-bar px-6 py-5 text-center text-xs text-text-inverse">
          © 2026 PLAN&amp;WITH Inc. All rights reserved.
        </div>
      ) : null}
    </footer>
  );
}
