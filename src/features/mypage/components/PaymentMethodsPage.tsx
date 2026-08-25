"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CreditCard, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { InputField } from "@/components/common/InputField";
import { Modal } from "@/components/common/Modal";
import { StatusMessage } from "@/components/common/StatusMessage";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { MyPageCard } from "@/features/mypage/components/MyPageCard";
import { MyPageSectionHeading } from "@/features/mypage/components/MyPageSectionHeading";
import { TokenChargeDialog } from "@/features/mypage/components/TokenChargeDialog";
import {
  paymentQueryKeys,
  usePaymentMethods,
  usePaymentSummary,
  useTokenCreditHistory,
  useTokenProducts,
  useTokenUsageHistory,
} from "@/features/payment/hooks/usePaymentSummary";
import type {
  PaymentMethod,
  RegisterPaymentMethodRequest,
  TokenLedgerEntry,
  TokenProduct,
} from "@/features/payment/types";
import { useApiError } from "@/hooks/useApiError";
import {
  deletePaymentMethod,
  payTokenCharge,
  registerPaymentMethod,
  requestTokenCharge,
  setDefaultPaymentMethod,
} from "@/services/token/token";

interface CardRegistrationForm extends RegisterPaymentMethodRequest {
  submitting: boolean;
  error: string;
}

type PaymentMethodAction =
  | { type: "set-default"; paymentMethod: PaymentMethod }
  | { type: "delete"; paymentMethod: PaymentMethod };

type PaymentMethodSuccess = "set-default" | "delete";

const PAYMENT_PAGE_SIZE = 5;
const PAYMENT_PAGE_GROUP_SIZE = 10;

const initialCardRegistrationForm: CardRegistrationForm = {
  cardName: "",
  cardNumber: "",
  expiryYear: "",
  expiryMonth: "",
  birthOrBusinessRegistrationNumber: "",
  passwordTwoDigits: "",
  defaultMethod: false,
  submitting: false,
  error: "",
};

function onlyDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

function validateCardRegistration(form: CardRegistrationForm): string {
  if (!form.cardName.trim()) {
    return "카드 이름을 입력해 주세요.";
  }
  if (form.cardName.trim().length > 100) {
    return "카드 이름은 100자 이하로 입력해 주세요.";
  }
  if (form.cardNumber.length < 15 || form.cardNumber.length > 19) {
    return "카드 번호를 15~19자리 숫자로 입력해 주세요.";
  }
  if (!/^\d{2}$/.test(form.expiryYear)) {
    return "유효기간 연도를 두 자리로 입력해 주세요.";
  }
  const expiryMonth = Number(form.expiryMonth);
  if (
    !/^\d{2}$/.test(form.expiryMonth) ||
    expiryMonth < 1 ||
    expiryMonth > 12
  ) {
    return "유효기간 월을 01~12 사이로 입력해 주세요.";
  }
  if (![6, 10].includes(form.birthOrBusinessRegistrationNumber.length)) {
    return "생년월일 6자리 또는 사업자등록번호 10자리를 입력해 주세요.";
  }
  if (!/^\d{2}$/.test(form.passwordTwoDigits)) {
    return "카드 비밀번호 앞 두 자리를 입력해 주세요.";
  }
  return "";
}

