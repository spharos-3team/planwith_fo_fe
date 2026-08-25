import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  getTokenBalance,
  listCurrentMonthTokenCharges,
  listCurrentMonthTokenUsage,
  listPaymentMethods,
  listTokenCharges,
  listTokenCredits,
  listTokenProducts,
  listTokenUsage,
} from "@/services/token/token";

export const paymentQueryKeys = {
  balance: (memberUuid: string) => ["tokens", memberUuid, "balance"] as const,
  monthlyUsage: (memberUuid: string, month: string) =>
    ["tokens", memberUuid, "usage", month] as const,
  monthlyCharges: (memberUuid: string, month: string) =>
    ["tokens", memberUuid, "charges", month] as const,
  chargeHistory: (memberUuid: string, page: number, size: number) =>
    ["tokens", memberUuid, "charge-history", page, size] as const,
  creditHistory: (memberUuid: string) =>
    ["tokens", memberUuid, "credit-history"] as const,
  usageHistory: (memberUuid: string) =>
    ["tokens", memberUuid, "usage-history"] as const,
  paymentMethods: (memberUuid: string) =>
    ["tokens", memberUuid, "payment-methods"] as const,
  products: (memberUuid: string) => ["tokens", memberUuid, "products"] as const,
};

export function useTokenBalance(memberUuid: string) {
  return useQuery({
    queryKey: paymentQueryKeys.balance(memberUuid),
    queryFn: () => getTokenBalance(memberUuid),
    enabled: Boolean(memberUuid),
  });
}

export function usePaymentMethods(memberUuid: string) {
  return useQuery({
    queryKey: paymentQueryKeys.paymentMethods(memberUuid),
    queryFn: () => listPaymentMethods(memberUuid),
    enabled: Boolean(memberUuid),
  });
}

export function useTokenChargeHistory(memberUuid: string, page = 0, size = 20) {
  return useQuery({
    queryKey: paymentQueryKeys.chargeHistory(memberUuid, page, size),
    queryFn: () => listTokenCharges(memberUuid, page, size),
    enabled: Boolean(memberUuid),
  });
}

export function useTokenCreditHistory(memberUuid: string) {
  return useQuery({
    queryKey: paymentQueryKeys.creditHistory(memberUuid),
    queryFn: () => listTokenCredits(memberUuid),
    enabled: Boolean(memberUuid),
  });
}

export function useTokenUsageHistory(memberUuid: string) {
  return useQuery({
    queryKey: paymentQueryKeys.usageHistory(memberUuid),
    queryFn: () => listTokenUsage(memberUuid),
    enabled: Boolean(memberUuid),
  });
}

export function useTokenProducts(memberUuid: string, enabled: boolean) {
  return useQuery({
    queryKey: paymentQueryKeys.products(memberUuid),
    queryFn: () => listTokenProducts(memberUuid),
    enabled: Boolean(memberUuid) && enabled,
  });
}

export function usePaymentSummary(memberUuid: string) {
  const current = new Date();
  const currentYear = current.getFullYear();
  const currentMonth = current.getMonth();
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const monthRange = useMemo(
    () => ({
      start: new Date(currentYear, currentMonth, 1),
      end: new Date(currentYear, currentMonth + 1, 1),
    }),
    [currentMonth, currentYear]
  );
  const enabled = Boolean(memberUuid);
  const balanceQuery = useTokenBalance(memberUuid);
  const usageQuery = useQuery({
    queryKey: paymentQueryKeys.monthlyUsage(memberUuid, monthKey),
    queryFn: () => listCurrentMonthTokenUsage(memberUuid, monthRange),
    enabled,
  });
  const chargeQuery = useQuery({
    queryKey: paymentQueryKeys.monthlyCharges(memberUuid, monthKey),
    queryFn: () => listCurrentMonthTokenCharges(memberUuid, monthRange),
    enabled,
  });

  const monthlyUsedTokens = (usageQuery.data ?? []).reduce(
    (total, entry) => total + entry.amount,
    0
  );
  const monthlyChargedTokens = (chargeQuery.data ?? [])
    .filter((charge) => charge.status === "PAID")
    .reduce((total, charge) => total + charge.tokenAmount, 0);

  return {
    balance: balanceQuery.data,
    monthlyUsedTokens,
    monthlyChargedTokens,
    isPending:
      enabled &&
      (balanceQuery.isPending || usageQuery.isPending || chargeQuery.isPending),
    error: balanceQuery.error ?? usageQuery.error ?? chargeQuery.error,
  };
}
