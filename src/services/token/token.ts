import type {
  PaymentMethod,
  RegisterPaymentMethodRequest,
  TokenBalance,
  TokenCharge,
  TokenChargeHistory,
  TokenLedgerEntry,
  TokenProduct,
} from "@/features/payment/types";
import { rawApiClient } from "@/utils/apiClient";

const TOKEN_API_PREFIX = "/api/planwith-fo-token";
const HISTORY_PAGE_SIZE = 100;
const MAX_HISTORY_PAGES = 100;

interface MonthRange {
  start: Date;
  end: Date;
}

function memberTokenPath(memberUuid: string): string {
  return `${TOKEN_API_PREFIX}/members/${memberUuid}/tokens`;
}

function isWithinRange(value: string | null, range: MonthRange): boolean {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();
  return (
    Number.isFinite(timestamp) &&
    timestamp >= range.start.getTime() &&
    timestamp < range.end.getTime()
  );
}

async function listCurrentMonthEntries<T>(
  requestPage: (page: number) => Promise<T[]>,
  getOccurredAt: (entry: T) => string | null,
  range: MonthRange
): Promise<T[]> {
  const entries: T[] = [];

  for (let page = 0; page < MAX_HISTORY_PAGES; page += 1) {
    const pageEntries = await requestPage(page);
    entries.push(
      ...pageEntries.filter((entry) =>
        isWithinRange(getOccurredAt(entry), range)
      )
    );

    const reachedPreviousMonth = pageEntries.some((entry) => {
      const occurredAt = getOccurredAt(entry);
      return occurredAt
        ? new Date(occurredAt).getTime() < range.start.getTime()
        : false;
    });

    if (pageEntries.length < HISTORY_PAGE_SIZE || reachedPreviousMonth) {
      break;
    }
  }

  return entries;
}

async function listAllHistoryEntries<T>(
  requestPage: (page: number) => Promise<T[]>
): Promise<T[]> {
  const entries: T[] = [];

  for (let page = 0; page < MAX_HISTORY_PAGES; page += 1) {
    const pageEntries = await requestPage(page);
    entries.push(...pageEntries);

    if (pageEntries.length < HISTORY_PAGE_SIZE) {
      break;
    }
  }

  return entries;
}

export function getTokenBalance(memberUuid: string): Promise<TokenBalance> {
  return rawApiClient<TokenBalance>(`${memberTokenPath(memberUuid)}/balance`);
}

export function listPaymentMethods(
  memberUuid: string
): Promise<PaymentMethod[]> {
  return rawApiClient<PaymentMethod[]>(
    `${TOKEN_API_PREFIX}/members/${memberUuid}/payment-methods`
  );
}

export function registerPaymentMethod(
  memberUuid: string,
  request: RegisterPaymentMethodRequest
): Promise<PaymentMethod> {
  return rawApiClient<PaymentMethod>(
    `${TOKEN_API_PREFIX}/members/${memberUuid}/payment-methods`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

export function setDefaultPaymentMethod(
  memberUuid: string,
  paymentMethodUuid: string
): Promise<PaymentMethod> {
  return rawApiClient<PaymentMethod>(
    `${TOKEN_API_PREFIX}/members/${memberUuid}/payment-methods/${paymentMethodUuid}/default`,
    { method: "POST" }
  );
}

export function deletePaymentMethod(
  memberUuid: string,
  paymentMethodUuid: string
): Promise<void> {
  return rawApiClient<void>(
    `${TOKEN_API_PREFIX}/members/${memberUuid}/payment-methods/${paymentMethodUuid}`,
    { method: "DELETE" },
    { allowEmpty: true }
  );
}

export function listTokenProducts(memberUuid: string): Promise<TokenProduct[]> {
  return rawApiClient<TokenProduct[]>(
    `${TOKEN_API_PREFIX}/members/${memberUuid}/token-products`
  );
}

export function requestTokenCharge(
  memberUuid: string,
  productCode: string,
  paymentMethodUuid: string,
  clientRequestId: string
): Promise<TokenCharge> {
  return rawApiClient<TokenCharge>(
    `${TOKEN_API_PREFIX}/members/${memberUuid}/charges`,
    {
      method: "POST",
      body: JSON.stringify({
        productCode,
        paymentMethodUuid,
        paymentType: "BILLING_KEY",
        clientRequestId,
      }),
    }
  );
}

export function payTokenCharge(
  memberUuid: string,
  chargeUuid: string,
  paidAmount: number
): Promise<TokenCharge> {
  return rawApiClient<TokenCharge>(
    `${TOKEN_API_PREFIX}/members/${memberUuid}/charges/${chargeUuid}/pay`,
    {
      method: "POST",
      body: JSON.stringify({ paidAmount }),
    }
  );
}

export function listTokenCharges(
  memberUuid: string,
  page = 0,
  size = 20
): Promise<TokenChargeHistory[]> {
  return rawApiClient<TokenChargeHistory[]>(
    `${memberTokenPath(memberUuid)}/charges?page=${page}&size=${size}`
  );
}

export async function listTokenCredits(
  memberUuid: string
): Promise<TokenLedgerEntry[]> {
  const [charges, rewards] = await Promise.all(
    ["CHARGE", "REWARD"].map((type) =>
      listAllHistoryEntries((page) =>
        rawApiClient<TokenLedgerEntry[]>(
          `${memberTokenPath(memberUuid)}/ledger?type=${type}&page=${page}&size=${HISTORY_PAGE_SIZE}`
        )
      )
    )
  );

  return [...charges, ...rewards].sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
  );
}

export function listTokenUsage(
  memberUuid: string
): Promise<TokenLedgerEntry[]> {
  return listAllHistoryEntries((page) =>
    rawApiClient<TokenLedgerEntry[]>(
      `${memberTokenPath(memberUuid)}/ledger?type=USE&page=${page}&size=${HISTORY_PAGE_SIZE}`
    )
  );
}

export function listCurrentMonthTokenUsage(
  memberUuid: string,
  range: MonthRange
): Promise<TokenLedgerEntry[]> {
  return listCurrentMonthEntries(
    (page) =>
      rawApiClient<TokenLedgerEntry[]>(
        `${memberTokenPath(memberUuid)}/ledger?type=USE&page=${page}&size=${HISTORY_PAGE_SIZE}`
      ),
    (entry) => entry.occurredAt,
    range
  );
}

export function listCurrentMonthTokenCharges(
  memberUuid: string,
  range: MonthRange
): Promise<TokenChargeHistory[]> {
  return listCurrentMonthEntries(
    (page) =>
      rawApiClient<TokenChargeHistory[]>(
        `${memberTokenPath(memberUuid)}/charges?page=${page}&size=${HISTORY_PAGE_SIZE}`
      ),
    (entry) => entry.chargedAt,
    range
  );
}
