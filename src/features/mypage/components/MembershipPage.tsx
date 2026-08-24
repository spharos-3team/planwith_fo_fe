"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Search, WalletCards } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { InputField } from "@/components/common/InputField";
import { Modal } from "@/components/common/Modal";
import { StatusMessage } from "@/components/common/StatusMessage";
import { useGradeUpdateEvents } from "@/features/grade/hooks/useGradeUpdateEvents";
import type {
  GradeCatalogItem,
  GradeCode,
  GradeManagementPage,
  GradeMetricType,
} from "@/features/grade/types";
import {
  membershipQueryKeys,
  useMembershipDashboard,
} from "@/features/membership/hooks/useMembershipDashboard";
import type {
  CreatorRevenueSummary,
  CreatorSubscriberListItem,
  CreatorSubscribersSummary,
  JoinedCreatorMembership,
  MyCreatorMembership,
  SubscribedCreatorListItem,
} from "@/features/membership/types";
import { MyPageCard } from "@/features/mypage/components/MyPageCard";
import { MyPageSectionHeading } from "@/features/mypage/components/MyPageSectionHeading";
import { ProfileAvatar } from "@/features/mypage/components/ProfileAvatar";
import { useApiError } from "@/hooks/useApiError";
import { getMyMember } from "@/services/auth/member";
import { getMyGradeManagementPage } from "@/services/grade/grade";
import {
  applyMembership,
  cancelMembershipSubscription,
  requestMembershipSettlement,
  validateMembershipApplication,
} from "@/services/membership/membership";

const gradeEnglishNames: Record<GradeCode, string> = {
  ROOKIE: "Rookie",
  LEAF: "Leaf",
  TRAVELER: "Traveler",
  EXPLORER: "Explorer",
  ADVENTURE: "Adventurer",
  PLANWITH: "PLAN&WITH Master",
};

const metricColumns: Array<{
  label: string;
  type: GradeMetricType;
}> = [
  { label: "게시글", type: "STORY_COUNT" },
  { label: "팔로워", type: "FOLLOWER_COUNT" },
  { label: "좋아요(누적)", type: "RECEIVED_LIKE_COUNT" },
];

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function getConditionText(
  grade: GradeCatalogItem,
  metricType: GradeMetricType
): string {
  const condition = grade.conditions.find(
    (item) => item.metricType === metricType
  );
  return condition
    ? `${condition.thresholdValue.toLocaleString("ko-KR")}개 이상`
    : "-";
}

function getMonthlyTokenAmount(grade: GradeCatalogItem): string {
  const benefit = grade.benefits.find(
    (item) => item.benefitCode === "MONTHLY_FREE_TOKEN"
  );
  const amount = Number(benefit?.benefitValue);

  return Number.isFinite(amount)
    ? `${amount.toLocaleString("ko-KR")}토큰`
    : "-";
}

function CurrentGradeCard({
  currentGradeCode,
  joinedAt,
  monthlyTokenAmount,
  onApplicationClick,
  showApplicationButton,
}: {
  currentGradeCode: GradeCode;
  joinedAt?: string;
  monthlyTokenAmount: number;
  onApplicationClick: () => void;
  showApplicationButton: boolean;
}) {
  return (
    <MyPageCard>
      <h1 className="text-heading-xl text-text-primary">멤버십 관리</h1>

      <div className="flex w-full flex-col gap-5 rounded-xl bg-blue-ice/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-body-sm text-text-secondary">현재 멤버십 등급</p>
          <p className="mt-1 text-[32px] font-bold leading-tight text-blue-700">
            {gradeEnglishNames[currentGradeCode]}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-body-sm text-text-secondary">
            <div className="flex gap-1">
              <dt>월 지급 토큰:</dt>
              <dd className="font-semibold text-text-primary">
                {monthlyTokenAmount.toLocaleString("ko-KR")} P
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>가입일:</dt>
              <dd className="font-semibold text-text-primary">
                {formatDate(joinedAt)}
              </dd>
            </div>
          </dl>
        </div>

        {showApplicationButton ? (
          <Button
            className="w-full shrink-0 sm:w-auto"
            onClick={onApplicationClick}
            size="sm"
          >
            멤버십 신청하기
          </Button>
        ) : null}
      </div>
    </MyPageCard>
  );
}

