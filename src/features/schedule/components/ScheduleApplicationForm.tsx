"use client";

import Image from "next/image";
import { useState } from "react";

const suggestedTags = ["tokyo", "newyork", "busan"] as const;

export function ScheduleApplicationForm() {
  const [destination, setDestination] = useState("");
  const [includeFlight, setIncludeFlight] = useState(false);

  return (
    <section
      aria-label="AI 여행 일정 신청"
      className="relative isolate flex min-h-dvh flex-col items-center overflow-hidden px-6 pb-16 pt-28 sm:px-8 lg:pt-36"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          alt=""
          className="object-cover object-center blur-[3.95px]"
          fill
          priority
          sizes="100vw"
          src="/images/schedules/hero-background.jpg"
        />
        <div className="absolute inset-0 bg-[rgba(110,110,110,0.61)] mix-blend-multiply" />
      </div>

      <div className="flex w-full max-w-[502px] flex-col items-center text-center">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-medium leading-tight text-text-inverse">
          AI 여행 일정 신청서
        </h1>
        <p className="mt-4 text-body-lg font-medium tracking-wide text-brand-primary">
          AI TRAVEL PLAN APPLICATION
        </p>

        <div className="mt-[4.375rem] w-full">
          <div className="mb-1.5 flex items-end justify-between px-0.5">
            <span
              aria-hidden="true"
              className="text-body-lg font-medium text-status-success"
            >
              *
            </span>
            <label className="inline-flex cursor-pointer items-center gap-2.5 p-2.5">
              <input
                checked={includeFlight}
                className="size-[13px] shrink-0 rounded-xs border-[1.6px] border-gray-700/80 bg-transparent accent-brand-primary"
                onChange={(event) => setIncludeFlight(event.target.checked)}
                type="checkbox"
              />
              <span className="text-body-md text-gray-700/80">항공권 정보</span>
            </label>
          </div>

          <label className="sr-only" htmlFor="schedule-destination">
            목적지
          </label>
          <div className="flex h-[53px] w-full items-center gap-2 rounded-md bg-white/16 px-4 py-3.5">
            <Image
              alt=""
              aria-hidden="true"
              className="shrink-0"
              height={18}
              src="/images/schedules/map-pin.svg"
              width={18}
            />
            <input
              className="min-w-0 flex-1 bg-transparent text-body-md text-white/80 outline-none placeholder:text-white/80"
              id="schedule-destination"
              onChange={(event) => setDestination(event.target.value)}
              placeholder="어디로 떠나고 싶으세요?"
              type="text"
              value={destination}
            />
          </div>
        </div>

        <p className="mt-4 text-body-sm text-text-inverse">
          {suggestedTags.map((tag, index) => (
            <button
              className="transition hover:text-white/80"
              key={tag}
              onClick={() => setDestination(tag)}
              type="button"
            >
              {index > 0 ? "   " : ""}# {tag}
            </button>
          ))}
        </p>

        <button
          className="mt-[3.375rem] inline-flex h-[45px] w-[130px] items-center justify-center rounded-full bg-white/30 px-[30px] py-[15px] text-body-md font-bold uppercase tracking-wide text-text-inverse transition hover:bg-white/40"
          type="button"
        >
          NEXT
        </button>

        <Image
          alt="1단계 진행 중"
          className="mt-9 h-[17px] w-[83px]"
          height={17}
          src="/images/schedules/step-indicator.svg"
          width={83}
        />
      </div>
    </section>
  );
}
