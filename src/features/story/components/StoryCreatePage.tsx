"use client";

import { Check, ImagePlus, MapPin, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useState,
} from "react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { ContentContainer } from "@/components/common/layout/ContentContainer";
import { SelectField } from "@/components/common/SelectField";

interface StoryPlace {
  id: string;
  name: string;
  imageName: string;
}

interface StoryCity {
  id: string;
  name: string;
  places: StoryPlace[];
}

interface StoryCountry {
  id: string;
  name: string;
  cities: StoryCity[];
}

interface StoryFormValues {
  coverPreview: string;
  title: string;
  startDate: string;
  endDate: string;
  visibility: string;
  content: string;
  routes: StoryCountry[];
  tagInput: string;
  tags: string[];
  commentEnabled: boolean;
  scheduleVisible: boolean;
  aiVerificationRequested: boolean;
}

interface RequestState {
  submitting: boolean;
  message: string;
}

const visibilityOptions = [
  { value: "PUBLIC", label: "전체 공개" },
  { value: "FOLLOWERS", label: "팔로워 공개" },
  { value: "PRIVATE", label: "비공개" },
];

const initialValues: StoryFormValues = {
  coverPreview: "",
  title: "",
  startDate: "",
  endDate: "",
  visibility: "PUBLIC",
  content: "",
  routes: [
    {
      id: "country-1",
      name: "",
      cities: [
        {
          id: "city-1",
          name: "",
          places: [{ id: "place-1", name: "", imageName: "" }],
        },
      ],
    },
  ],
  tagInput: "",
  tags: [],
  commentEnabled: true,
  scheduleVisible: false,
  aiVerificationRequested: false,
};

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function EditorCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line-light bg-surface-default p-6 sm:p-8">
      <p className="text-caption-sm text-accent-gold">{eyebrow}</p>
      <h2 className="mt-1 text-heading-lg text-text-primary">{title}</h2>
      {description ? (
        <p className="mt-2 text-caption text-text-secondary">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">
      <div>
        <p className="text-label-sm text-text-primary">{label}</p>
        <p className="mt-1 text-caption text-text-secondary">{description}</p>
      </div>
      <button
        aria-checked={checked}
        aria-label={label}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-brand-primary" : "bg-gray-300"
        }`}
        onClick={onChange}
        role="switch"
        type="button"
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 size-4 rounded-circle bg-surface-default transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export function StoryCreatePage() {
  const [values, setValues] = useState<StoryFormValues>(initialValues);
  const [request, setRequest] = useState<RequestState>({
    submitting: false,
    message: "",
  });

  const updateValue = <Key extends keyof StoryFormValues>(
    key: Key,
    value: StoryFormValues[Key]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        updateValue("coverPreview", reader.result);
      }
    });
    reader.readAsDataURL(file);
  };

  const updateCountry = (
    countryId: string,
    updater: (country: StoryCountry) => StoryCountry
  ) => {
    updateValue(
      "routes",
      values.routes.map((country) =>
        country.id === countryId ? updater(country) : country
      )
    );
  };

  const updateCity = (
    countryId: string,
    cityId: string,
    updater: (city: StoryCity) => StoryCity
  ) => {
    updateCountry(countryId, (country) => ({
      ...country,
      cities: country.cities.map((city) =>
        city.id === cityId ? updater(city) : city
      ),
    }));
  };

  const addCountry = () => {
    updateValue("routes", [
      ...values.routes,
      {
        id: createId("country"),
        name: "",
        cities: [
          {
            id: createId("city"),
            name: "",
            places: [{ id: createId("place"), name: "", imageName: "" }],
          },
        ],
      },
    ]);
  };

  const addCity = (countryId: string) => {
    updateCountry(countryId, (country) => ({
      ...country,
      cities: [
        ...country.cities,
        {
          id: createId("city"),
          name: "",
          places: [{ id: createId("place"), name: "", imageName: "" }],
        },
      ],
    }));
  };

  const addPlace = (countryId: string, cityId: string) => {
    updateCity(countryId, cityId, (city) => ({
      ...city,
      places: [
        ...city.places,
        { id: createId("place"), name: "", imageName: "" },
      ],
    }));
  };

  const addTag = () => {
    const tag = values.tagInput.trim().replace(/^#/, "");
    if (!tag || values.tags.includes(tag) || values.tags.length >= 5) {
      return;
    }
    setValues((current) => ({
      ...current,
      tagInput: "",
      tags: [...current.tags, tag],
    }));
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  const handleDraft = () => {
    setRequest({
      submitting: false,
      message: "임시저장 API 연결 후 저장할 수 있습니다.",
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequest({
      submitting: false,
      message: "스토리 등록 API 연결 후 등록할 수 있습니다.",
    });
  };

  const checklist = [
    { label: "대표 이미지", complete: Boolean(values.coverPreview) },
    { label: "제목 입력", complete: Boolean(values.title.trim()) },
    {
      label: "여행 기간",
      complete: Boolean(values.startDate && values.endDate),
    },
    {
      label: "여정 1개 이상",
      complete: values.routes.some((country) =>
        country.cities.some((city) =>
          city.places.some((place) => Boolean(place.name.trim()))
        )
      ),
    },
  ];

  return (
    <div className="min-h-full bg-surface-page pb-20">
      <ContentContainer className="py-7">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <nav
              aria-label="breadcrumb"
              className="flex items-center gap-2 text-caption text-text-secondary"
            >
              <Link
                className="hover:text-text-primary"
                href="/community/stories"
              >
                커뮤니티
              </Link>
              <span aria-hidden="true">&gt;</span>
              <span className="text-text-primary">스토리 작성</span>
            </nav>
            <div className="flex gap-2">
              <Button buttonStyle="secondary" onClick={handleDraft} size="sm">
                임시저장
              </Button>
              <Button
                disabled={request.submitting}
                form="story-create-form"
                size="sm"
                type="submit"
              >
                등록하기
              </Button>
            </div>
          </div>

          {request.message ? (
            <p
              className="mt-4 rounded-md bg-blue-ice px-4 py-3 text-body-sm text-text-secondary"
              role="status"
            >
              {request.message}
            </p>
          ) : null}

          <div className="mt-6 grid items-start gap-6">
            <form
              className="grid gap-6"
              id="story-create-form"
              onSubmit={handleSubmit}
            >
              <EditorCard
                description="스토리를 대표할 이미지를 등록해 주세요. JPG, PNG 파일을 권장합니다."
                eyebrow="— COVER"
                title="대표 이미지"
              >
                <label
                  className="relative grid min-h-[280px] cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-line-default bg-surface-page text-center transition hover:border-brand-primary"
                  htmlFor="story-cover"
                >
                  {values.coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="선택한 대표 이미지 미리보기"
                      className="absolute inset-0 h-full w-full object-cover"
                      src={values.coverPreview}
                    />
                  ) : (
                    <span className="grid justify-items-center gap-3 px-6">
                      <span className="grid size-12 place-items-center rounded-circle bg-blue-ice text-brand-primary">
                        <ImagePlus aria-hidden="true" className="size-6" />
                      </span>
                      <span className="text-label-sm text-text-primary">
                        대표 이미지 등록하기
                      </span>
                      <span className="text-caption text-text-secondary">
                        클릭하거나 파일을 끌어다 놓으세요
                      </span>
                    </span>
                  )}
                </label>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  id="story-cover"
                  onChange={handleCoverChange}
                  type="file"
                />
              </EditorCard>

              <EditorCard eyebrow="— TITLE & PERIOD" title="여행 이야기">
                <div className="grid gap-5">
                  <InputField
                    label="제목"
                    maxLength={100}
                    onChange={(event) =>
                      updateValue("title", event.target.value)
                    }
                    placeholder="예: 여권만 챙겨서 떠난 도쿄 여행"
                    value={values.title}
                  />
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr_0.8fr]">
                    <InputField
                      label="여행 시작일"
                      onChange={(event) =>
                        updateValue("startDate", event.target.value)
                      }
                      type="date"
                      value={values.startDate}
                    />
                    <InputField
                      label="여행 종료일"
                      min={values.startDate}
                      onChange={(event) =>
                        updateValue("endDate", event.target.value)
                      }
                      type="date"
                      value={values.endDate}
                    />
                    <SelectField
                      label="공개 범위"
                      onChange={(event) =>
                        updateValue("visibility", event.target.value)
                      }
                      options={visibilityOptions}
                      value={values.visibility}
                    />
                  </div>
                  <div>
                    <label
                      className="text-label-sm text-text-primary"
                      htmlFor="story-content"
                    >
                      여행 이야기
                    </label>
                    <textarea
                      className="mt-1.5 min-h-40 w-full resize-y rounded-sm border border-line-default bg-surface-default p-4 text-body-sm text-text-primary outline-none transition placeholder:text-text-disabled focus:border-brand-primary"
                      id="story-content"
                      maxLength={2000}
                      onChange={(event) =>
                        updateValue("content", event.target.value)
                      }
                      placeholder="여행에서 느낀 감정이나 기억에 남는 순간을 자유롭게 남겨보세요."
                      value={values.content}
                    />
                    <p className="mt-1 text-right text-caption text-text-disabled">
                      {values.content.length} / 2000
                    </p>
                  </div>
                </div>
              </EditorCard>

              <EditorCard
                description="국가, 도시, 장소를 순서대로 추가해 여행 동선을 기록해 보세요."
                eyebrow="— ROUTE LIST"
                title="여정 노트"
              >
                <div className="grid gap-5">
                  {values.routes.map((country, countryIndex) => (
                    <div
                      className="rounded-lg border border-line-light bg-orange-light p-4 sm:p-5"
                      key={country.id}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-circle border border-accent-gold text-caption-sm text-accent-gold">
                          {countryIndex + 1}
                        </span>
                        <InputField
                          aria-label={`${countryIndex + 1}번째 국가`}
                          onChange={(event) =>
                            updateCountry(country.id, (current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          placeholder="국가명 (예: 대한민국)"
                          value={country.name}
                        />
                        {values.routes.length > 1 ? (
                          <button
                            aria-label={`${countryIndex + 1}번째 국가 삭제`}
                            className="mt-2 text-text-disabled hover:text-status-error"
                            onClick={() =>
                              updateValue(
                                "routes",
                                values.routes.filter(
                                  (item) => item.id !== country.id
                                )
                              )
                            }
                            type="button"
                          >
                            <Trash2 aria-hidden="true" className="size-5" />
                          </button>
                        ) : null}
                      </div>

                      <div className="ml-3 mt-4 grid gap-4 border-l border-accent-gold/40 pl-6">
                        {country.cities.map((city, cityIndex) => (
                          <div key={city.id}>
                            <div className="flex items-start gap-3">
                              <MapPin
                                aria-hidden="true"
                                className="mt-3 size-4 shrink-0 text-brand-primary"
                              />
                              <InputField
                                aria-label={`${countryIndex + 1}번째 국가의 ${cityIndex + 1}번째 도시`}
                                onChange={(event) =>
                                  updateCity(
                                    country.id,
                                    city.id,
                                    (current) => ({
                                      ...current,
                                      name: event.target.value,
                                    })
                                  )
                                }
                                placeholder="도시명 (예: 서울)"
                                value={city.name}
                              />
                            </div>

                            <div className="ml-7 mt-3 grid gap-3">
                              {city.places.map((place, placeIndex) => (
                                <div
                                  className="rounded-md border border-line-light bg-surface-default p-3"
                                  key={place.id}
                                >
                                  <div className="flex items-start gap-2">
                                    <InputField
                                      aria-label={`${cityIndex + 1}번째 도시의 ${placeIndex + 1}번째 장소`}
                                      onChange={(event) =>
                                        updateCity(
                                          country.id,
                                          city.id,
                                          (current) => ({
                                            ...current,
                                            places: current.places.map(
                                              (item) =>
                                                item.id === place.id
                                                  ? {
                                                      ...item,
                                                      name: event.target.value,
                                                    }
                                                  : item
                                            ),
                                          })
                                        )
                                      }
                                      placeholder="장소명 (예: 경복궁)"
                                      value={place.name}
                                    />
                                    {city.places.length > 1 ? (
                                      <button
                                        aria-label={`${placeIndex + 1}번째 장소 삭제`}
                                        className="mt-3 text-text-disabled hover:text-status-error"
                                        onClick={() =>
                                          updateCity(
                                            country.id,
                                            city.id,
                                            (current) => ({
                                              ...current,
                                              places: current.places.filter(
                                                (item) => item.id !== place.id
                                              ),
                                            })
                                          )
                                        }
                                        type="button"
                                      >
                                        <X
                                          aria-hidden="true"
                                          className="size-4"
                                        />
                                      </button>
                                    ) : null}
                                  </div>
                                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-sm border border-line-light px-3 py-2 text-caption text-text-secondary hover:border-brand-primary">
                                    <ImagePlus
                                      aria-hidden="true"
                                      className="size-4"
                                    />
                                    {place.imageName || "장소 이미지 추가"}
                                    <input
                                      accept="image/*"
                                      className="sr-only"
                                      onChange={(event) => {
                                        const imageName =
                                          event.target.files?.[0]?.name ?? "";
                                        updateCity(
                                          country.id,
                                          city.id,
                                          (current) => ({
                                            ...current,
                                            places: current.places.map(
                                              (item) =>
                                                item.id === place.id
                                                  ? { ...item, imageName }
                                                  : item
                                            ),
                                          })
                                        );
                                      }}
                                      type="file"
                                    />
                                  </label>
                                </div>
                              ))}
                              <button
                                className="inline-flex w-fit items-center gap-1 text-caption text-brand-primary hover:text-brand-primary-hover"
                                onClick={() => addPlace(country.id, city.id)}
                                type="button"
                              >
                                <Plus aria-hidden="true" className="size-3.5" />
                                장소 추가
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          className="inline-flex w-fit items-center gap-1 text-caption text-brand-primary hover:text-brand-primary-hover"
                          onClick={() => addCity(country.id)}
                          type="button"
                        >
                          <Plus aria-hidden="true" className="size-3.5" />
                          도시 추가
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button
                    buttonStyle="secondary"
                    className="ml-auto"
                    icon="left"
                    iconComponent={Plus}
                    onClick={addCountry}
                    size="sm"
                  >
                    국가 추가
                  </Button>
                </div>
              </EditorCard>

              <EditorCard
                description="최대 5개까지 입력할 수 있습니다."
                eyebrow="— TAGS"
                title="태그"
              >
                <InputField
                  aria-label="태그 입력"
                  disabled={values.tags.length >= 5}
                  onChange={(event) =>
                    updateValue("tagInput", event.target.value)
                  }
                  onKeyDown={handleTagKeyDown}
                  placeholder="# 도쿄 # 혼자여행 # 맛집"
                  value={values.tagInput}
                />
                {values.tags.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {values.tags.map((tag) => (
                      <li key={tag}>
                        <Badge tone="blue">
                          <span className="inline-flex items-center gap-1">
                            #{tag}
                            <button
                              aria-label={`${tag} 태그 삭제`}
                              onClick={() =>
                                updateValue(
                                  "tags",
                                  values.tags.filter((item) => item !== tag)
                                )
                              }
                              type="button"
                            >
                              <X aria-hidden="true" className="size-3" />
                            </button>
                          </span>
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </EditorCard>

              <EditorCard eyebrow="— OPTIONS" title="공개 설정">
                <div className="divide-y divide-line-light">
                  <Toggle
                    checked={values.commentEnabled}
                    description="다른 여행자가 내 스토리에 댓글을 남길 수 있어요."
                    label="댓글 허용"
                    onChange={() =>
                      updateValue("commentEnabled", !values.commentEnabled)
                    }
                  />
                  <Toggle
                    checked={values.scheduleVisible}
                    description="스토리에 연결된 여행 일정을 함께 공개합니다."
                    label="연결된 일정 함께 공개"
                    onChange={() =>
                      updateValue("scheduleVisible", !values.scheduleVisible)
                    }
                  />
                  <label className="flex cursor-pointer items-start gap-3 py-4">
                    <input
                      checked={values.aiVerificationRequested}
                      className="mt-1 size-4 accent-brand-primary"
                      onChange={(event) =>
                        updateValue(
                          "aiVerificationRequested",
                          event.target.checked
                        )
                      }
                      type="checkbox"
                    />
                    <span>
                      <span className="block text-label-sm text-text-primary">
                        AI 사실 검증 요청
                      </span>
                      <span className="mt-1 block text-caption text-text-secondary">
                        여행 정보와 장소 정보의 정확성을 확인합니다.
                      </span>
                    </span>
                  </label>
                </div>
              </EditorCard>
            </form>

            <aside>
              <section className="rounded-lg border border-line-light bg-surface-default p-6 sm:p-8">
                <h2 className="text-label-sm text-text-primary">체크리스트</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {checklist.map((item) => (
                    <li
                      className="flex items-center gap-3 text-body-sm text-text-secondary"
                      key={item.label}
                    >
                      <span
                        className={`grid size-5 place-items-center rounded-circle border ${
                          item.complete
                            ? "border-brand-primary bg-brand-primary text-text-inverse"
                            : "border-line-light"
                        }`}
                      >
                        {item.complete ? (
                          <Check aria-hidden="true" className="size-3" />
                        ) : null}
                      </span>
                      {item.label}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-line-light pt-4 text-caption text-text-secondary">
                  작성 중인 내용은 등록 전까지 서버에 저장되지 않습니다.
                  페이지를 벗어나기 전에 내용을 확인해 주세요.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}