function formatRegisteredAt(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatPaymentDate(value: string | null): string {
  if (!value) {
    return "날짜 미상";
  }

  const paymentDate = new Date(value);
  if (Number.isNaN(paymentDate.getTime())) {
    return "날짜 미상";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(paymentDate);
}

function formatTokenUsageDate(value: string): string {
  const usageDate = new Date(value);
  if (Number.isNaN(usageDate.getTime())) {
    return "날짜 미상";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(usageDate)
    .replaceAll(" ", "")
    .replace(/\.$/, "");
}

function getTokenUsageCategory(usagePlace: string): string {
  const categories: Record<string, string> = {
    AI_SCHEDULE: "AI 일정",
    IMPORT_SCHEDULE: "일정 가져오기",
    PDF_DOWNLOAD: "콘텐츠 이용",
  };

  return categories[usagePlace] ?? usagePlace;
}

function TokenCreditTable({ entries }: { entries: TokenLedgerEntry[] }) {
  const emptyRowCount = Math.max(PAYMENT_PAGE_SIZE - entries.length, 0);

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-blue-ice">
      <table className="w-full min-w-[680px] border-collapse text-left text-body-sm">
        <caption className="sr-only">토큰 충전 내역</caption>
        <thead className="bg-surface-page text-caption font-semibold text-text-secondary">
          <tr>
            <th className="px-5 py-3" scope="col">
              날짜
            </th>
            <th className="px-5 py-3" scope="col">
              구분
            </th>
            <th className="px-5 py-3 text-right" scope="col">
              충전 토큰
            </th>
            <th className="px-5 py-3 text-right" scope="col">
              충전 후 잔액
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-ice">
          {entries.map((entry) => (
            <tr className="h-[76px]" key={entry.transactionUuid}>
              <td className="whitespace-nowrap px-5 py-4 text-text-secondary">
                {formatPaymentDate(entry.occurredAt)}
              </td>
              <td className="px-5 py-4">
                <Badge
                  tone={entry.transactionType === "CHARGE" ? "blue" : "green"}
                >
                  {entry.transactionType === "CHARGE"
                    ? "카드 충전"
                    : "등급 리워드"}
                </Badge>
                {entry.description ? (
                  <p className="mt-1 text-caption text-text-secondary">
                    {entry.description}
                  </p>
                ) : null}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-blue-700">
                +
                {Math.abs(entry.amountChange || entry.amount).toLocaleString(
                  "ko-KR"
                )}
                P
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right text-text-primary">
                {entry.balanceAfter.toLocaleString("ko-KR")}P
              </td>
            </tr>
          ))}
          {Array.from({ length: emptyRowCount }, (_, index) => (
            <tr aria-hidden="true" className="h-[76px]" key={`empty-${index}`}>
              <td colSpan={4} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TokenUsageTable({ entries }: { entries: TokenLedgerEntry[] }) {
  const emptyRowCount = Math.max(PAYMENT_PAGE_SIZE - entries.length, 0);

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-blue-ice">
      <table className="w-full min-w-[760px] border-collapse text-left text-body-sm">
        <caption className="sr-only">토큰 사용 내역</caption>
        <thead className="bg-surface-page text-caption font-semibold text-text-secondary">
          <tr>
            <th className="px-5 py-3" scope="col">
              날짜
            </th>
            <th className="px-5 py-3" scope="col">
              내용
            </th>
            <th className="px-5 py-3" scope="col">
              카테고리
            </th>
            <th className="px-5 py-3 text-right" scope="col">
              사용량
            </th>
            <th className="px-5 py-3 text-right" scope="col">
              잔액
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-ice">
          {entries.map((entry) => (
            <tr className="h-[76px]" key={entry.transactionUuid}>
              <td className="whitespace-nowrap px-5 py-4 text-text-secondary">
                {formatTokenUsageDate(entry.occurredAt)}
              </td>
              <td className="px-5 py-4 font-semibold text-text-primary">
                {entry.description || "토큰 사용"}
              </td>
              <td className="px-5 py-4 text-text-secondary">
                {getTokenUsageCategory(entry.usagePlace)}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-status-error">
                -
                {Math.abs(entry.amountChange || entry.amount).toLocaleString(
                  "ko-KR"
                )}{" "}
                P
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right text-text-primary">
                {entry.balanceAfter.toLocaleString("ko-KR")} P
              </td>
            </tr>
          ))}
          {Array.from({ length: emptyRowCount }, (_, index) => (
            <tr aria-hidden="true" className="h-[76px]" key={`empty-${index}`}>
              <td colSpan={5} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface HistoryPaginationProps {
  ariaLabel: string;
  currentPage: number;
  pageGroupStart: number;
  pageCount: number;
  hasNextGroup: boolean;
  onPageChange: (page: number) => void;
}

function HistoryPagination({
  ariaLabel,
  currentPage,
  pageGroupStart,
  pageCount,
  hasNextGroup,
  onPageChange,
}: HistoryPaginationProps) {
  const pages = Array.from(
    { length: pageCount },
    (_, index) => pageGroupStart + index
  );
  const hasPreviousGroup = pageGroupStart > 0;

  if (!hasPreviousGroup && pages.length <= 1 && !hasNextGroup) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="flex w-full items-center justify-center py-2"
    >
      <button
        aria-label={`${ariaLabel} 이전 그룹`}
        className="grid size-8 place-items-center text-text-secondary transition hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-30"
        disabled={!hasPreviousGroup}
        onClick={() =>
          onPageChange(Math.max(pageGroupStart - PAYMENT_PAGE_GROUP_SIZE, 0))
        }
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </button>
      {pages.map((page) => {
        const isCurrent = page === currentPage;

        return (
          <button
            aria-current={isCurrent ? "page" : undefined}
            aria-label={`${page + 1}페이지`}
            className={`grid size-8 place-items-center rounded-md text-body-sm transition ${
              isCurrent
                ? "bg-blue-700 font-semibold text-text-inverse"
                : "text-text-secondary hover:bg-blue-ice hover:text-text-primary"
            }`}
            key={page}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page + 1}
          </button>
        );
      })}
      <button
        aria-label={`${ariaLabel} 다음 그룹`}
        className="grid size-8 place-items-center text-text-secondary transition hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-30"
        disabled={!hasNextGroup}
        onClick={() => onPageChange(pageGroupStart + PAYMENT_PAGE_GROUP_SIZE)}
        type="button"
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
}

function EmptyTable({
  message,
  fixedFiveRows = false,
}: {
  message: string;
  fixedFiveRows?: boolean;
}) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-blue-ice">
      <div className="grid grid-cols-4 bg-surface-page px-5 py-3 text-caption font-semibold text-text-secondary">
        <span>날짜</span>
        <span>내용</span>
        <span>금액</span>
        <span>상태</span>
      </div>
      <div
        className={`px-5 text-center text-caption text-text-disabled ${
          fixedFiveRows ? "grid h-[380px] place-items-center" : "py-8"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

export function PaymentMethodsPage() {
  const queryClient = useQueryClient();
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardRegistrationForm, setCardRegistrationForm] =
    useState<CardRegistrationForm>(initialCardRegistrationForm);
  const [registrationSuccessOpen, setRegistrationSuccessOpen] = useState(false);
  const [paymentMethodAction, setPaymentMethodAction] =
    useState<PaymentMethodAction | null>(null);
  const [paymentMethodActionState, setPaymentMethodActionState] = useState({
    submitting: false,
    error: "",
  });
  const [paymentMethodSuccess, setPaymentMethodSuccess] =
    useState<PaymentMethodSuccess | null>(null);
  const [tokenCreditHistoryPage, setTokenCreditHistoryPage] = useState(0);
  const [tokenUsageHistoryPage, setTokenUsageHistoryPage] = useState(0);
  const [tokenChargeDialogOpen, setTokenChargeDialogOpen] = useState(false);
  const [tokenChargeState, setTokenChargeState] = useState({
    submitting: false,
    error: "",
  });
  const [chargedTokenAmount, setChargedTokenAmount] = useState<number | null>(
    null
  );
  const { profile } = useAuth();
  const memberUuid = profile?.memberUuid ?? "";
  const paymentSummary = usePaymentSummary(memberUuid);
  const paymentMethodsQuery = usePaymentMethods(memberUuid);
  const tokenProductsQuery = useTokenProducts(
    memberUuid,
    tokenChargeDialogOpen
  );
  const tokenCreditHistoryQuery = useTokenCreditHistory(memberUuid);
  const tokenUsageHistoryQuery = useTokenUsageHistory(memberUuid);
  const paymentSummaryError = useApiError(paymentSummary.error);
  const paymentMethodsError = useApiError(paymentMethodsQuery.error);
  const tokenCreditHistoryError = useApiError(tokenCreditHistoryQuery.error);
  const tokenUsageHistoryError = useApiError(tokenUsageHistoryQuery.error);
  const tokenProductsError = useApiError(tokenProductsQuery.error);
  const tokenBalance = paymentSummary.balance?.totalBalance;
  const tokenCreditEntries = tokenCreditHistoryQuery.data ?? [];
  const tokenCreditTotalPages = Math.ceil(
    tokenCreditEntries.length / PAYMENT_PAGE_SIZE
  );
  const tokenCreditPageGroupStart =
    Math.floor(tokenCreditHistoryPage / PAYMENT_PAGE_GROUP_SIZE) *
    PAYMENT_PAGE_GROUP_SIZE;
  const tokenCreditPageCount = Math.min(
    PAYMENT_PAGE_GROUP_SIZE,
    Math.max(tokenCreditTotalPages - tokenCreditPageGroupStart, 0)
  );
  const paginatedTokenCredits = tokenCreditEntries.slice(
    tokenCreditHistoryPage * PAYMENT_PAGE_SIZE,
    (tokenCreditHistoryPage + 1) * PAYMENT_PAGE_SIZE
  );
  const hasNextTokenCreditPageGroup =
    tokenCreditTotalPages > tokenCreditPageGroupStart + PAYMENT_PAGE_GROUP_SIZE;
  const tokenUsageEntries = tokenUsageHistoryQuery.data ?? [];
  const tokenUsageTotalPages = Math.ceil(
    tokenUsageEntries.length / PAYMENT_PAGE_SIZE
  );
  const tokenUsagePageGroupStart =
    Math.floor(tokenUsageHistoryPage / PAYMENT_PAGE_GROUP_SIZE) *
    PAYMENT_PAGE_GROUP_SIZE;
  const tokenUsagePageCount = Math.min(
    PAYMENT_PAGE_GROUP_SIZE,
    Math.max(tokenUsageTotalPages - tokenUsagePageGroupStart, 0)
  );
  const paginatedTokenUsage = tokenUsageEntries.slice(
    tokenUsageHistoryPage * PAYMENT_PAGE_SIZE,
    (tokenUsageHistoryPage + 1) * PAYMENT_PAGE_SIZE
  );
  const hasNextTokenUsagePageGroup =
    tokenUsageTotalPages > tokenUsagePageGroupStart + PAYMENT_PAGE_GROUP_SIZE;

  const closeCardDialog = () => {
    if (!cardRegistrationForm.submitting) {
      setCardDialogOpen(false);
      setCardRegistrationForm(initialCardRegistrationForm);
    }
  };

  const handleCardRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateCardRegistration(cardRegistrationForm);
    if (validationError) {
      setCardRegistrationForm((current) => ({
        ...current,
        error: validationError,
      }));
      return;
    }
    if (!memberUuid) {
      setCardRegistrationForm((current) => ({
        ...current,
        error: "회원 정보를 불러온 후 다시 시도해 주세요.",
      }));
      return;
    }

    setCardRegistrationForm((current) => ({
      ...current,
      submitting: true,
      error: "",
    }));
    try {
      const registered = await registerPaymentMethod(memberUuid, {
        cardName: cardRegistrationForm.cardName.trim(),
        cardNumber: cardRegistrationForm.cardNumber,
        expiryYear: cardRegistrationForm.expiryYear,
        expiryMonth: cardRegistrationForm.expiryMonth,
        birthOrBusinessRegistrationNumber:
          cardRegistrationForm.birthOrBusinessRegistrationNumber,
        passwordTwoDigits: cardRegistrationForm.passwordTwoDigits,
        defaultMethod: cardRegistrationForm.defaultMethod,
      });
      queryClient.setQueryData<PaymentMethod[]>(
        paymentQueryKeys.paymentMethods(memberUuid),
        (current) => [
          ...(current ?? []).map((paymentMethod) =>
            registered.defaultMethod
              ? { ...paymentMethod, defaultMethod: false }
              : paymentMethod
          ),
          registered,
        ]
      );
      setCardDialogOpen(false);
      setCardRegistrationForm(initialCardRegistrationForm);
      setRegistrationSuccessOpen(true);
    } catch (registrationError) {
      setCardRegistrationForm((current) => ({
        ...current,
        submitting: false,
        error:
          registrationError instanceof Error
            ? registrationError.message
            : "카드 등록에 실패했습니다.",
      }));
    }
  };

  const openPaymentMethodAction = (action: PaymentMethodAction) => {
    setPaymentMethodActionState({ submitting: false, error: "" });
    setPaymentMethodAction(action);
  };

  const closePaymentMethodAction = () => {
    if (!paymentMethodActionState.submitting) {
      setPaymentMethodAction(null);
      setPaymentMethodActionState({ submitting: false, error: "" });
    }
  };

  const handlePaymentMethodAction = async () => {
    if (
      !paymentMethodAction ||
      !memberUuid ||
      paymentMethodActionState.submitting
    ) {
      return;
    }

    setPaymentMethodActionState({ submitting: true, error: "" });
    try {
      if (paymentMethodAction.type === "set-default") {
        const updated = await setDefaultPaymentMethod(
          memberUuid,
          paymentMethodAction.paymentMethod.paymentMethodUuid
        );
        queryClient.setQueryData<PaymentMethod[]>(
          paymentQueryKeys.paymentMethods(memberUuid),
          (current) =>
            (current ?? []).map((paymentMethod) => ({
              ...paymentMethod,
              ...(paymentMethod.paymentMethodUuid === updated.paymentMethodUuid
                ? updated
                : {}),
              defaultMethod:
                paymentMethod.paymentMethodUuid === updated.paymentMethodUuid,
            }))
        );
        setPaymentMethodAction(null);
        setPaymentMethodActionState({ submitting: false, error: "" });
        setPaymentMethodSuccess("set-default");
        return;
      }

      await deletePaymentMethod(
        memberUuid,
        paymentMethodAction.paymentMethod.paymentMethodUuid
      );
      queryClient.setQueryData<PaymentMethod[]>(
        paymentQueryKeys.paymentMethods(memberUuid),
        (current) =>
          (current ?? []).filter(
            (paymentMethod) =>
              paymentMethod.paymentMethodUuid !==
              paymentMethodAction.paymentMethod.paymentMethodUuid
          )
      );
      await queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.paymentMethods(memberUuid),
      });
      setPaymentMethodAction(null);
      setPaymentMethodActionState({ submitting: false, error: "" });
      setPaymentMethodSuccess("delete");
    } catch (actionError) {
      setPaymentMethodActionState({
        submitting: false,
        error:
          actionError instanceof Error
            ? actionError.message
            : "결제수단 처리에 실패했습니다.",
      });
    }
  };

  const closeTokenChargeDialog = () => {
    if (!tokenChargeState.submitting) {
      setTokenChargeDialogOpen(false);
      setTokenChargeState({ submitting: false, error: "" });
    }
  };

  const handleTokenCharge = async (
    product: TokenProduct,
    paymentMethod: PaymentMethod
  ) => {
    if (!memberUuid || tokenChargeState.submitting) {
      return;
    }

    setTokenChargeState({ submitting: true, error: "" });
    try {
      const requestedCharge = await requestTokenCharge(
        memberUuid,
        product.code,
        paymentMethod.paymentMethodUuid,
        crypto.randomUUID()
      );
      const paidCharge = await payTokenCharge(
        memberUuid,
        requestedCharge.chargeUuid,
        product.salePrice
      );
      if (paidCharge.status !== "PAID") {
        throw new Error("토큰 결제가 완료되지 않았습니다.");
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: paymentQueryKeys.balance(memberUuid),
        }),
        queryClient.invalidateQueries({
          queryKey: ["tokens", memberUuid, "charges"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["tokens", memberUuid, "charge-history"],
        }),
        queryClient.invalidateQueries({
          queryKey: paymentQueryKeys.creditHistory(memberUuid),
        }),
      ]);
      setTokenChargeDialogOpen(false);
      setTokenChargeState({ submitting: false, error: "" });
      setChargedTokenAmount(paidCharge.tokenAmount);
    } catch (chargeError) {
      setTokenChargeState({
        submitting: false,
        error:
          chargeError instanceof Error
            ? chargeError.message
            : "토큰 충전에 실패했습니다.",
      });
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <MyPageCard>
        <h1 className="text-heading-lg text-text-primary">결제수단 관리</h1>
        <div className="flex w-full flex-col justify-between gap-4 rounded-lg bg-blue-ice/60 px-6 py-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-caption text-text-secondary">보유 토큰</p>
            <p className="mt-1 text-[28px] font-bold leading-none text-blue-700">
              {tokenBalance === undefined
                ? "—"
                : tokenBalance.toLocaleString("ko-KR")}{" "}
              P
            </p>
          </div>
          <dl className="flex flex-wrap gap-x-7 gap-y-2 text-caption text-text-primary">
            <div className="flex items-center gap-1">
              <dt>이번 달 사용:</dt>
              <dd className="font-semibold">
                {paymentSummary.monthlyUsedTokens.toLocaleString("ko-KR")} P
              </dd>
            </div>
            <div className="flex items-center gap-1">
              <dt>이번 달 충전:</dt>
              <dd className="font-semibold">
                {paymentSummary.monthlyChargedTokens.toLocaleString("ko-KR")} P
              </dd>
            </div>
          </dl>
        </div>
        {paymentSummary.isPending ? (
          <StatusMessage>토큰 정보를 불러오는 중입니다.</StatusMessage>
        ) : paymentSummaryError ? (
          <StatusMessage role="alert">{paymentSummaryError}</StatusMessage>
        ) : null}
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading
          description="토큰 충전에 사용할 카드를 관리하고 기본 결제수단을 설정할 수 있어요."
          title="등록된 결제 수단"
        />
        <div className="w-full">
          {!profile || paymentMethodsQuery.isPending ? (
            <StatusMessage>결제수단을 불러오는 중입니다.</StatusMessage>
          ) : paymentMethodsError ? (
            <StatusMessage role="alert">{paymentMethodsError}</StatusMessage>
          ) : paymentMethodsQuery.data?.length ? (
            <ul className="w-full divide-y divide-blue-ice border-y border-blue-ice">
              {paymentMethodsQuery.data.map((paymentMethod) => (
                <li
                  className="flex flex-wrap items-center gap-4 px-4 py-4"
                  key={paymentMethod.paymentMethodUuid}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-md border border-blue-ice bg-surface-page">
                    <CreditCard
                      aria-hidden="true"
                      className="size-5 text-brand-primary"
                    />
                  </span>
                  <div className="min-w-0 flex flex-1 flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-label-sm text-text-primary">
                      {paymentMethod.cardName}
                    </p>
                    <p className="text-body-sm text-text-secondary">
                      **** **** **** {paymentMethod.fourCardNumber}
                    </p>
                    <p className="text-caption text-text-secondary">
                      등록: {formatRegisteredAt(paymentMethod.registeredAt)}
                    </p>
                    {paymentMethod.defaultMethod ? (
                      <Badge tone="blue">기본 결제수단</Badge>
                    ) : null}
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    {!paymentMethod.defaultMethod ? (
                      <Button
                        buttonStyle="secondary"
                        disabled={paymentMethodActionState.submitting}
                        onClick={() =>
                          openPaymentMethodAction({
                            type: "set-default",
                            paymentMethod,
                          })
                        }
                        size="sm"
                        type="button"
                      >
                        기본 설정
                      </Button>
                    ) : null}
                    <Button
                      className="border-status-error text-status-error hover:bg-status-error/5"
                      buttonStyle="secondary"
                      disabled={paymentMethodActionState.submitting}
                      onClick={() =>
                        openPaymentMethodAction({
                          type: "delete",
                          paymentMethod,
                        })
                      }
                      size="sm"
                      type="button"
                    >
                      삭제
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <StatusMessage>
              <CreditCard
                aria-hidden="true"
                className="mx-auto mb-3 size-6 text-brand-primary"
              />
              등록된 결제수단이 없습니다.
            </StatusMessage>
          )}
        </div>
        <div className="flex w-full justify-end">
          <Button
            icon="left"
            iconComponent={Plus}
            onClick={() => setCardDialogOpen(true)}
            size="sm"
          >
            카드 등록
          </Button>
        </div>
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading
          description="멤버십 구독 등 토큰 충전을 제외한 결제 내역이에요."
          title="결제 내역"
        />
        <EmptyTable fixedFiveRows message="결제 내역이 없습니다." />
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading
          description="카드 결제 또는 등급 리워드로 충전된 토큰 내역이에요."
          title="토큰 충전 내역"
        />
        {!profile || tokenCreditHistoryQuery.isPending ? (
          <StatusMessage>토큰 충전 내역을 불러오는 중입니다.</StatusMessage>
        ) : tokenCreditHistoryError ? (
          <StatusMessage role="alert">{tokenCreditHistoryError}</StatusMessage>
        ) : tokenCreditEntries.length ? (
          <>
            <TokenCreditTable entries={paginatedTokenCredits} />
            <HistoryPagination
              ariaLabel="토큰 충전 내역 페이지"
              currentPage={tokenCreditHistoryPage}
              hasNextGroup={hasNextTokenCreditPageGroup}
              onPageChange={setTokenCreditHistoryPage}
              pageCount={tokenCreditPageCount}
              pageGroupStart={tokenCreditPageGroupStart}
            />
          </>
        ) : (
          <EmptyTable fixedFiveRows message="토큰 충전 내역이 없습니다." />
        )}
        <div className="flex w-full justify-end">
          <Button
            disabled={!memberUuid}
            onClick={() => {
              setTokenChargeState({ submitting: false, error: "" });
              setTokenChargeDialogOpen(true);
            }}
            size="sm"
          >
            토큰 충전하기
          </Button>
        </div>
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading
          description="토큰이 어디에 사용되었는지 확인할 수 있어요."
          title="토큰 사용 내역"
        />
        {!profile || tokenUsageHistoryQuery.isPending ? (
          <StatusMessage>토큰 사용 내역을 불러오는 중입니다.</StatusMessage>
        ) : tokenUsageHistoryError ? (
          <StatusMessage role="alert">{tokenUsageHistoryError}</StatusMessage>
        ) : tokenUsageEntries.length ? (
          <>
            <TokenUsageTable entries={paginatedTokenUsage} />
            <HistoryPagination
              ariaLabel="토큰 사용 내역 페이지"
              currentPage={tokenUsageHistoryPage}
              hasNextGroup={hasNextTokenUsagePageGroup}
              onPageChange={setTokenUsageHistoryPage}
              pageCount={tokenUsagePageCount}
              pageGroupStart={tokenUsagePageGroupStart}
            />
          </>
        ) : (
          <EmptyTable fixedFiveRows message="토큰 사용 내역이 없습니다." />
        )}
      </MyPageCard>

      <aside className="w-full rounded-lg border border-brand-primary/20 bg-blue-ice/50 px-6 py-5">
        <h2 className="text-heading-md text-blue-700">결제 수단 안내</h2>
        <ul className="mt-3 grid gap-2 text-caption leading-5 text-text-secondary">
          <li>
            • 카드번호·유효기간·본인확인번호·비밀번호는 서버에 저장하지
            않습니다.
          </li>
          <li>• 결제 정보는 PG사의 billingKey를 통해 안전하게 처리됩니다.</li>
          <li>• 카드 정보는 billingKey 발급 목적으로만 PG사에 전달됩니다.</li>
        </ul>
      </aside>

      <TokenChargeDialog
        balance={tokenBalance ?? 0}
        error={tokenChargeState.error || tokenProductsError}
        loading={tokenProductsQuery.isPending}
        onCharge={handleTokenCharge}
        onClose={closeTokenChargeDialog}
        open={tokenChargeDialogOpen}
        paymentMethods={paymentMethodsQuery.data ?? []}
        products={tokenProductsQuery.data ?? []}
        submitting={tokenChargeState.submitting}
      />

      <Modal
        closeOnOverlayClick={false}
        description={`${(chargedTokenAmount ?? 0).toLocaleString("ko-KR")}개의 토큰이 지급되었습니다.`}
        onClose={() => setChargedTokenAmount(null)}
        open={chargedTokenAmount !== null}
        primaryAction={{
          label: "확인",
          onClick: () => setChargedTokenAmount(null),
        }}
        title="토큰이 충전되었습니다"
        variant="success"
      />

      <Dialog
        description="입력한 카드 정보는 billingKey 발급에만 사용되며 원문으로 저장되지 않습니다."
        onClose={closeCardDialog}
        open={cardDialogOpen}
        title="카드 등록"
      >
        <form
          autoComplete="off"
          className="grid gap-4"
          onSubmit={(event) => void handleCardRegistration(event)}
        >
          <InputField
            disabled={cardRegistrationForm.submitting}
            label="카드 이름"
            maxLength={100}
            onChange={(event) =>
              setCardRegistrationForm((current) => ({
                ...current,
                cardName: event.target.value,
                error: "",
              }))
            }
            placeholder="예: 생활비 카드"
            required
            value={cardRegistrationForm.cardName}
          />
          <InputField
            autoComplete="cc-number"
            disabled={cardRegistrationForm.submitting}
            inputMode="numeric"
            label="카드 번호"
            maxLength={19}
            onChange={(event) =>
              setCardRegistrationForm((current) => ({
                ...current,
                cardNumber: onlyDigits(event.target.value, 19),
                error: "",
              }))
            }
            placeholder="숫자만 입력"
            required
            value={cardRegistrationForm.cardNumber}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              autoComplete="cc-exp-month"
              disabled={cardRegistrationForm.submitting}
              inputMode="numeric"
              label="유효기간 월"
              maxLength={2}
              onChange={(event) =>
                setCardRegistrationForm((current) => ({
                  ...current,
                  expiryMonth: onlyDigits(event.target.value, 2),
                  error: "",
                }))
              }
              placeholder="MM"
              required
              value={cardRegistrationForm.expiryMonth}
            />
            <InputField
              autoComplete="cc-exp-year"
              disabled={cardRegistrationForm.submitting}
              inputMode="numeric"
              label="유효기간 연도"
              maxLength={2}
              onChange={(event) =>
                setCardRegistrationForm((current) => ({
                  ...current,
                  expiryYear: onlyDigits(event.target.value, 2),
                  error: "",
                }))
              }
              placeholder="YY"
              required
              value={cardRegistrationForm.expiryYear}
            />
          </div>
          <InputField
            disabled={cardRegistrationForm.submitting}
            inputMode="numeric"
            label="생년월일 또는 사업자등록번호"
            maxLength={10}
            onChange={(event) =>
              setCardRegistrationForm((current) => ({
                ...current,
                birthOrBusinessRegistrationNumber: onlyDigits(
                  event.target.value,
                  10
                ),
                error: "",
              }))
            }
            placeholder="생년월일 6자리 또는 사업자등록번호 10자리"
            required
            value={cardRegistrationForm.birthOrBusinessRegistrationNumber}
          />
          <InputField
            autoComplete="off"
            disabled={cardRegistrationForm.submitting}
            inputMode="numeric"
            label="카드 비밀번호 앞 2자리"
            maxLength={2}
            onChange={(event) =>
              setCardRegistrationForm((current) => ({
                ...current,
                passwordTwoDigits: onlyDigits(event.target.value, 2),
                error: "",
              }))
            }
            placeholder="••"
            required
            type="password"
            value={cardRegistrationForm.passwordTwoDigits}
          />
          <label className="flex cursor-pointer items-center gap-2 text-body-sm text-text-primary">
            <input
              checked={cardRegistrationForm.defaultMethod}
              className="size-4 accent-brand-primary"
              disabled={cardRegistrationForm.submitting}
              onChange={(event) =>
                setCardRegistrationForm((current) => ({
                  ...current,
                  defaultMethod: event.target.checked,
                  error: "",
                }))
              }
              type="checkbox"
            />
            기본 결제수단으로 설정
          </label>
          {cardRegistrationForm.error ? (
            <p className="text-caption text-status-error" role="alert">
              {cardRegistrationForm.error}
            </p>
          ) : null}
          <div className="mt-2 flex justify-end gap-3">
            <Button
              buttonStyle="secondary"
              disabled={cardRegistrationForm.submitting}
              onClick={closeCardDialog}
              type="button"
            >
              취소
            </Button>
            <Button disabled={cardRegistrationForm.submitting} type="submit">
              {cardRegistrationForm.submitting ? "등록 중..." : "등록하기"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Modal
        closeOnOverlayClick={false}
        description="새 카드가 결제수단에 추가되었습니다."
        onClose={() => setRegistrationSuccessOpen(false)}
        open={registrationSuccessOpen}
        primaryAction={{
          label: "확인",
          onClick: () => setRegistrationSuccessOpen(false),
        }}
        title="카드가 등록되었습니다"
        variant="success"
      />

      {paymentMethodAction ? (
        <Modal
          appearance="glass"
          cancelAction={{
            label: "취소",
            onClick: closePaymentMethodAction,
          }}
          closeOnEscape={!paymentMethodActionState.submitting}
          closeOnOverlayClick={false}
          confirmAction={{
            label: paymentMethodActionState.submitting
              ? paymentMethodAction.type === "set-default"
                ? "설정 중..."
                : "삭제 중..."
              : paymentMethodAction.type === "set-default"
                ? "설정"
                : "삭제",
            onClick: () => void handlePaymentMethodAction(),
          }}
          confirmTone={
            paymentMethodAction.type === "set-default" ? "primary" : "danger"
          }
          description={
            paymentMethodActionState.error ||
            (paymentMethodAction.type === "set-default"
              ? "이 카드가 토큰 충전 시 기본으로 사용됩니다."
              : "등록된 카드가 결제수단에서 삭제됩니다.\n계속하시겠습니까?")
          }
          detail={
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md border border-blue-ice bg-surface-default">
                <CreditCard
                  aria-hidden="true"
                  className="size-5 text-brand-primary"
                />
              </span>
              <span className="min-w-0 font-semibold text-text-primary">
                {paymentMethodAction.paymentMethod.cardName}
              </span>
              <span className="ml-auto shrink-0 text-body-sm text-text-secondary">
                **** **** ****{" "}
                {paymentMethodAction.paymentMethod.fourCardNumber}
              </span>
            </div>
          }
          onClose={closePaymentMethodAction}
          open
          showIcon={false}
          title={
            paymentMethodAction.type === "set-default"
              ? "기본 결제수단으로 설정하시겠습니까?"
              : "카드를 삭제하시겠습니까?"
          }
          variant="confirm"
        />
      ) : null}

      <Modal
        closeOnOverlayClick={false}
        description={
          paymentMethodSuccess === "set-default"
            ? "선택한 카드가 기본 결제수단으로 설정되었습니다."
            : "해당 카드가 결제수단 목록에서 삭제되었습니다."
        }
        onClose={() => setPaymentMethodSuccess(null)}
        open={paymentMethodSuccess !== null}
        primaryAction={{
          label: "확인",
          onClick: () => setPaymentMethodSuccess(null),
        }}
        title={
          paymentMethodSuccess === "set-default"
            ? "기본 결제수단이 변경되었습니다"
            : "카드가 삭제되었습니다"
        }
        variant="success"
      />
    </div>
  );
}
