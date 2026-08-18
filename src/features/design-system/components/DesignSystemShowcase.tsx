"use client";

import { Calendar, MapPin } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { StatusMessage } from "@/components/common/StatusMessage";

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="grid gap-6">
      <div>
        <h2 className="text-heading-lg text-text-primary">{title}</h2>
        {description && (
          <p className="mt-2 text-body-sm text-text-secondary">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

interface ColorSwatchProps {
  name: string;
  className: string;
  hex?: string;
  textClass?: string;
}

function ColorSwatch({
  name,
  className,
  hex,
  textClass = "text-text-primary",
}: ColorSwatchProps) {
  return (
    <div className="grid gap-2">
      <div
        className={`h-14 rounded-md border border-line-light ${className}`}
      />
      <div>
        <p className={`text-caption-sm ${textClass}`}>{name}</p>
        {hex && <p className="text-caption text-text-disabled">{hex}</p>}
      </div>
    </div>
  );
}

const primitiveGray = [
  { name: "white", className: "bg-white", hex: "#FFFFFF" },
  { name: "gray-200", className: "bg-gray-200", hex: "#EBEBEB" },
  { name: "gray-300", className: "bg-gray-300", hex: "#D9D9D9" },
  { name: "gray-500", className: "bg-gray-500", hex: "#8F8F8D" },
  { name: "gray-600", className: "bg-gray-600", hex: "#646464" },
  { name: "gray-700", className: "bg-gray-700", hex: "#5B5B5A" },
  { name: "gray-800", className: "bg-gray-800", hex: "#2F2F2F" },
  { name: "gray-900", className: "bg-gray-900", hex: "#202020" },
  { name: "black", className: "bg-black", hex: "#000000" },
];

const primitiveBlue = [
  { name: "blue-ice", className: "bg-blue-ice", hex: "#E6EBF2" },
  { name: "blue-light", className: "bg-blue-light", hex: "#D5E6F0" },
  { name: "blue-200", className: "bg-blue-200", hex: "#ADE1FF" },
  { name: "blue-400", className: "bg-blue-400", hex: "#77A5FF" },
  { name: "blue-500-token", className: "bg-blue-500-token", hex: "#538DFF" },
  { name: "blue-600-token", className: "bg-blue-600-token", hex: "#387BFF" },
  { name: "blue-700", className: "bg-blue-700", hex: "#002BFF" },
  { name: "blue-900", className: "bg-blue-900", hex: "#003268" },
  { name: "blue-gray", className: "bg-blue-gray", hex: "#89A3D9" },
];

const primitiveAccent = [
  { name: "orange", className: "bg-orange", hex: "#E39A2E" },
  { name: "purple", className: "bg-purple", hex: "#8B5CF6" },
  { name: "red", className: "bg-red", hex: "#FF4B4B" },
  { name: "green", className: "bg-green", hex: "#8FD790" },
  { name: "green-light", className: "bg-green-light", hex: "#EAF9F1" },
];

const semanticColors = [
  {
    name: "text-primary",
    className: "bg-text-primary",
    hex: "#2F2F2F",
    textClass: "text-text-inverse",
  },
  {
    name: "text-secondary",
    className: "bg-text-secondary",
    hex: "#646464",
    textClass: "text-text-inverse",
  },
  {
    name: "text-disabled",
    className: "bg-text-disabled",
    hex: "#8F8F8D",
    textClass: "text-text-inverse",
  },
  {
    name: "brand-primary",
    className: "bg-brand-primary",
    hex: "#387BFF",
    textClass: "text-text-inverse",
  },
  {
    name: "brand-primary-hover",
    className: "bg-brand-primary-hover",
    hex: "#538DFF",
    textClass: "text-text-inverse",
  },
  {
    name: "accent-gold",
    className: "bg-accent-gold",
    hex: "#E39A2E",
    textClass: "text-text-inverse",
  },
  {
    name: "accent-ai",
    className: "bg-accent-ai",
    hex: "#8B5CF6",
    textClass: "text-text-inverse",
  },
  {
    name: "status-error",
    className: "bg-status-error",
    hex: "#FF4B4B",
    textClass: "text-text-inverse",
  },
  {
    name: "status-success",
    className: "bg-status-success",
    hex: "#8FD790",
    textClass: "text-text-primary",
  },
  {
    name: "status-success-bg",
    className: "bg-status-success-bg",
    hex: "#EAF9F1",
    textClass: "text-text-primary",
  },
  {
    name: "line-default",
    className: "bg-line-default",
    hex: "#89A3D9",
    textClass: "text-text-primary",
  },
  {
    name: "footer-bar",
    className: "bg-footer-bar",
    hex: "#78B7F3",
    textClass: "text-text-inverse",
  },
  {
    name: "header-branded",
    className: "bg-header-branded",
    hex: "#7AB8FF",
    textClass: "text-text-inverse",
  },
  {
    name: "header-nav-active",
    className: "bg-header-nav-active",
    hex: "#002BFF",
    textClass: "text-text-inverse",
  },
  {
    name: "header-surface",
    className: "bg-header-surface",
    hex: "black / 88%",
    textClass: "text-text-inverse",
  },
  {
    name: "surface-page",
    className: "bg-surface-page border border-line-light",
    hex: "#F8FAFC",
    textClass: "text-text-primary",
  },
];

const typographySamples = [
  { token: "text-heading-hero", sample: "PLAN&WITH Hero", label: "48px Bold" },
  { token: "text-heading-xl", sample: "페이지 대제목", label: "24px Bold" },
  { token: "text-heading-lg", sample: "섹션 제목", label: "18px Bold" },
  { token: "text-heading-md", sample: "카드 제목", label: "16px Bold" },
  { token: "text-heading-sm", sample: "소제목 / 탭", label: "15px Bold" },
  { token: "text-body-lg", sample: "큰 본문 텍스트", label: "18px Medium" },
  { token: "text-body-md", sample: "기본 본문 텍스트", label: "15px Medium" },
  { token: "text-body-sm", sample: "보조 본문 텍스트", label: "14px Regular" },
  { token: "text-body-xs", sample: "작은 본문", label: "13px Regular" },
  { token: "text-caption", sample: "캡션 / 라벨", label: "12px Regular" },
  { token: "text-caption-sm", sample: "뱃지", label: "11px Bold" },
  { token: "text-label-md", sample: "강조 라벨", label: "15px SemiBold" },
  { token: "text-label-sm", sample: "폼 라벨", label: "14px SemiBold" },
  { token: "text-data-md", sample: "2026-08-18", label: "14px Regular" },
  { token: "text-nav-md", sample: "Navigation", label: "14px SemiBold" },
  { token: "text-nav-lg", sample: "Large Nav", label: "20px SemiBold" },
];

const radiusSamples = [
  { token: "rounded-xs", px: "4px", usage: "태그 / 뱃지" },
  { token: "rounded-sm", px: "6px", usage: "인풋 / 작은 카드" },
  { token: "rounded-md", px: "8px", usage: "버튼 / 일반 카드" },
  { token: "rounded-lg", px: "12px", usage: "큰 카드 / 모달" },
  { token: "rounded-xl", px: "20px", usage: "히어로 카드" },
  { token: "rounded-full", px: "30px", usage: "Pill 버튼 / 탭" },
  { token: "rounded-circle", px: "9999px", usage: "원형 아바타" },
];

const spacingSamples = [
  { token: "gap-stack", px: "1rem", usage: "폼 필드·스택 간격" },
  { token: "p-card", px: "1.5rem", usage: "카드·모달 패딩" },
  { token: "py-section-y", px: "4rem", usage: "섹션 세로 여백" },
];

const selectDemoOptions = [
  { value: "tokyo", label: "도쿄, 일본" },
  { value: "osaka", label: "오사카, 일본" },
  { value: "busan", label: "부산, 대한민국" },
];

function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="md">
        Dialog 열기
      </Button>
      <Dialog
        description="Dialog 공통 컴포넌트 데모입니다."
        onClose={() => setOpen(false)}
        open={open}
        title="확인"
      >
        <p className="text-body-sm text-text-secondary">
          Escape 키, 오버레이 클릭, 닫기 버튼으로 닫을 수 있습니다.
        </p>
        <div className="mt-stack flex justify-end">
          <Button onClick={() => setOpen(false)} size="md">
            확인
          </Button>
        </div>
      </Dialog>
    </>
  );
}

