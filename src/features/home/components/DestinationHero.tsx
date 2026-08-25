"use client";

import "swiper/css";
import "swiper/css/a11y";
import "swiper/css/effect-fade";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay, EffectFade, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { HeroContentContainer } from "@/components/common/layout/ContentContainer";

const AUTOPLAY_DELAY = 6500;

const destinations = [
  {
    id: "tokyo",
    name: "TOKYO",
    koreanName: "도쿄",
    background: "/images/destinations/tokyo/background.png",
    backgroundOverlayClass: "bg-black/[0.15]",
    landmark: "/images/destinations/tokyo/landmark.png",
    landmarkFrameClass:
      "md:left-[75.73%] md:top-0 md:w-[min(62.5vw,1200px)] md:-translate-x-1/2 md:aspect-[1200/1220]",
    landmarkImageClass:
      "object-cover object-top md:!left-[-2%] md:!top-0 md:!h-[107.06%] md:!w-[104%]",
    description: [
      "전통과 현대가 공존하는 도시, 도쿄. 시부야의 네온사인부터",
      "아사쿠사의 고즈넉한 사찰까지, 무한한 매력을 발견하세요.",
    ],
  },
  {
    id: "new-york",
    name: "NEW YORK",
    koreanName: "뉴욕",
    background: "/images/destinations/new-york/background.png",
    backgroundOverlayClass: "bg-black/[0.14]",
    landmark: "/images/destinations/new-york/landmark.png",
    landmarkFrameClass:
      "md:left-[77.239583%] md:top-[min(0.208333vw,4px)] md:w-[min(36.770833vw,706px)] md:-translate-x-1/2 md:aspect-[706/1404]",
    landmarkImageClass:
      "object-contain object-top md:!left-[-41.37%] md:!top-0 md:!h-full md:!w-[141.43%] md:object-cover",
    description: [
      "잠들지 않는 도시, 뉴욕, 브로드웨이의 화려함과 센트럴파크의 여유로움이",
      "공존하는 꿈의 도시를 경험하세요.",
    ],
  },
  {
    id: "london",
    name: "LONDON",
    koreanName: "런던",
    background: "/images/destinations/london/background.png",
    backgroundOverlayClass: "bg-black/[0.15]",
    landmark: "/images/destinations/london/landmark.png",
    landmarkFrameClass:
      "md:left-[75.57%] md:top-[0.59%] md:w-[min(56.04vw,1076px)] md:-translate-x-1/2 md:aspect-[1076/1196]",
    landmarkImageClass: "object-contain object-bottom md:object-fill",
    description: [
      "클래식의 도시, 런던. 빅벤의 위엄부터 템즈 강변의 고즈넉함까지,",
      "역사와 현대가 공존하는 영국의 수도를 경험하세요.",
    ],
  },
  {
    id: "paris",
    name: "PARIS",
    koreanName: "파리",
    background: "/images/destinations/paris/background.png",
    backgroundOverlayClass: "bg-black/[0.15]",
    landmark: "/images/destinations/paris/landmark.png",
    landmarkFrameClass:
      "md:left-[78.26%] md:top-[0.59%] md:w-[min(49.74vw,955px)] md:-translate-x-1/2 md:aspect-[955/1198]",
    landmarkImageClass:
      "object-contain object-bottom md:!left-[-9.78%] md:!top-[2.06%] md:!h-[102.48%] md:!w-[119.56%] md:object-fill",
    description: [
      "낭만의 도시, 파리. 에펠탑의 황금빛 야경부터 센 강변의 여유로운 산책까지,",
      "예술과 사랑이 넘치는 도시를 만나보세요.",
    ],
  },
  {
    id: "seoul",
    name: "SEOUL",
    koreanName: "서울",
    background: "/images/destinations/seoul/background.png",
    backgroundOverlayClass: "bg-black/[0.15]",
    landmark: "/images/destinations/seoul/landmark.png",
    landmarkFrameClass:
      "md:left-[73.98%] md:top-[0.29%] md:w-[min(54.53vw,1047px)] md:-translate-x-1/2 md:aspect-[1047/1102]",
    landmarkImageClass:
      "object-contain object-bottom md:!left-[-6.57%] md:!top-[-0.01%] md:!h-full md:!w-[113.33%] md:object-fill",
    description: [
      "천년 고도의 품격, 서울. 경복궁부터 한강 야경까지,",
      "전통과 현대가 공존하는 대한민국의 심장을 느껴보세요.",
    ],
  },
] as const;

