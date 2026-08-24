import Image from "next/image";
import Link from "next/link";

const footerGroups = [
  {
    title: "Company",
    links: [{ label: "회사소개", href: "/company" }],
  },
  {
    title: "Service",
    links: [
      { label: "AI 일정생성", href: "/schedules/ai/new" },
      { label: "여행 기록", href: "/schedules" },
      { label: "커뮤니티", href: "/community" },
      { label: "핫스팟", href: "/community/hotspots" },
    ],
  },
  {
    title: "고객지원",
    links: [{ label: "자주 묻는 질문", href: "/faq" }],
  },
  {
    title: "이용안내",
    links: [
      { label: "이용약관", href: "/terms" },
      { label: "개인정보처리방침", href: "/privacy" },
    ],
  },
] as const;

const socialLinks = [
  { label: "Facebook", src: "/images/footer/facebook.svg" },
  { label: "X", src: "/images/footer/twitter.svg" },
] as const;

interface FooterProps {
  variant?: "overlay" | "solid";
}

export function Footer({ variant = "solid" }: FooterProps) {
  const isOverlay = variant === "overlay";

  return (
    <footer className="bg-footer-surface text-gray-900" id="footer">
      <div className="flex flex-col gap-[25px] pt-[50px]">
        <div className="mx-auto grid min-h-[195px] w-full max-w-[1446px] gap-12 px-6 lg:grid-cols-[363px_minmax(0,1fr)] xl:gap-24 2xl:gap-[447px] 2xl:px-0">
          <section
            aria-labelledby="footer-brand"
            className="flex flex-col items-start gap-14"
          >
            <div className="grid w-full gap-[18px]">
              <h2 className="text-footer-brand uppercase" id="footer-brand">
                PLAN &amp; WITH
              </h2>
              <p className="text-body-xs leading-[25px] text-footer-text">
                함께 여행을 계획하고, 기록하고, 공유하세요.
                <br />
                AI 기반 여행 플래너 서비스
              </p>
            </div>

            <div className="flex items-center gap-10">
              {socialLinks.map((social) => (
                <Link aria-label={social.label} href="/" key={social.label}>
                  <Image
                    alt=""
                    className="size-[30px]"
                    height={30}
                    src={social.src}
                    width={30}
                  />
                </Link>
              ))}
              <Link
                aria-label="Instagram"
                className="grid size-[30px] place-items-center rounded-xs bg-gray-900"
                href="/"
              >
                <Image
                  alt=""
                  className="size-[18px]"
                  height={18}
                  src="/images/footer/instagram.svg"
                  width={18}
                />
              </Link>
            </div>
          </section>

          <nav
            aria-label="푸터 메뉴"
            className="grid grid-cols-2 content-start gap-x-8 gap-y-8 sm:grid-cols-4 2xl:grid-cols-[repeat(4,101.5px)] 2xl:gap-x-[68px]"
          >
            {footerGroups.map((group) => (
              <section className="min-w-0" key={group.title}>
                <h2 className="p-2.5 text-footer-heading">{group.title}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <Link
                        className="block whitespace-nowrap p-2.5 text-body-sm text-footer-text transition hover:text-gray-900"
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
          <div className="flex h-14 items-center justify-center px-6 text-center text-body-sm text-footer-copyright">
            © 2026 PLAN&amp;WITH Inc. All rights reserved.
          </div>
        ) : null}
      </div>
    </footer>
  );
}
