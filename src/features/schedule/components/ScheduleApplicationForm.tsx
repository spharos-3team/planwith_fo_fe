"use client";

import {
  Activity,
  Car,
  Footprints,
  Landmark,
  Leaf,
  type LucideIcon,
  MapPin,
  MoreHorizontal,
  Ship,
  Sparkles,
  TrainFront,
  Trash2,
  UserRound,
  Utensils,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";

const TOTAL_STEPS = 7;
const suggestedTags = ["tokyo", "newyork", "busan"] as const;
const destinationSuggestions = [
  "독일",
  "도미니카 공화국",
  "동티모르",
  "도쿄 디즈니 랜드",
  "도쿄, 일본",
];

const transportOptions = [
  { id: "public", label: "기차/대중교통", icon: TrainFront },
  { id: "ferry", label: "선박/페리", icon: Ship },
  { id: "rental", label: "렌터카", icon: Car },
  { id: "walk", label: "도보", icon: Footprints },
  { id: "other", label: "기타", icon: MoreHorizontal },
] as const;

const styleOptions = [
  { id: "landmark", label: "관광/랜드마크", icon: Landmark },
  { id: "healing", label: "휴식/힐링", icon: Leaf },
  { id: "food", label: "맛집 탐방", icon: Utensils },
  { id: "activity", label: "액티비티", icon: Activity },
] as const;

type NumericField = "people" | "budget";

interface ApplicationValues {
  destination: string;
  includeFlight: boolean;
  departure: string;
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  people: string;
  budget: string;
  transports: string[];
  styles: string[];
  request: string;
}

const glassInputClass =
  "h-[53px] border-0 bg-white/16 text-body-md text-text-inverse placeholder:text-white/75 focus:border-white/40";

function StepIndicator({ step }: { step: number }) {
  return (
    <ol
      aria-label={`전체 ${TOTAL_STEPS}단계 중 ${step}단계`}
      className="flex items-center gap-2"
    >
      {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map(
        (item) => (
          <li
            aria-current={item === step ? "step" : undefined}
            className={`h-2 rounded-full transition-all ${
              item === step ? "w-7 bg-text-inverse" : "w-2 bg-white/45"
            }`}
            key={item}
          />
        )
      )}
    </ol>
  );
}

function DateWheel({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ApplicationValues["startDate"];
  onChange: (value: ApplicationValues["startDate"]) => void;
}) {
  const update = (key: "year" | "month" | "day", next: number) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="w-full max-w-[790px]">
      <p className="text-left text-body-lg font-bold text-text-inverse">
        {label} : {value.year}년 {value.month}월 {value.day}일
      </p>
      <div className="mt-6 flex items-center justify-center gap-4">
        {[
          {
            key: "year" as const,
            value: value.year,
            options: Array.from({ length: 6 }, (_, index) => 2026 + index),
            aria: "연도",
          },
          {
            key: "month" as const,
            value: value.month,
            options: Array.from({ length: 12 }, (_, index) => index + 1),
            aria: "월",
          },
          {
            key: "day" as const,
            value: value.day,
            options: Array.from({ length: 31 }, (_, index) => index + 1),
            aria: "일",
          },
        ].map((picker, index) => (
          <div className="contents" key={picker.key}>
            {index > 0 ? <span className="h-20 w-px bg-white/30" /> : null}
            <select
              aria-label={picker.aria}
              className="h-[68px] w-24 appearance-none rounded-xl border-0 bg-blue-ice/25 text-center text-[2rem] font-bold text-white/90 outline-none focus:ring-2 focus:ring-brand-primary"
              onChange={(event) =>
                update(picker.key, Number(event.target.value))
              }
              value={picker.value}
            >
              {picker.options.map((option) => (
                <option
                  className="text-text-primary"
                  key={option}
                  value={option}
                >
                  {String(option).padStart(picker.key === "year" ? 4 : 2, "0")}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectionOption({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={selected}
      className={`flex h-28 min-w-28 flex-col items-center justify-center gap-3 rounded-lg border px-4 transition ${
        selected
          ? "border-brand-primary bg-brand-primary/45 text-text-inverse shadow-landmark"
          : "border-white/20 bg-white/12 text-white/80 hover:bg-white/20"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" className="h-7 w-7" />
      <span className="text-body-sm font-semibold">{label}</span>
    </button>
  );
}

function NumericKeypad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"].map(
        (key, index) => (
          <button
            aria-label={key === "delete" ? "한 자리 지우기" : key || "빈 칸"}
            className={`grid h-12 place-items-center rounded-md text-body-lg font-semibold text-text-inverse transition ${
              key ? "bg-white/10 hover:bg-white/20" : "pointer-events-none"
            }`}
            key={`${key}-${index}`}
            onClick={() => key && onKey(key)}
            type="button"
          >
            {key === "delete" ? (
              <Trash2 aria-hidden="true" className="h-5 w-5" />
            ) : (
              key
            )}
          </button>
        )
      )}
    </div>
  );
}

export function ScheduleApplicationForm() {
  const router = useRouter();
  const [flow, setFlow] = useState({
    step: 1,
    error: "",
    numericField: "people" as NumericField,
  });
  const [values, setValues] = useState<ApplicationValues>({
    destination: "",
    includeFlight: false,
    departure: "",
    startDate: { year: 2026, month: 8, day: 1 },
    endDate: { year: 2026, month: 8, day: 1 },
    people: "",
    budget: "",
    transports: [],
    styles: [],
    request: "",
  });

  const update = <Key extends keyof ApplicationValues>(
    key: Key,
    value: ApplicationValues[Key]
  ) => setValues((current) => ({ ...current, [key]: value }));

  const toggleArray = (key: "transports" | "styles", id: string) =>
    setValues((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((item) => item !== id)
        : [...current[key], id],
    }));

  const validate = () => {
    if (flow.step === 1 && !values.destination.trim()) {
      return "여행 목적지를 입력해주세요.";
    }
    if (flow.step === 1 && values.includeFlight && !values.departure.trim()) {
      return "항공권 정보를 위해 출발지를 입력해주세요.";
    }
    if (flow.step === 3) {
      const start = `${values.startDate.year}-${values.startDate.month}-${values.startDate.day}`;
      const end = `${values.endDate.year}-${values.endDate.month}-${values.endDate.day}`;
      if (end < start) return "도착일은 출발일보다 빠를 수 없습니다.";
    }
    if (flow.step === 4 && (!values.people || !values.budget)) {
      return "인원수와 예상 경비를 입력해주세요.";
    }
    if (flow.step === 5 && values.transports.length === 0) {
      return "선호하는 교통수단을 한 개 이상 선택해주세요.";
    }
    if (flow.step === 6 && values.styles.length === 0) {
      return "선호하는 여행 스타일을 한 개 이상 선택해주세요.";
    }
    return "";
  };

  const next = () => {
    const error = validate();
    if (error) {
      setFlow((current) => ({ ...current, error }));
      return;
    }
    if (flow.step === TOTAL_STEPS) {
      router.push("/login");
      return;
    }
    setFlow((current) => ({ ...current, step: current.step + 1, error: "" }));
  };

  const handleNumericKey = (key: string) => {
    const field = flow.numericField;
    const current = values[field];
    update(field, key === "delete" ? current.slice(0, -1) : `${current}${key}`);
  };

  const showSuggestions =
    flow.step === 1 && values.destination.trim().startsWith("도");

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
        <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
      </div>

      <div className="flex w-full max-w-3xl flex-1 flex-col items-center text-center">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-medium leading-tight text-text-inverse">
          AI 여행 일정 신청서
        </h1>
        <p className="mt-4 text-body-lg font-medium tracking-wide text-brand-primary">
          AI TRAVEL PLAN APPLICATION
        </p>

        <div className="mt-14 flex min-h-[380px] w-full items-start justify-center">
          {flow.step === 1 ? (
            <div className="relative w-full max-w-[502px] text-left">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-body-lg text-status-success">*</span>
                <label className="flex cursor-pointer items-center gap-2.5 p-2 text-body-md text-white/70">
                  <input
                    checked={values.includeFlight}
                    className="size-4 accent-brand-primary"
                    onChange={(event) =>
                      update("includeFlight", event.target.checked)
                    }
                    type="checkbox"
                  />
                  항공권 정보
                </label>
              </div>
              <InputField
                aria-label="여행 목적지"
                className={glassInputClass}
                icon={MapPin}
                onChange={(event) => update("destination", event.target.value)}
                placeholder="어디로 떠나고 싶으세요?"
                value={values.destination}
              />
              {values.includeFlight ? (
                <InputField
                  aria-label="출발지"
                  className={`mt-5 ${glassInputClass}`}
                  icon={MapPin}
                  onChange={(event) => update("departure", event.target.value)}
                  placeholder="출발지를 입력해주세요"
                  value={values.departure}
                />
              ) : null}
              {showSuggestions ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-10 rounded-md border border-white/15 bg-black/70 p-2 backdrop-blur-md">
                  {destinationSuggestions.map((suggestion) => (
                    <button
                      className="block w-full rounded-sm px-3 py-2 text-left text-body-sm text-white/85 hover:bg-white/10"
                      key={suggestion}
                      onClick={() => update("destination", suggestion)}
                      type="button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 flex justify-center gap-3 text-body-sm text-text-inverse">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => update("destination", tag)}
                    type="button"
                  >
                    # {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {flow.step === 2 ? (
            <DateWheel
              label="출발일"
              onChange={(startDate) => update("startDate", startDate)}
              value={values.startDate}
            />
          ) : null}

          {flow.step === 3 ? (
            <DateWheel
              label="도착일"
              onChange={(endDate) => update("endDate", endDate)}
              value={values.endDate}
            />
          ) : null}

          {flow.step === 4 ? (
            <div className="w-full max-w-md rounded-xl border border-white/15 bg-white/10 p-7 text-left backdrop-blur-md">
              <div className="grid gap-4">
                <button
                  className={`flex h-[53px] items-center gap-3 rounded-md px-4 ${
                    flow.numericField === "people"
                      ? "ring-2 ring-brand-primary"
                      : ""
                  } bg-white/12 text-white/85`}
                  onClick={() =>
                    setFlow((current) => ({
                      ...current,
                      numericField: "people",
                    }))
                  }
                  type="button"
                >
                  <UserRound aria-hidden="true" className="h-5 w-5" />
                  <span>{values.people || "몇명에서 가나요?"}</span>
                  <span className="ml-auto text-caption">명</span>
                </button>
                <button
                  className={`flex h-[53px] items-center gap-3 rounded-md px-4 ${
                    flow.numericField === "budget"
                      ? "ring-2 ring-brand-primary"
                      : ""
                  } bg-white/12 text-white/85`}
                  onClick={() =>
                    setFlow((current) => ({
                      ...current,
                      numericField: "budget",
                    }))
                  }
                  type="button"
                >
                  <WalletCards aria-hidden="true" className="h-5 w-5" />
                  <span>
                    {values.budget
                      ? Number(values.budget).toLocaleString("ko-KR")
                      : "예상 경비가 얼마나 되나요?"}
                  </span>
                  <span className="ml-auto text-caption">KRW</span>
                </button>
              </div>
              <div className="mt-7">
                <NumericKeypad onKey={handleNumericKey} />
              </div>
            </div>
          ) : null}

          {flow.step === 5 ? (
            <div>
              <p className="text-body-md text-text-inverse">
                선호하는 교통수단을 선택해주세요 (중복선택가능)
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {transportOptions.map((option) => (
                  <SelectionOption
                    icon={option.icon}
                    key={option.id}
                    label={option.label}
                    onClick={() => toggleArray("transports", option.id)}
                    selected={values.transports.includes(option.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {flow.step === 6 ? (
            <div>
              <p className="text-body-md text-text-inverse">
                선호하는 여행스타일을 선택해주세요 (중복선택가능)
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {styleOptions.map((option) => (
                  <SelectionOption
                    icon={option.icon}
                    key={option.id}
                    label={option.label}
                    onClick={() => toggleArray("styles", option.id)}
                    selected={values.styles.includes(option.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {flow.step === 7 ? (
            <div className="w-full max-w-2xl">
              <span className="mx-auto grid size-14 place-items-center rounded-circle bg-white/12 text-brand-primary">
                <Sparkles aria-hidden="true" className="h-7 w-7" />
              </span>
              <p className="mt-5 text-body-md text-text-inverse">
                마지막! 이제 여행을 떠나보아요
              </p>
              <InputField
                aria-label="추가 요청사항"
                className={`mt-7 ${glassInputClass}`}
                onChange={(event) => update("request", event.target.value)}
                placeholder="추가 요청사항을 적어주세요 (선택)"
                value={values.request}
              />
            </div>
          ) : null}
        </div>

        {flow.error ? (
          <p className="mt-4 text-body-sm text-status-error" role="alert">
            {flow.error}
          </p>
        ) : null}

        <div className="mt-8 flex items-center gap-3">
          {flow.step > 1 ? (
            <Button
              buttonStyle="ghost"
              className="text-white/75 hover:bg-white/10"
              onClick={() =>
                setFlow((current) => ({
                  ...current,
                  step: current.step - 1,
                  error: "",
                }))
              }
              pill
            >
              BACK
            </Button>
          ) : null}
          <Button
            className="h-[45px] min-w-[130px] bg-white/30 hover:bg-white/40"
            onClick={next}
            pill
          >
            {flow.step === TOTAL_STEPS ? "LOGIN" : "NEXT"}
          </Button>
        </div>

        <div className="mt-9">
          <StepIndicator step={flow.step} />
        </div>
      </div>
    </section>
  );
}