export function DestinationHero() {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () =>
      mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const swiper = swiperRef.current;

    if (!swiper?.autoplay) {
      return;
    }

    if (manualPaused || reducedMotion) {
      swiper.autoplay.stop();
    } else if (!swiper.autoplay.running) {
      swiper.autoplay.start();
    }
  }, [manualPaused, reducedMotion]);

  const pauseAutoplay = () => {
    const autoplay = swiperRef.current?.autoplay;
    if (autoplay?.running && !autoplay.paused) {
      autoplay.pause();
    }
  };

  const resumeAutoplay = () => {
    const autoplay = swiperRef.current?.autoplay;
    if (
      autoplay?.running &&
      autoplay.paused &&
      !manualPaused &&
      !reducedMotion
    ) {
      autoplay.resume();
    }
  };

  return (
    <section
      aria-label="추천 여행지"
      className="relative isolate h-[max(100svh,42.5rem)] w-full overflow-hidden bg-gray-900 text-text-inverse"
    >
      <Swiper
        a11y={{ enabled: true }}
        autoplay={{
          delay: AUTOPLAY_DELAY,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          stopOnLastSlide: false,
          waitForTransition: true,
        }}
        className="absolute inset-0 h-full w-full"
        effect="fade"
        fadeEffect={{ crossFade: true }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        loop
        modules={[Autoplay, EffectFade, Keyboard, A11y]}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setActiveIndex(swiper.realIndex);

          if (manualPaused || reducedMotion) {
            swiper.autoplay.stop();
          }
        }}
        speed={1100}
      >
        {destinations.map((destination, index) => (
          <SwiperSlide
            aria-label={`${index + 1} / ${destinations.length}: ${destination.koreanName}`}
            className="relative h-full overflow-hidden bg-gray-900"
            key={destination.id}
          >
            <div aria-hidden="true" className="absolute inset-0 bg-gray-900">
              <Image
                alt=""
                className="object-cover object-center opacity-60"
                fill
                priority={index === 0}
                sizes="100vw"
                src={destination.background}
              />
              <div
                className={`absolute inset-0 ${destination.backgroundOverlayClass}`}
              />
            </div>

            <HeroContentContainer className="absolute inset-0 z-[1] h-full">
              <div
                aria-hidden="true"
                className={`destination-landmark-frame pointer-events-none absolute hidden md:block ${destination.landmarkFrameClass}`}
                data-destination={destination.id}
              >
                <div className="destination-landmark-motion relative h-full w-full overflow-hidden">
                  <Image
                    alt=""
                    className={destination.landmarkImageClass}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1920px) 1200px, (min-width: 768px) 63vw, 0px"
                    src={destination.landmark}
                  />
                </div>
              </div>

              <div className="relative h-full w-full">
                <article className="absolute left-0 right-0 top-[25%] z-[2] flex max-w-[690px] flex-col gap-[15px] sm:right-auto sm:top-[27%] lg:top-[26.6%]">
                  <div className="destination-copy-item flex flex-col items-start leading-none">
                    <p className="break-words text-[clamp(3.5rem,8.34vw,10rem)] font-normal uppercase leading-none md:whitespace-nowrap">
                      {destination.name}
                    </p>
                    <h1 className="text-[clamp(1.75rem,2.5vw,3rem)] font-normal leading-none text-white/80">
                      {destination.koreanName}
                    </h1>
                  </div>
                  <p className="destination-copy-item max-w-[680px] text-body-md leading-[1.6] text-white/93">
                    {destination.description.map((line, lineIndex) => (
                      <span key={line}>
                        {line}
                        {lineIndex < destination.description.length - 1 ? (
                          <>
                            <span className="lg:hidden"> </span>
                            <br className="hidden lg:block" />
                          </>
                        ) : null}
                      </span>
                    ))}
                  </p>
                  <Link
                    className="destination-copy-item inline-flex w-fit items-center gap-3 text-[16px] font-bold underline underline-offset-4 transition-opacity hover:opacity-80"
                    href="/schedules"
                  >
                    더 알아보기
                    <Image
                      alt=""
                      className="size-5"
                      height={20}
                      src="/images/destinations/arrow-right.svg"
                      width={20}
                    />
                  </Link>
                </article>
              </div>
            </HeroContentContainer>
          </SwiperSlide>
        ))}
      </Swiper>

      <HeroContentContainer className="pointer-events-none absolute inset-0 z-[3] h-full">
        <div className="relative h-full w-full">
          <nav
            aria-label="추천 여행지 선택"
            className="pointer-events-auto absolute bottom-8 left-0 right-0 flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none] lg:bottom-auto lg:left-auto lg:right-0 lg:top-[30.75%] lg:flex-col lg:items-end lg:gap-6 lg:overflow-visible lg:pb-0"
          >
            {destinations.map((destination, index) => {
              const active = index === activeIndex;

              return (
                <button
                  aria-current={active ? "true" : undefined}
                  aria-label={`${destination.koreanName} 슬라이드 보기`}
                  className={`relative flex h-[37px] shrink-0 items-center gap-4 text-left transition-colors lg:text-right ${
                    active
                      ? "text-blue-400"
                      : "text-text-inverse hover:text-text-inverse/80"
                  }`}
                  key={destination.id}
                  onClick={() => swiperRef.current?.slideToLoop(index)}
                  type="button"
                >
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="hidden h-8 w-0 items-center justify-center lg:flex"
                    >
                      <Image
                        alt=""
                        className="h-[22px] w-[52px] max-w-none shrink-0 rotate-90"
                        height={22}
                        src="/images/destinations/active-line.svg"
                        width={52}
                      />
                    </span>
                  ) : null}
                  <span
                    className="flex flex-col gap-0.5 leading-none lg:items-end"
                    onMouseEnter={pauseAutoplay}
                    onMouseLeave={resumeAutoplay}
                  >
                    <span className="text-[15px] font-bold tracking-[-0.01em]">
                      {destination.koreanName}
                    </span>
                    <span className="text-[15px] font-bold tracking-[0.04em]">
                      {destination.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </HeroContentContainer>

      <button
        aria-label={manualPaused ? "자동 재생 시작" : "자동 재생 일시정지"}
        className="sr-only focus:not-sr-only focus:absolute focus:bottom-4 focus:left-4 focus:z-10 focus:rounded-sm focus:bg-black/70 focus:px-4 focus:py-2 focus:text-body-sm"
        onClick={() => setManualPaused((paused) => !paused)}
        type="button"
      >
        {manualPaused ? "자동 재생 시작" : "자동 재생 일시정지"}
      </button>
    </section>
  );
}