export function DesignSystemShowcase() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:py-20">
      <header className="mb-16 border-b border-line-light pb-10">
        <p className="text-label-sm text-brand-primary">DESIGN SYSTEM</p>
        <h1 className="mt-3 text-heading-xl text-text-primary">
          PLAN&WITH Design System
        </h1>
        <p className="mt-4 max-w-3xl text-body-md text-text-secondary">
          Primitive → Semantic 토큰, Gothic A1 타이포그래피, Button / InputField
          / SelectField / Dialog / StatusMessage 공통 컴포넌트를 정리한 내부
          참고 페이지입니다. 신규 UI는 semantic 토큰과 common 컴포넌트를 우선
          사용합니다.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-line-light bg-surface-default p-4">
            <dt className="text-caption text-text-disabled">Font</dt>
            <dd className="mt-1 text-body-sm text-text-primary">Gothic A1</dd>
          </div>
          <div className="rounded-lg border border-line-light bg-surface-default p-4">
            <dt className="text-caption text-text-disabled">Token source</dt>
            <dd className="mt-1 text-body-sm text-text-primary">
              src/app/globals.css
            </dd>
          </div>
          <div className="rounded-lg border border-line-light bg-surface-default p-4">
            <dt className="text-caption text-text-disabled">Components</dt>
            <dd className="mt-1 text-body-sm text-text-primary">
              Button, InputField, SelectField, Dialog, StatusMessage
            </dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-20">
        <Section
          description="컴포넌트에 직접 쓰지 않고 semantic 토큰으로 연결합니다."
          title="Primitive Color — Gray"
        >
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
            {primitiveGray.map((color) => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
        </Section>

        <Section title="Primitive Color — Blue">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
            {primitiveBlue.map((color) => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
        </Section>

        <Section title="Primitive Color — Accent / Status">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
            {primitiveAccent.map((color) => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
        </Section>

        <Section
          description="UI에서는 가능한 semantic 클래스(text-*, bg-*, border-*)를 사용합니다."
          title="Semantic Color"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {semanticColors.map((color) => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
          <p className="text-caption text-text-disabled">
            Legacy: text-primary(#2563eb), text-muted, bg-background 등 기존
            화면 호환 alias도 globals.css에 유지됩니다.
          </p>
        </Section>

        <Section
          description="모든 스타일은 Gothic A1 단일 폰트 패밀리를 사용합니다."
          title="Typography"
        >
          <div className="grid gap-4">
            {typographySamples.map(({ token, sample, label }) => (
              <div
                className="flex flex-col gap-1 border-b border-line-light py-4 sm:flex-row sm:items-baseline sm:justify-between"
                key={token}
              >
                <p className={`${token} text-text-primary`}>{sample}</p>
                <div className="shrink-0 text-right">
                  <p className="text-caption-sm text-brand-primary">{token}</p>
                  <p className="text-caption text-text-disabled">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          description="반복 spacing은 semantic 토큰을 우선 사용합니다."
          title="Spacing"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {spacingSamples.map(({ token, px, usage }) => (
              <div
                className="rounded-lg border border-line-light bg-surface-default p-4"
                key={token}
              >
                <p className="text-label-sm text-text-primary">{token}</p>
                <p className="text-caption text-text-disabled">{px}</p>
                <p className="mt-2 text-caption text-text-secondary">{usage}</p>
                <div
                  className={`mt-3 rounded-sm bg-brand-primary/15 ${token === "gap-stack" ? "flex gap-stack p-2" : token === "p-card" ? "p-card" : "py-section-y"}`}
                >
                  {token === "gap-stack" ? (
                    <>
                      <span className="h-6 flex-1 rounded-xs bg-brand-primary/40" />
                      <span className="h-6 flex-1 rounded-xs bg-brand-primary/40" />
                    </>
                  ) : (
                    <span className="block text-caption text-brand-primary">
                      preview
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radius">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {radiusSamples.map(({ token, px, usage }) => (
              <div
                className="flex items-center gap-4 rounded-lg border border-line-light bg-surface-default p-4"
                key={token}
              >
                <div
                  className={`h-16 w-16 shrink-0 border-2 border-brand-primary bg-brand-primary/10 ${token}`}
                />
                <div>
                  <p className="text-label-sm text-text-primary">{token}</p>
                  <p className="text-caption text-text-disabled">{px}</p>
                  <p className="text-caption text-text-secondary">{usage}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          description="현재 화면에서 사용 중인 effect만 토큰화했습니다."
          title="Effect"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-line-light bg-surface-default p-6">
              <p className="text-label-sm text-text-primary">header-branded</p>
              <p className="mt-1 text-caption text-text-secondary">
                bg-header-branded — solid Header 배경
              </p>
              <div className="mt-4 rounded-md bg-header-branded px-4 py-3 text-body-sm text-text-inverse">
                Branded Header 배경
              </div>
            </div>
            <div className="rounded-lg border border-line-light bg-surface-default p-6">
              <p className="text-label-sm text-text-primary">
                drop-shadow-landmark
              </p>
              <p className="mt-1 text-caption text-text-secondary">
                히어로 랜드마크 이미지 그림자
              </p>
              <div className="mt-4 flex justify-center">
                <div className="h-20 w-20 rounded-lg bg-brand-primary drop-shadow-landmark" />
              </div>
            </div>
          </div>
        </Section>

        <Section
          description="size(sm/md/lg), style(primary/secondary/ghost), icon(left), pill 옵션"
          title="Button"
        >
          <div className="grid gap-10">
            <div>
              <p className="mb-4 text-label-sm text-text-secondary">Primary</p>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button icon="left" size="md">
                  AI 일정생성
                </Button>
                <Button pill size="md">
                  Pill
                </Button>
                <Button disabled size="md">
                  Disabled
                </Button>
              </div>
            </div>
            <div>
              <p className="mb-4 text-label-sm text-text-secondary">
                Secondary / Ghost
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button buttonStyle="secondary" size="md">
                  Secondary
                </Button>
                <Button buttonStyle="ghost" size="md">
                  Ghost
                </Button>
                <Button buttonStyle="secondary" disabled size="md">
                  Disabled
                </Button>
              </div>
            </div>
          </div>
        </Section>

        <Section
          description="label, icon, error, disabled 상태를 지원합니다."
          title="Input Field"
        >
          <div className="grid max-w-md gap-6">
            <InputField label="목적지" placeholder="어디로 떠나시나요?" />
            <InputField
              defaultValue="도쿄, 일본"
              icon={MapPin}
              label="목적지"
              placeholder="도시 또는 국가"
            />
            <InputField
              icon={Calendar}
              label="출발일"
              placeholder="날짜 선택"
              type="date"
            />
            <InputField
              defaultValue="잘못된 입력"
              error="올바른 목적지를 입력해 주세요."
              label="목적지"
            />
            <InputField
              disabled
              label="목적지"
              placeholder="비활성화"
              value="수정 불가"
            />
          </div>
        </Section>

        <Section
          description="빈 목록, 에러, 로딩 등 상태 표시에 사용합니다."
          title="Status Message"
        >
          <div className="grid max-w-md gap-4">
            <StatusMessage>등록된 일정이 없습니다.</StatusMessage>
            <StatusMessage role="alert">
              일정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </StatusMessage>
          </div>
        </Section>

        <Section
          description="label, error, disabled, placeholder — InputField API와 동일 패턴"
          title="Select Field"
        >
          <div className="grid max-w-md gap-6">
            <SelectField
              label="목적지"
              options={selectDemoOptions}
              placeholder="도시를 선택하세요"
            />
            <SelectField
              defaultValue="tokyo"
              label="목적지"
              options={selectDemoOptions}
            />
            <SelectField
              error="목적지를 선택해 주세요."
              label="목적지"
              options={selectDemoOptions}
              placeholder="도시를 선택하세요"
            />
            <SelectField
              disabled
              label="목적지"
              options={selectDemoOptions}
              value="tokyo"
            />
          </div>
        </Section>

        <Section
          description="open, onClose, title, children — portal + overlay + Escape"
          title="Dialog"
        >
          <DialogDemo />
        </Section>

        <Section
          description="SiteLayout route group + Header/Footer variant로 shell을 관리합니다."
          title="Layout (적용 현황)"
        >
          <ul className="grid gap-3 text-body-sm text-text-secondary">
            <li className="rounded-md border border-line-light bg-surface-default px-4 py-3">
              <strong className="text-text-primary">SiteLayout</strong> —{" "}
              <code className="text-caption">(hero)</code> overlay,{" "}
              <code className="text-caption">(main)</code> solid(branded)
            </li>
            <li className="rounded-md border border-line-light bg-surface-default px-4 py-3">
              <strong className="text-text-primary">Header</strong> — overlay
              (/, /schedules) / solid bg-header-branded, 텍스트 nav + active
              pill
            </li>
            <li className="rounded-md border border-line-light bg-surface-default px-4 py-3">
              <strong className="text-text-primary">Footer</strong> —{" "}
              <code className="text-caption">bg-header-branded</code> 본문 +{" "}
              <code className="text-caption">bg-footer-bar</code> copyright
              (solid) / overlay는 copyright bar 숨김
            </li>
            <li className="rounded-md border border-line-light bg-surface-default px-4 py-3">
              <strong className="text-text-primary">DestinationHero</strong> —
              활성 탭 text-footer-bar, drop-shadow-landmark
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
