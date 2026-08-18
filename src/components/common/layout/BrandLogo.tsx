import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  inverse?: boolean;
}

export function BrandLogo({ inverse = false }: BrandLogoProps) {
  return (
    <Link aria-label="PLAN&WITH 홈" className="inline-flex items-center" href="/">
      <Image
        alt="PLAN & WITH"
        className={`h-14 w-14 object-contain lg:h-[4.5rem] lg:w-[4.5rem] ${
          inverse ? "" : "invert"
        }`}
        height={64}
        priority
        src="/images/brand/logo.png"
        width={64}
      />
    </Link>
  );
}
