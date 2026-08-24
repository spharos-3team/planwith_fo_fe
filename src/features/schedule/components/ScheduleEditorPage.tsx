"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { Modal } from "@/components/common/Modal";

type EditorMode = "create" | "edit";
type EditorModal = "saved" | "delete" | "deleted" | "reviewSaved" | null;

interface ScheduleEditorPageProps {
  mode: EditorMode;
  scheduleId?: string;
}

const scheduleColors = [
  "bg-brand-primary",
  "bg-accent-gold",
  "bg-accent-ai",
  "bg-status-error",
  "bg-status-success",
  "bg-footer-bar",
] as const;

const aiReviewText =
  "Day 1: 서울역 출발 (06:00) → KTX 부산행 → 부산역 도착 (08:30) → 해운대 해수욕장 산책 → 동백섬 해안 산책로 → 자갈치 시장 점심 → 감천문화마을 관광 → 광안리 해변 야경\n\nDay 2: 태종대 유원지 관광 → 영도 절영해안산책로 → 국제시장 점심 → 용두산공원 부산타워 전망 → 부산역 출발";

function EditorHero() {
  return (
    <section className="relative h-[clamp(260px,26vw,500px)] overflow-hidden">
      <Image
        alt="세계 지도 위에 놓인 여권과 여행 장비"
        className="object-cover object-center"
        fill
        priority
        sizes="100vw"
        src="/images/schedules/editor-hero.jpg"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-x-0 bottom-[16%] mx-auto w-full max-w-6xl px-6 sm:px-10">
        <h1 className="text-[clamp(2.25rem,3vw,3.5rem)] font-medium text-text-inverse">
          ADD PLAN
        </h1>
        <p className="mt-2 text-body-sm text-white/90">
          나만의 새로운 추억, 자유롭게 채워보는 일정
        </p>
      </div>
    </section>
  );
}

