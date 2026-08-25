"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { StatusMessage } from "@/components/common/StatusMessage";
import type { PaymentMethod, TokenProduct } from "@/features/payment/types";

interface TokenChargeDialogProps {
  balance: number;
  error: string;
  loading: boolean;
  onCharge: (
    product: TokenProduct,
    paymentMethod: PaymentMethod
  ) => Promise<void>;
  onClose: () => void;
  open: boolean;
  paymentMethods: PaymentMethod[];
  products: TokenProduct[];
  submitting: boolean;
}

export function TokenChargeDialog({
  balance,
  error,
  loading,
  onCharge,
  onClose,
  open,
  paymentMethods,
  products,
  submitting,
}: TokenChargeDialogProps) {
  const [selectedProductCode, setSelectedProductCode] = useState("");
  const defaultPaymentMethod = useMemo(
    () => paymentMethods.find((paymentMethod) => paymentMethod.defaultMethod),
    [paymentMethods]
  );
  const selectedProduct =
    products.find((product) => product.code === selectedProductCode) ??
    products[0] ??
    null;

  const closeDialog = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog
      closeOnOverlayClick={false}
      description="충전할 토큰 수량을 선택해주세요."
      onClose={closeDialog}
      open={open}
      showCloseButton={false}
      size="lg"
      title="토큰 충전"
    >
      <div className="grid gap-6">
        <div className="flex items-center justify-between rounded-lg bg-blue-ice/70 px-5 py-4">
          <span className="text-body-sm text-text-disabled">
            현재 보유 토큰
          </span>
          <strong className="text-heading-lg text-blue-700">
            {balance.toLocaleString("ko-KR")} P
          </strong>
        </div>

        <section aria-labelledby="token-products-title">
          <h3
            className="mb-4 text-label-sm text-text-primary"
            id="token-products-title"
          >
            충전 수량
          </h3>
          {loading ? (
            <StatusMessage>토큰 상품을 불러오는 중입니다.</StatusMessage>
          ) : products.length ? (
            <div
              aria-label="토큰 상품"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              role="radiogroup"
            >
              {products.map((product) => {
                const selected = product.code === selectedProduct?.code;
                return (
                  <button
                    aria-checked={selected}
                    className={`min-h-[86px] rounded-lg border px-4 py-3 text-center transition ${
                      selected
                        ? "border-2 border-blue-700 bg-blue-ice/50"
                        : "border-line-light bg-surface-default hover:border-brand-primary"
                    }`}
                    disabled={submitting}
                    key={product.code}
                    onClick={() => setSelectedProductCode(product.code)}
                    role="radio"
                    type="button"
                  >
                    <span
                      className={`block text-label-sm ${
                        selected ? "text-blue-700" : "text-text-primary"
                      }`}
                    >
                      {product.name}
                    </span>
                    <span
                      className={`mt-1 block text-body-sm ${
                        selected ? "text-blue-700" : "text-text-secondary"
                      }`}
                    >
                      {product.baseTokenAmount.toLocaleString("ko-KR")}코인
                      {product.bonusTokenAmount > 0
                        ? ` +${product.bonusTokenAmount.toLocaleString("ko-KR")} 보너스`
                        : ""}
                    </span>
                    <span className="mt-1 block text-caption text-text-disabled">
                      {product.salePrice.toLocaleString("ko-KR")}원
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <StatusMessage>
              현재 충전 가능한 토큰 상품이 없습니다.
            </StatusMessage>
          )}
        </section>

        <section className="border-t border-line-light pt-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-label-sm text-text-primary">결제 수단</h3>
            {defaultPaymentMethod ? (
              <div className="flex min-w-0 items-center justify-end gap-2">
                <span className="truncate text-body-sm text-text-primary">
                  {defaultPaymentMethod.cardName} ****{" "}
                  {defaultPaymentMethod.fourCardNumber}
                </span>
                <Badge tone="blue">기본</Badge>
              </div>
            ) : (
              <span className="text-caption text-status-error">
                기본 결제수단을 등록해주세요.
              </span>
            )}
          </div>
        </section>

        {selectedProduct ? (
          <dl className="grid gap-2 rounded-lg bg-blue-ice/60 px-5 py-4 text-body-sm">
            <div className="flex justify-between">
              <dt className="text-text-disabled">지급 코인</dt>
              <dd className="font-semibold text-text-primary">
                {selectedProduct.baseTokenAmount.toLocaleString("ko-KR")}코인
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-disabled">보너스 코인</dt>
              <dd className="font-semibold text-status-success">
                +{selectedProduct.bonusTokenAmount.toLocaleString("ko-KR")}코인
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-disabled">결제 금액</dt>
              <dd className="text-heading-md text-blue-700">
                {selectedProduct.salePrice.toLocaleString("ko-KR")}원
              </dd>
            </div>
          </dl>
        ) : null}

        {error ? (
          <p className="text-caption text-status-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3">
          <Button
            buttonStyle="secondary"
            className="flex-1 border-line-light text-text-disabled"
            disabled={submitting}
            onClick={closeDialog}
          >
            취소
          </Button>
          <Button
            className="flex-1"
            disabled={
              submitting || loading || !selectedProduct || !defaultPaymentMethod
            }
            onClick={() => {
              if (selectedProduct && defaultPaymentMethod) {
                void onCharge(selectedProduct, defaultPaymentMethod);
              }
            }}
          >
            {submitting ? "충전 중..." : "충전하기"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