interface MembershipApplicationFormState {
  open: boolean;
  membershipName: string;
  description: string;
  monthlyPrice: string;
  submitting: boolean;
  error: string;
}

const initialApplicationForm: MembershipApplicationFormState = {
  open: false,
  membershipName: "",
  description: "",
  monthlyPrice: "",
  submitting: false,
  error: "",
};

function MembershipApplicationDialog({
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  form: MembershipApplicationFormState;
  onChange: (nextForm: MembershipApplicationFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog
      description="운영할 멤버십의 이름과 월 구독 금액을 입력해 주세요."
      onClose={onClose}
      open={form.open}
      title="크리에이터 멤버십 신청"
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <InputField
          disabled={form.submitting}
          label="멤버십 이름"
          maxLength={100}
          onChange={(event) =>
            onChange({ ...form, membershipName: event.target.value, error: "" })
          }
          placeholder="예: 나의 여행 멤버십"
          required
          value={form.membershipName}
        />
        <div className="grid gap-1.5">
          <label
            className="text-label-sm text-text-primary"
            htmlFor="membership-description"
          >
            멤버십 설명
          </label>
          <textarea
            className="min-h-28 resize-y rounded-sm border border-line-default bg-surface-default px-4 py-3 text-body-sm text-text-primary outline-none transition placeholder:text-text-disabled focus:border-brand-primary disabled:cursor-not-allowed disabled:bg-surface-page"
            disabled={form.submitting}
            id="membership-description"
            maxLength={1000}
            onChange={(event) =>
              onChange({ ...form, description: event.target.value, error: "" })
            }
            placeholder="제공할 프리미엄 콘텐츠를 소개해 주세요."
            value={form.description}
          />
        </div>
        <InputField
          disabled={form.submitting}
          label="월 구독 금액(토큰)"
          min={1}
          onChange={(event) =>
            onChange({ ...form, monthlyPrice: event.target.value, error: "" })
          }
          placeholder="예: 50"
          required
          type="number"
          value={form.monthlyPrice}
        />
        {form.error ? (
          <p className="text-caption text-status-error" role="alert">
            {form.error}
          </p>
        ) : null}
        <div className="mt-2 flex justify-end gap-2">
          <Button
            buttonStyle="secondary"
            disabled={form.submitting}
            onClick={onClose}
            type="button"
          >
            취소
          </Button>
          <Button disabled={form.submitting} type="submit">
            {form.submitting ? "신청 중..." : "신청하기"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

interface SettlementFormState {
  open: boolean;
  amount: string;
  submitting: boolean;
  error: string;
}

const initialSettlementForm: SettlementFormState = {
  open: false,
  amount: "",
  submitting: false,
  error: "",
};

function SettlementRequestDialog({
  availableRevenue,
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  availableRevenue: number;
  form: SettlementFormState;
  onChange: (nextForm: SettlementFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog
      description={`현재 정산 가능액은 ${availableRevenue.toLocaleString("ko-KR")}원입니다.`}
      onClose={onClose}
      open={form.open}
      title="멤버십 수익 신청"
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <InputField
          disabled={form.submitting}
          label="정산 신청 금액(원)"
          max={availableRevenue}
          min={1}
          onChange={(event) =>
            onChange({ ...form, amount: event.target.value, error: "" })
          }
          placeholder="정산할 금액을 입력하세요."
          required
          type="number"
          value={form.amount}
        />
        {form.error ? (
          <p className="text-caption text-status-error" role="alert">
            {form.error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button
            buttonStyle="secondary"
            disabled={form.submitting}
            onClick={onClose}
            type="button"
          >
            취소
          </Button>
          <Button disabled={form.submitting} type="submit">
            {form.submitting ? "신청 중..." : "수익 신청하기"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

const progressItems: Array<{
  key: keyof GradeManagementPage["progress"];
  label: string;
  unit: "개" | "명";
}> = [
  { key: "story", label: "게시글", unit: "개" },
  { key: "follower", label: "팔로워", unit: "명" },
  { key: "receivedLike", label: "누적 좋아요", unit: "개" },
];

function NextGradeProgressCard({
  nextGrade,
  progress,
}: {
  nextGrade: GradeManagementPage["nextGrade"];
  progress: GradeManagementPage["progress"];
}) {
  if (!nextGrade) {
    return (
      <MyPageCard>
        <MyPageSectionHeading title="다음 등급까지" />
        <StatusMessage>현재 최고 등급을 달성했습니다.</StatusMessage>
      </MyPageCard>
    );
  }

  return (
    <MyPageCard>
      <h2 className="text-heading-lg text-text-primary">
        다음 등급 · {nextGrade.name}까지
      </h2>

      <div className="flex w-full flex-col gap-5">
        {progressItems.map((item) => {
          const metric = progress[item.key];
          const percentage = Math.min(100, Math.max(0, metric.percentage));
          const isCompleted = metric.remaining <= 0;

          return (
            <div className="w-full" key={item.key}>
              <div className="mb-2 flex items-center justify-between gap-4 text-body-sm text-text-primary">
                <span className="font-semibold">{item.label}</span>
                <span className="shrink-0">
                  {metric.current.toLocaleString("ko-KR")}/
                  {metric.required.toLocaleString("ko-KR")}
                  {item.unit} ({percentage}%)
                </span>
              </div>
              <div
                aria-label={`${item.label} 다음 등급 달성률`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={percentage}
                className="h-2.5 w-full overflow-hidden rounded-full bg-surface-page"
                role="progressbar"
              >
                <div
                  className="h-full rounded-full bg-brand-primary transition-[width]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="mt-1.5 text-caption text-blue-gray">
                {isCompleted
                  ? "승급 조건을 달성했어요."
                  : `${metric.remaining.toLocaleString("ko-KR")}${item.unit} 더 필요해요.`}
              </p>
            </div>
          );
        })}
      </div>
    </MyPageCard>
  );
}

function GradeGuideTable({
  currentGradeCode,
  grades,
}: {
  currentGradeCode: GradeCode;
  grades: GradeCatalogItem[];
}) {
  const orderedGrades = [...grades].sort(
    (left, right) => left.gradeLevel - right.gradeLevel
  );

  return (
    <MyPageCard className="overflow-hidden">
      <MyPageSectionHeading
        description="게시글, 팔로워, 누적 좋아요 기준으로 등급이 자동으로 올라가고, 등급마다 매월 토큰이 지급돼요."
        title="등급 안내"
      />

      <div className="w-full overflow-x-auto rounded-lg border border-blue-ice">
        <table className="w-full min-w-[760px] border-collapse text-left text-body-sm">
          <caption className="sr-only">
            게시글, 팔로워, 누적 좋아요 및 월 지급 토큰에 따른 회원 등급 안내
          </caption>
          <thead>
            <tr className="bg-surface-page text-text-primary">
              <th className="px-4 py-3 font-semibold" scope="col">
                등급
              </th>
              {metricColumns.map((column) => (
                <th
                  className="px-4 py-3 font-semibold"
                  key={column.type}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold" scope="col">
                토큰(매달)
              </th>
            </tr>
          </thead>
          <tbody>
            {orderedGrades.map((grade) => {
              const isCurrent = grade.gradeCode === currentGradeCode;

              return (
                <tr
                  className={isCurrent ? "bg-badge-blue-bg/70" : undefined}
                  key={grade.gradeCode}
                >
                  <th
                    className={`border-t border-blue-ice px-4 py-3 font-medium ${
                      isCurrent ? "text-blue-700" : "text-text-primary"
                    }`}
                    scope="row"
                  >
                    <span className="inline-flex items-center gap-2">
                      {grade.gradeName}
                      {grade.gradeCode !== "PLANWITH" ? (
                        <span>({gradeEnglishNames[grade.gradeCode]})</span>
                      ) : null}
                      {isCurrent ? (
                        <Badge size="sm" tone="blue" variant="solid">
                          내 등급
                        </Badge>
                      ) : null}
                    </span>
                  </th>
                  {metricColumns.map((column) => (
                    <td
                      className={`border-t border-blue-ice px-4 py-3 ${
                        isCurrent ? "text-blue-700" : "text-text-secondary"
                      }`}
                      key={column.type}
                    >
                      {getConditionText(grade, column.type)}
                    </td>
                  ))}
                  <td className="border-t border-blue-ice px-4 py-3 text-right font-semibold text-blue-700">
                    {getMonthlyTokenAmount(grade)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </MyPageCard>
  );
}

function TokenRewardCard({
  monthlyTokenAmount,
}: {
  monthlyTokenAmount: number;
}) {
  return (
    <MyPageCard>
      <MyPageSectionHeading
        description="등급에 따라 매달 자동으로 토큰을 지급받아요."
        title="토큰 리워드 멤버십"
      />

      <div className="flex w-full items-center gap-4 rounded-xl bg-blue-ice/60 px-5 py-5 text-body-sm text-text-primary">
        <Coins
          aria-hidden="true"
          className="size-6 shrink-0 text-accent-gold"
          strokeWidth={1.8}
        />
        <p className="font-semibold">
          이용 중 · 매달 {monthlyTokenAmount.toLocaleString("ko-KR")} 토큰 지급
        </p>
      </div>
    </MyPageCard>
  );
}

function formatWon(value?: number): string {
  return value === undefined ? "-" : `${value.toLocaleString("ko-KR")} 원`;
}

function hasApprovedCreatorMembership(
  membership?: MyCreatorMembership
): membership is MyCreatorMembership {
  return Boolean(membership?.hasMembership && membership.status === "APPROVED");
}

function CreatorMembershipOperationCard({
  isExplorerOrHigher,
  membership,
  revenue,
  subscribers,
  onRevenueRequest,
  onTokenSetting,
}: {
  isExplorerOrHigher: boolean;
  membership?: MyCreatorMembership;
  revenue?: CreatorRevenueSummary;
  subscribers?: CreatorSubscribersSummary;
  onRevenueRequest?: () => void;
  onTokenSetting?: () => void;
}) {
  if (!isExplorerOrHigher || !hasApprovedCreatorMembership(membership)) {
    return null;
  }

  return (
    <MyPageCard>
      <MyPageSectionHeading
        description="탐험가 등급부터 나만의 유료 멤버십을 열어 팔로워에게 프리미엄 콘텐츠를 판매할 수 있어요."
        title="크리에이터 멤버십 운영"
      />

      <div className="w-full">
        <Badge tone="green">운영 중</Badge>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-y border-blue-ice py-5">
          <dl className="text-body-sm">
            <div className="flex items-center gap-4">
              <dt className="text-text-secondary">월 구독 금액</dt>
              <dd className="font-semibold text-text-primary">
                {membership.monthlyPrice === null || !membership.priceUnit
                  ? "-"
                  : `${membership.monthlyPrice.toLocaleString("ko-KR")}${formatPriceUnit(membership.priceUnit)} / 월`}
              </dd>
            </div>
          </dl>
          <Button
            buttonStyle="secondary"
            disabled={!onTokenSetting}
            onClick={onTokenSetting}
            size="sm"
          >
            토큰 설정
          </Button>
        </div>

        <h3 className="mt-5 text-heading-md text-text-primary">
          멤버십 수익 현황
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-blue-ice/60 px-5 py-4">
            <dt className="text-caption text-text-secondary">구독자</dt>
            <dd className="mt-1 text-heading-xl text-text-primary">
              {subscribers
                ? `${subscribers.subscriberCount.toLocaleString("ko-KR")}명`
                : "-"}
            </dd>
          </div>
          <div className="rounded-xl bg-blue-ice/60 px-5 py-4">
            <dt className="text-caption text-text-secondary">총 누적 수익</dt>
            <dd className="mt-1 text-heading-xl text-text-primary">
              {formatWon(revenue?.totalRevenue)}
            </dd>
          </div>
          <div className="rounded-xl bg-blue-ice/60 px-5 py-4">
            <dt className="text-caption text-text-secondary">정산 가능액</dt>
            <dd className="mt-1 text-heading-xl text-blue-700">
              {formatWon(revenue?.availableRevenue)}
            </dd>
          </div>
        </dl>

        <div className="mt-7 flex justify-end">
          <Button
            disabled={!onRevenueRequest}
            icon="left"
            iconComponent={WalletCards}
            onClick={onRevenueRequest}
            size="sm"
          >
            수익 신청하기
          </Button>
        </div>
      </div>
    </MyPageCard>
  );
}

function formatPriceUnit(priceUnit: string): string {
  return priceUnit === "TOKEN" ? "토큰" : priceUnit;
}

function CreatorMembershipSubscriptionsCard({
  subscriptions,
}: {
  subscriptions?: JoinedCreatorMembership[];
}) {
  const activeSubscriptions = subscriptions?.filter(
    (subscription) => subscription.status === "ACTIVE"
  );

  if (!activeSubscriptions?.length) {
    return null;
  }

  return (
    <MyPageCard>
      <MyPageSectionHeading
        description="구독 중인 크리에이터의 프리미엄 콘텐츠를 이용할 수 있어요."
        title="크리에이터 멤버십 구독"
      />

      <ul className="grid w-full gap-4">
        {activeSubscriptions.map((subscription) => (
          <li
            className="rounded-xl border border-blue-ice px-5 py-4"
            key={subscription.subscriptionUuid}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-label-sm text-text-primary">
                {subscription.membershipName}
              </p>
              <Badge tone="green">구독 중</Badge>
            </div>
            <dl className="mt-4 border-t border-blue-ice pt-4 text-body-sm">
              <div className="flex items-center gap-4">
                <dt className="text-text-secondary">월 구독 금액</dt>
                <dd className="font-semibold text-text-primary">
                  {subscription.monthlyPrice.toLocaleString("ko-KR")}
                  {formatPriceUnit(subscription.priceUnit)} / 월
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </MyPageCard>
  );
}

function SubscribedCreatorsCard({
  subscriptions,
  onCancel,
}: {
  subscriptions?: SubscribedCreatorListItem[];
  onCancel?: (subscriptionUuid: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");
  const activeSubscriptions = subscriptions?.filter(
    (subscription) => subscription.status === "ACTIVE"
  );
  const filteredSubscriptions = activeSubscriptions?.filter((subscription) =>
    [subscription.creatorNickname, subscription.membershipName].some((value) =>
      value.toLocaleLowerCase("ko-KR").includes(normalizedQuery)
    )
  );

  if (!activeSubscriptions?.length) {
    return null;
  }

  return (
    <MyPageCard>
      <MyPageSectionHeading
        description="현재 내가 구독하고 있는 크리에이터 목록이에요."
        title="구독 중인 크리에이터"
      />

      <InputField
        aria-label="구독 중인 크리에이터 검색"
        icon={Search}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="크리에이터 검색"
        value={searchQuery}
      />

      {filteredSubscriptions?.length === 0 ? (
        <StatusMessage>
          {searchQuery.trim()
            ? "검색 결과가 없습니다."
            : "현재 구독 중인 크리에이터가 없습니다."}
        </StatusMessage>
      ) : (
        <ul className="w-full divide-y divide-blue-ice border-y border-blue-ice">
          {filteredSubscriptions?.map((subscription) => (
            <li
              className="flex flex-wrap items-center gap-4 px-4 py-3"
              key={subscription.subscriptionUuid}
            >
              <ProfileAvatar
                nickname={subscription.creatorNickname}
                size={40}
                src={subscription.creatorProfileImage}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-label-sm text-text-primary">
                  {subscription.creatorNickname}
                </p>
                <p className="mt-0.5 text-caption text-text-secondary">
                  {formatDate(subscription.startedAt)} 구독 시작 ·{" "}
                  {subscription.monthlyPrice.toLocaleString("ko-KR")}
                  {formatPriceUnit(subscription.priceUnit)}/월
                </p>
              </div>
              <Button
                buttonStyle="ghost"
                disabled={!onCancel}
                onClick={() => onCancel?.(subscription.subscriptionUuid)}
                size="sm"
              >
                구독 해지
              </Button>
            </li>
          ))}
        </ul>
      )}
    </MyPageCard>
  );
}

function SubscriberManagementCard({
  isExplorerOrHigher,
  membership,
  subscribers,
}: {
  isExplorerOrHigher: boolean;
  membership?: MyCreatorMembership;
  subscribers?: CreatorSubscriberListItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");
  const activeSubscribers = subscribers?.filter(
    (subscriber) => subscriber.status === "ACTIVE"
  );
  const filteredSubscribers = activeSubscribers?.filter((subscriber) =>
    subscriber.subscriberNickname
      .toLocaleLowerCase("ko-KR")
      .includes(normalizedQuery)
  );

  if (!isExplorerOrHigher || !hasApprovedCreatorMembership(membership)) {
    return null;
  }

  return (
    <MyPageCard>
      <MyPageSectionHeading
        description="현재 나를 구독하고 프리미엄 스토리 서비스를 이용하고 있는 팬 리스트입니다."
        title="구독자 관리"
      />

      <InputField
        aria-label="구독자 닉네임 검색"
        disabled={subscribers === undefined}
        icon={Search}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="구독자 닉네임 검색"
        value={searchQuery}
      />

      {subscribers === undefined ? (
        <StatusMessage>구독자 정보를 불러오는 중입니다.</StatusMessage>
      ) : filteredSubscribers?.length === 0 ? (
        <StatusMessage>
          {searchQuery.trim()
            ? "검색 결과가 없습니다."
            : "현재 구독 중인 팬이 없습니다."}
        </StatusMessage>
      ) : (
        <ul className="w-full divide-y divide-blue-ice border-y border-blue-ice">
          {filteredSubscribers?.map((subscriber) => (
            <li
              className="flex items-center gap-4 px-4 py-3"
              key={subscriber.subscriptionUuid}
            >
              <ProfileAvatar
                nickname={subscriber.subscriberNickname}
                size={40}
                src={subscriber.subscriberProfileImage}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-label-sm text-text-primary">
                  {subscriber.subscriberNickname}
                </p>
                <p className="mt-0.5 text-caption text-text-secondary">
                  {formatDate(subscriber.startedAt)} 구독 시작 ·{" "}
                  {membership.monthlyPrice === null || !membership.priceUnit
                    ? "구독 금액 미정"
                    : `${membership.monthlyPrice.toLocaleString("ko-KR")}${formatPriceUnit(membership.priceUnit)}/월`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </MyPageCard>
  );
}

export function MembershipPage() {
  const queryClient = useQueryClient();
  const [applicationForm, setApplicationForm] =
    useState<MembershipApplicationFormState>(initialApplicationForm);
  const [settlementForm, setSettlementForm] = useState<SettlementFormState>(
    initialSettlementForm
  );
  const [action, setAction] = useState({
    cancelTarget: null as string | null,
    cancelling: false,
    message: "",
    error: "",
  });
  useGradeUpdateEvents();
  const gradeQuery = useQuery({
    queryKey: ["grades", "me", "management"],
    queryFn: getMyGradeManagementPage,
  });
  const memberQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMyMember,
  });
  const management = gradeQuery.data;
  const explorerLevel =
    management?.grades.find((grade) => grade.gradeCode === "EXPLORER")
      ?.gradeLevel ?? 4;
  const isExplorerOrHigher = Boolean(
    management && management.currentGrade.level >= explorerLevel
  );
  const membershipDashboard = useMembershipDashboard(isExplorerOrHigher);
  const error = useApiError(
    gradeQuery.error ?? memberQuery.error ?? membershipDashboard.error
  );

  const closeApplicationDialog = () => {
    if (!applicationForm.submitting) {
      setApplicationForm(initialApplicationForm);
    }
  };

  const handleApplicationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const monthlyPrice = Number(applicationForm.monthlyPrice);

    if (
      !applicationForm.membershipName.trim() ||
      !Number.isInteger(monthlyPrice)
    ) {
      setApplicationForm((current) => ({
        ...current,
        error: "멤버십 이름과 올바른 월 구독 금액을 입력해 주세요.",
      }));
      return;
    }

    if (monthlyPrice <= 0) {
      setApplicationForm((current) => ({
        ...current,
        error: "월 구독 금액은 1토큰 이상이어야 합니다.",
      }));
      return;
    }

    const request = {
      membershipName: applicationForm.membershipName.trim(),
      description: applicationForm.description.trim(),
      monthlyPrice,
      priceUnit: "TOKEN" as const,
    };
    setApplicationForm((current) => ({
      ...current,
      submitting: true,
      error: "",
    }));

    try {
      const validation = await validateMembershipApplication(request);
      if (!validation.eligible) {
        throw new Error("현재 등급으로는 멤버십을 신청할 수 없습니다.");
      }

      await applyMembership(request);
      await queryClient.invalidateQueries({ queryKey: membershipQueryKeys.me });
      setApplicationForm(initialApplicationForm);
      setAction((current) => ({
        ...current,
        message: "멤버십 운영 신청이 접수되었습니다.",
        error: "",
      }));
    } catch (applicationError) {
      setApplicationForm((current) => ({
        ...current,
        submitting: false,
        error:
          applicationError instanceof Error
            ? applicationError.message
            : "멤버십 신청에 실패했습니다.",
      }));
    }
  };

  const confirmSubscriptionCancel = async () => {
    if (!action.cancelTarget) {
      return;
    }

    setAction((current) => ({ ...current, cancelling: true, error: "" }));
    try {
      await cancelMembershipSubscription(action.cancelTarget);
      await queryClient.invalidateQueries({
        queryKey: membershipQueryKeys.subscriptions,
      });
      setAction({
        cancelTarget: null,
        cancelling: false,
        message: "구독이 해지되었습니다.",
        error: "",
      });
    } catch (cancelError) {
      setAction((current) => ({
        ...current,
        cancelling: false,
        error:
          cancelError instanceof Error
            ? cancelError.message
            : "구독 해지에 실패했습니다.",
      }));
    }
  };

  const closeSettlementDialog = () => {
    if (!settlementForm.submitting) {
      setSettlementForm(initialSettlementForm);
    }
  };

  const handleSettlementSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(settlementForm.amount);
    const availableRevenue = membershipDashboard.revenue?.availableRevenue ?? 0;

    if (!Number.isInteger(amount) || amount <= 0) {
      setSettlementForm((current) => ({
        ...current,
        error: "정산 신청 금액을 올바르게 입력해 주세요.",
      }));
      return;
    }

    if (amount > availableRevenue) {
      setSettlementForm((current) => ({
        ...current,
        error: "정산 가능액을 초과할 수 없습니다.",
      }));
      return;
    }

    setSettlementForm((current) => ({
      ...current,
      submitting: true,
      error: "",
    }));
    try {
      await requestMembershipSettlement(amount);
      await queryClient.invalidateQueries({
        queryKey: membershipQueryKeys.revenue,
      });
      setSettlementForm(initialSettlementForm);
      setAction((current) => ({
        ...current,
        message: "멤버십 수익 신청이 접수되었습니다.",
        error: "",
      }));
    } catch (settlementError) {
      setSettlementForm((current) => ({
        ...current,
        submitting: false,
        error:
          settlementError instanceof Error
            ? settlementError.message
            : "수익 신청에 실패했습니다.",
      }));
    }
  };

  if (gradeQuery.isPending) {
    return <StatusMessage>회원 등급 정보를 불러오는 중입니다.</StatusMessage>;
  }

  if (gradeQuery.isError || !management) {
    return (
      <StatusMessage role="alert">
        {error || "회원 등급 정보를 불러오지 못했습니다."}
      </StatusMessage>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <CurrentGradeCard
        currentGradeCode={management.currentGrade.code}
        joinedAt={memberQuery.data?.createdAt}
        monthlyTokenAmount={management.currentBenefits.monthlyTokenAmount}
        onApplicationClick={() =>
          setApplicationForm((current) => ({ ...current, open: true }))
        }
        showApplicationButton={Boolean(
          isExplorerOrHigher &&
          membershipDashboard.membership &&
          !membershipDashboard.membership.hasMembership
        )}
      />

      <NextGradeProgressCard
        nextGrade={management.nextGrade}
        progress={management.progress}
      />

      {memberQuery.isError ? (
        <StatusMessage role="alert">
          {error || "회원 가입일을 불러오지 못했습니다."}
        </StatusMessage>
      ) : null}

      {membershipDashboard.membership?.status === "PENDING" ? (
        <StatusMessage>멤버십 운영 신청을 검토하고 있습니다.</StatusMessage>
      ) : null}

      {membershipDashboard.membership?.status === "REJECTED" ? (
        <StatusMessage role="alert">
          멤버십 운영 신청이 반려되었습니다.
          {membershipDashboard.membership.rejectReason
            ? ` ${membershipDashboard.membership.rejectReason}`
            : ""}
        </StatusMessage>
      ) : null}

      {action.message ? <StatusMessage>{action.message}</StatusMessage> : null}
      {action.error ? (
        <StatusMessage role="alert">{action.error}</StatusMessage>
      ) : null}
      {membershipDashboard.error ? (
        <StatusMessage role="alert">
          {error || "멤버십 정보를 불러오지 못했습니다."}
        </StatusMessage>
      ) : null}

      <GradeGuideTable
        currentGradeCode={management.currentGrade.code}
        grades={management.grades}
      />

      <TokenRewardCard
        monthlyTokenAmount={management.currentBenefits.monthlyTokenAmount}
      />

      <CreatorMembershipOperationCard
        isExplorerOrHigher={isExplorerOrHigher}
        membership={membershipDashboard.membership}
        onRevenueRequest={
          membershipDashboard.revenue &&
          membershipDashboard.revenue.availableRevenue > 0
            ? () => setSettlementForm((current) => ({ ...current, open: true }))
            : undefined
        }
        revenue={membershipDashboard.revenue}
        subscribers={membershipDashboard.subscribers}
      />

      <CreatorMembershipSubscriptionsCard
        subscriptions={membershipDashboard.subscriptions}
      />

      <SubscribedCreatorsCard
        onCancel={(subscriptionUuid) =>
          setAction((current) => ({
            ...current,
            cancelTarget: subscriptionUuid,
            error: "",
            message: "",
          }))
        }
        subscriptions={membershipDashboard.subscribedCreators}
      />

      <SubscriberManagementCard
        isExplorerOrHigher={isExplorerOrHigher}
        membership={membershipDashboard.membership}
        subscribers={membershipDashboard.subscriberItems}
      />

      <MembershipApplicationDialog
        form={applicationForm}
        onChange={setApplicationForm}
        onClose={closeApplicationDialog}
        onSubmit={(event) => void handleApplicationSubmit(event)}
      />

      <SettlementRequestDialog
        availableRevenue={membershipDashboard.revenue?.availableRevenue ?? 0}
        form={settlementForm}
        onChange={setSettlementForm}
        onClose={closeSettlementDialog}
        onSubmit={(event) => void handleSettlementSubmit(event)}
      />

      <Modal
        cancelAction={{
          label: "취소",
          onClick: () =>
            setAction((current) => ({ ...current, cancelTarget: null })),
        }}
        confirmAction={{
          label: action.cancelling ? "해지 중..." : "구독 해지",
          onClick: () => void confirmSubscriptionCancel(),
        }}
        description="구독을 해지하면 프리미엄 콘텐츠를 이용할 수 없습니다."
        onClose={() =>
          !action.cancelling &&
          setAction((current) => ({ ...current, cancelTarget: null }))
        }
        open={Boolean(action.cancelTarget)}
        title="구독을 해지하시겠습니까?"
        variant="confirm"
      />
    </div>
  );
}