export function ScheduleEditorPage({ mode }: ScheduleEditorPageProps) {
  const router = useRouter();
  const editing = mode === "edit";
  const [editor, setEditor] = useState({
    destination: editing ? "교토" : "",
    startDate: editing ? "2026-08-03" : "",
    endDate: editing ? "2026-08-03" : "",
    title: editing ? "돈키호테털기" : "",
    content: editing ? "도착 후 체크인 → 시부야 탐방 → 저녁 식사" : "",
    colorIndex: 0,
    reviewActive: false,
  });
  const [modal, setModal] = useState<EditorModal>(null);
  const [error, setError] = useState("");

  const update = (key: keyof typeof editor, value: string | number | boolean) =>
    setEditor((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !editor.destination.trim() ||
      !editor.startDate ||
      !editor.endDate ||
      !editor.title.trim()
    ) {
      setError("필수 입력 항목을 모두 입력해주세요.");
      return;
    }
    if (editor.startDate > editor.endDate) {
      setError("종료일은 출발일보다 빠를 수 없습니다.");
      return;
    }
    setError("");
    setModal("saved");
  };

  const startAiReview = () => {
    setEditor((current) => ({
      ...current,
      reviewActive: true,
      content: aiReviewText,
    }));
  };

  return (
    <div className="bg-surface-default">
      <EditorHero />

      <form
        className="mx-auto w-full max-w-6xl px-6 py-section-y sm:px-10"
        onSubmit={submit}
      >
        <section>
          <h2 className="text-heading-lg text-text-primary">기본정보</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-16">
            <InputField
              error={
                !editor.destination && error
                  ? "여행 목적지를 입력해주세요."
                  : undefined
              }
              label="여행 목적지 *"
              onChange={(event) => update("destination", event.target.value)}
              placeholder="예) 도쿄, 교토, 제주도"
              value={editor.destination}
            />
            <fieldset>
              <legend className="mb-1.5 text-label-sm text-text-primary">
                여행 기간 *
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  aria-label="출발일"
                  onChange={(event) => update("startDate", event.target.value)}
                  type="date"
                  value={editor.startDate}
                />
                <InputField
                  aria-label="도착일"
                  min={editor.startDate}
                  onChange={(event) => update("endDate", event.target.value)}
                  type="date"
                  value={editor.endDate}
                />
              </div>
            </fieldset>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-heading-lg text-text-primary">세부 정보</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-16">
            <InputField
              error={
                !editor.title && error ? "일정 제목을 입력해주세요." : undefined
              }
              label="일정 제목"
              onChange={(event) => update("title", event.target.value)}
              placeholder="예) 도쿄 5일 자유여행"
              value={editor.title}
            />

            <fieldset>
              <legend className="text-label-sm text-text-primary">
                캘린더 표시 색상
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {scheduleColors.map((color, index) => (
                  <button
                    aria-label={`${index + 1}번 일정 색상`}
                    aria-pressed={editor.colorIndex === index}
                    className={`size-6 rounded-circle ${color} ${
                      editor.colorIndex === index
                        ? "ring-2 ring-brand-primary ring-offset-2"
                        : ""
                    }`}
                    key={color}
                    onClick={() => update("colorIndex", index)}
                    type="button"
                  />
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
              <label
                className="text-label-sm text-text-primary"
                htmlFor="schedule-content"
              >
                일정 내용 / 메모
              </label>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    buttonStyle="secondary"
                    className="h-9 border-accent-gold text-badge-orange-fg"
                    icon="left"
                    iconComponent={Sparkles}
                    onClick={startAiReview}
                    size="sm"
                    type="button"
                  >
                    {editor.reviewActive ? "AI 첨삭 재수정" : "AI 첨삭 수정"}
                  </Button>
                  {editor.reviewActive ? (
                    <Button
                      className="h-9 bg-accent-gold hover:bg-accent-gold/90"
                      onClick={() => setModal("reviewSaved")}
                      size="sm"
                      type="button"
                    >
                      AI 첨삭 저장
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
            {editor.reviewActive ? (
              <p className="mb-2 text-caption text-brand-primary">
                AI 첨삭 시 ‘AI 첨삭 저장’을 눌러야 해당 내용이 저장됩니다.
              </p>
            ) : null}
            <textarea
              className="min-h-44 w-full resize-y rounded-sm border border-line-default bg-surface-default px-4 py-3 text-body-sm text-text-primary outline-none transition placeholder:text-text-disabled focus:border-brand-primary"
              id="schedule-content"
              onChange={(event) => update("content", event.target.value)}
              placeholder="예) 도착 후 체크인 → 시부야 탐방 → 저녁 식사"
              value={editor.content}
            />
          </div>

          <div className="mt-7">
            <p className="text-label-sm text-text-primary">
              일정 생성 유형 (자동 지정)
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="gray">AI 생성 일정</Badge>
              <Badge
                tone={editor.reviewActive ? "gray" : "blue"}
                variant="solid"
              >
                내 일정
              </Badge>
              <Badge tone="gray">공유 일정</Badge>
              <Badge
                tone={editor.reviewActive ? "orange" : "gray"}
                variant={editor.reviewActive ? "solid" : "subtle"}
              >
                AI 첨삭
              </Badge>
            </div>
          </div>
        </section>

        {error ? (
          <p className="mt-6 text-body-sm text-status-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-16 flex flex-wrap justify-end gap-3">
          <Button
            buttonStyle="secondary"
            onClick={() => router.back()}
            type="button"
          >
            취소
          </Button>
          {editing ? (
            <Button
              buttonStyle="danger"
              className="border border-status-error bg-transparent text-status-error hover:bg-status-error/10"
              onClick={() => setModal("delete")}
              type="button"
            >
              삭제
            </Button>
          ) : null}
          <Button type="submit">{editing ? "일정 저장" : "일정 생성"}</Button>
        </div>
      </form>

      <Modal
        description={
          editing
            ? "일정 수정 내용이 저장되었습니다."
            : "새 일정이 생성되었습니다."
        }
        onClose={() => setModal(null)}
        open={modal === "saved"}
        primaryAction={{
          label: "캘린더로 이동",
          onClick: () => router.push("/schedules/calendar"),
        }}
        title={editing ? "일정 저장 완료" : "일정 생성 완료"}
        variant="success"
      />
      <Modal
        cancelAction={{ label: "취소", onClick: () => setModal(null) }}
        confirmAction={{
          label: "삭제하기",
          onClick: () => setModal("deleted"),
        }}
        description="삭제한 일정은 복구할 수 없습니다."
        onClose={() => setModal(null)}
        open={modal === "delete"}
        title="일정을 삭제하시겠어요?"
        variant="confirm"
      />
      <Modal
        description="일정이 안전하게 삭제되었습니다."
        onClose={() => setModal(null)}
        open={modal === "deleted"}
        primaryAction={{
          label: "확인",
          onClick: () => router.push("/schedules/calendar"),
        }}
        title="일정 삭제 완료"
        variant="success"
      />
      <Modal
        description="AI 첨삭 내용이 일정에 반영되었습니다."
        onClose={() => setModal(null)}
        open={modal === "reviewSaved"}
        primaryAction={{ label: "확인", onClick: () => setModal(null) }}
        title="AI 첨삭 수정 완료"
        variant="success"
      />
    </div>
  );
}
