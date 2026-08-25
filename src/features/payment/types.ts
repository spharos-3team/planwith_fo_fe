export interface TokenBalance {
  totalBalance: number;
  paidBalance: number;
  freeBalance: number;
  bonusBalance: number;
  memberUuid: string;
}

export interface TokenLedgerEntry {
  occurredAt: string;
  transactionType: "CHARGE" | "USE" | "REWARD" | "EXPIRE" | string;
  amountChange: number;
  amount: number;
  balanceAfter: number;
  usagePlace: string;
  description: string;
  tokenType: "PAID" | "FREE" | "BONUS" | string;
  transactionUuid: string;
  ledgerId: number;
}

export interface TokenChargeHistory {
  paymentCode: string;
  chargedAt: string | null;
  tokenAmount: number;
  paidAmount: number;
  paymentMethodName: string | null;
  cardLastFour: string | null;
  status: "READY" | "PAID" | "FAILED" | "CANCELED" | string;
  paymentType: "BILLING_KEY" | "ONE_TIME" | string;
  chargeUuid: string;
}

export interface PaymentMethod {
  paymentMethodUuid: string;
  cardName: string;
  fourCardNumber: string;
  defaultMethod: boolean;
  registeredAt: string;
}

export interface RegisterPaymentMethodRequest {
  cardName: string;
  cardNumber: string;
  expiryYear: string;
  expiryMonth: string;
  birthOrBusinessRegistrationNumber: string;
  passwordTwoDigits: string;
  defaultMethod: boolean;
}

export interface TokenProduct {
  code: string;
  name: string;
  salePrice: number;
  baseTokenAmount: number;
  bonusTokenAmount: number;
  totalTokenAmount: number;
}

export interface TokenCharge {
  chargeUuid: string;
  productCode: string;
  status: string;
  tokenAmount: number;
  paidAmount: number;
  paymentMethodUuid: string;
  paymentType: string;
  createdAt: string;
}
