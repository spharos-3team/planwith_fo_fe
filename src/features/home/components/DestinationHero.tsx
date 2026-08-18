"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const destinations = [
  {
    id: "tokyo",
    name: "TOKYO",
    koreanName: "도쿄",
    background: "/images/destinations/tokyo/background.jpg",
    landmark: "/images/destinations/tokyo/landmark.png",
    landmarkFrameClass:
      "right-[-6%] h-[68dvh] w-[58vw] sm:right-[-2%] sm:h-[80dvh] sm:w-[42vw] lg:right-[15%] lg:h-[90dvh] lg:w-[28vw] xl:w-[26vw]",
    landmarkImageClass: "object-cover object-bottom",
    description:
      "전통과 현대가 공존하는 도시, 도쿄. 신비로운 일본문화부터 아사쿠사의 고즈넉한 사찰까지, 무한한 매력을 발견하세요.",
  },
  {
    id: "new-york",
    name: "NEW YORK",
    koreanName: "뉴욕",
    background: "/images/destinations/new-york/background.jpg",
    landmark: "/images/destinations/new-york/landmark.png",
    landmarkFrameClass:
      "right-[-4%] h-[72dvh] w-[62vw] sm:right-0 sm:h-[84dvh] sm:w-[44vw] lg:right-[14%] lg:h-[92dvh] lg:w-[30vw] xl:w-[28vw]",
    landmarkImageClass: "object-contain object-bottom",
    description:
      "잠들지 않는 도시 뉴욕. 브로드웨이의 화려함과 센트럴파크의 여유로움이 공존하는 꿈의 도시를 경험하세요.",
  },
  {
    id: "london",
    name: "LONDON",
    koreanName: "런던",
    background: "/images/destinations/london/background.jpg",
    landmark: "/images/destinations/london/landmark.png",
    landmarkFrameClass:
      "right-[-6%] h-[68dvh] w-[56vw] sm:right-[-2%] sm:h-[80dvh] sm:w-[40vw] lg:right-[16%] lg:h-[90dvh] lg:w-[26vw] xl:w-[24vw]",
    landmarkImageClass: "object-cover object-bottom",
    description:
      "클래식한 도시, 런던. 빅벤의 위엄부터 템즈 강변의 고즈넉함까지, 역사와 현대가 공존하는 영국의 수도를 경험하세요.",
  },
  {
    id: "paris",
    name: "PARIS",
    koreanName: "파리",
    background: "/images/destinations/paris/background.jpg",
    landmark: "/images/destinations/paris/landmark.png",
    landmarkFrameClass:
      "right-[-2%] h-[70dvh] w-[54vw] sm:right-[2%] sm:h-[82dvh] sm:w-[38vw] lg:right-[16%] lg:h-[90dvh] lg:w-[24vw] xl:w-[22vw]",
    landmarkImageClass: "object-cover object-bottom",
    description:
      "낭만의 도시 파리. 에펠탑의 황금빛 야경부터 센 강변의 여유로운 산책까지, 예술과 사랑이 넘치는 도시를 만나보세요.",
  },
  {
    id: "seoul",
    name: "SEOUL",
    koreanName: "서울",
    background: "/images/destinations/seoul/background.jpg",
    landmark: "/images/destinations/seoul/landmark.png",
    landmarkFrameClass:
      "right-[-4%] h-[70dvh] w-[56vw] sm:right-0 sm:h-[82dvh] sm:w-[40vw] lg:right-[16%] lg:h-[88dvh] lg:w-[28vw] xl:right-[15%] xl:w-[26vw]",
    landmarkImageClass: "object-cover object-bottom",
    description:
      "천년 고도의 품격, 서울. 경복궁부터 한강 야경까지, 전통과 현대가 공존하는 대한민국의 심장을 느껴보세요.",
  },
] as const;

export function DestinationHero() {
  const [activeDestinationId, setActiveDestinationId] = useState("seoul");
  const activeDestination =
    destinations.find(({ id }) => id === activeDestinationId) ??
    destinations[destinations.length - 1];

  return (
    <section
      aria-label="추천 여행지"
      className="relative isolate min-h-[max(100dvh,42.5rem)] w-full overflow-hidden text-white"
    >
      <Image
        alt={`${activeDestination.koreanName} 배경`}
        className="object-cover object-center"
        fill
        key={`${activeDestination.id}-background`}
        priority
        sizes="100vw"
        src={activeDestination.background}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 z-[1] ${activeDestination.landmarkFrameClass}`}
      >
        <Image
          alt=""
          className={`${activeDestination.landmarkImageClass} drop-shadow-landmark`}
          fill
          key={`${activeDestination.id}-landmark`}
          priority
          sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 32vw, 55vw"
          src={activeDestination.landmark}
        />
      </div>

      <div className="relative z-[2] flex min-h-[max(100dvh,42.5rem)] w-full flex-col justify-end gap-10 px-8 pb-12 pt-28 sm:px-12 sm:pb-14 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:pb-20 lg:pt-32 xl:px-20">
        <div
          aria-live="polite"
          className="flex min-w-0 max-w-2xl flex-col gap-7 sm:gap-8"
        >
          <div>
            <p className="break-words text-[clamp(3.25rem,8.5vw,8.25rem)] font-semibold leading-[0.84] tracking-[-0.04em] md:whitespace-nowrap">
              {activeDestination.name}
            </p>
            <h1 className="mt-3 text-[clamp(1.375rem,2vw,1.875rem)] font-normal">
              {activeDestination.koreanName}
            </h1>
          </div>
          <p className="max-w-lg text-[clamp(0.875rem,1.05vw,1.0625rem)] leading-7 text-white/92">
            {activeDestination.description}
          </p>
          <Link
            className="inline-flex w-fit items-center gap-2 border-b border-white/70 pb-1 text-[clamp(0.875rem,1vw,1rem)] font-medium transition hover:border-white"
            href="/schedules"
          >
            더 알아보기
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <nav
          aria-label="추천 여행지 선택"
          className="flex max-w-full gap-5 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:items-end lg:gap-[clamp(1.25rem,2.2vh,2rem)] lg:overflow-visible lg:pb-0"
        >
          {destinations.map((destination) => {
            const active = destination.id === activeDestination.id;

            return (
              <button
                aria-pressed={active}
                className={`relative shrink-0 py-0.5 pl-4 text-left transition lg:pl-5 lg:text-right ${
                  active
                    ? "text-footer-bar"
                    : "text-text-inverse hover:text-text-inverse/80"
                }`}
                key={destination.id}
                onClick={() => setActiveDestinationId(destination.id)}
                type="button"
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0.5 left-0 top-0.5 w-0.5 bg-footer-bar"
                  />
                )}
                <span className="block text-[clamp(1.125rem,1.35vw,1.5rem)] font-normal leading-tight">
                  {destination.koreanName}
                </span>
                <span className="mt-1 block text-[clamp(0.75rem,0.9vw,1rem)] font-semibold leading-tight tracking-[0.08em]">
                  {destination.name}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
