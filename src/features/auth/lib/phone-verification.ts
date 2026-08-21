import type { PhoneVerificationConfirmResult } from "@/services/auth/member";
import {
  confirmPhoneVerification,
  preparePhoneVerification,
} from "@/services/auth/member";

const PORTONE_SDK_SRC = "https://cdn.portone.io/v2/browser-sdk.js";
const PHONE_VERIFICATION_ID_KEY = "planwith.phoneVerificationId";
const EXPECTED_NAME_KEY = "planwith.phoneVerificationName";
const EXPECTED_PHONE_KEY = "planwith.phoneVerificationPhone";

export function normalizeIdentityName(name: string): string {
  return name.trim().replace(/\s+/g, "");
}

export function peekExpectedIdentity(): { name: string; phone: string } {
  return {
    name: sessionStorage.getItem(EXPECTED_NAME_KEY) ?? "",
    phone: sessionStorage.getItem(EXPECTED_PHONE_KEY) ?? "",
  };
}

function rememberExpectedIdentity(name: string, phone: string): void {
  sessionStorage.setItem(EXPECTED_NAME_KEY, name.trim());
  sessionStorage.setItem(EXPECTED_PHONE_KEY, phone.replace(/\D/g, ""));
}

function clearExpectedIdentity(): void {
  sessionStorage.removeItem(EXPECTED_NAME_KEY);
  sessionStorage.removeItem(EXPECTED_PHONE_KEY);
}

function assertMatchesVerifiedName(
  enteredName: string,
  verifiedName: string
): void {
  if (
    !normalizeIdentityName(enteredName) ||
    !normalizeIdentityName(verifiedName)
  ) {
    throw new Error("본인인증 실명을 확인할 수 없습니다. 다시 인증해 주세요.");
  }
  if (
    normalizeIdentityName(enteredName) !== normalizeIdentityName(verifiedName)
  ) {
    throw new Error("입력한 이름이 본인인증 실명과 다릅니다.");
  }
}

interface PortOneIdentityResponse {
  code?: string;
  message?: string;
  identityVerificationId?: string;
}

interface PortOneSdk {
  requestIdentityVerification: (request: {
    storeId: string;
    channelKey: string;
    identityVerificationId: string;
    redirectUrl: string;
  }) => Promise<PortOneIdentityResponse | null | undefined>;
}

declare global {
  interface Window {
    PortOne?: PortOneSdk;
  }
}

function isStubStore(storeId: string, channelKey: string): boolean {
  return /stub|local/i.test(storeId) || /stub|local/i.test(channelKey);
}

function canUsePortOneSdk(storeId: string, channelKey: string): boolean {
  return (
    storeId.startsWith("store-") &&
    channelKey.startsWith("channel-key-") &&
    !isStubStore(storeId, channelKey)
  );
}

function loadPortOneSdk(): Promise<PortOneSdk> {
  if (window.PortOne?.requestIdentityVerification) {
    return Promise.resolve(window.PortOne);
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${PORTONE_SDK_SRC}"]`
  );

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("본인인증 SDK 로딩이 지연되고 있습니다."));
    }, 15_000);

    const handleLoad = () => {
      window.clearTimeout(timeout);
      if (!window.PortOne?.requestIdentityVerification) {
        reject(new Error("본인인증 SDK를 불러오지 못했습니다."));
        return;
      }
      resolve(window.PortOne);
    };

    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener(
        "error",
        () => {
          window.clearTimeout(timeout);
          reject(new Error("본인인증 SDK를 불러오지 못했습니다."));
        },
        { once: true }
      );
      queueMicrotask(() => {
        if (window.PortOne?.requestIdentityVerification) {
          window.clearTimeout(timeout);
          resolve(window.PortOne);
        }
      });
      return;
    }

    const script = document.createElement("script");
    script.src = PORTONE_SDK_SRC;
    script.async = true;
    script.onload = handleLoad;
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("본인인증 SDK를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });
}

async function requestPortOneIdentity(prepared: {
  storeId: string;
  channelKey: string;
  identityVerificationId: string;
}): Promise<void> {
  const portOne = await loadPortOneSdk();
  const response = await portOne.requestIdentityVerification({
    storeId: prepared.storeId,
    channelKey: prepared.channelKey,
    identityVerificationId: prepared.identityVerificationId,
    redirectUrl: `${window.location.origin}/signup`,
  });

  if (response?.code) {
    throw new Error(
      response.message || "본인인증이 취소되었거나 실패했습니다."
    );
  }
}

export function hasPhoneVerificationRedirect(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("identityVerificationId") || params.get("code"));
}

export async function resumePhoneVerificationIfRedirected(): Promise<PhoneVerificationConfirmResult | null> {
  const params = new URLSearchParams(window.location.search);
  const errorCode = params.get("code");
  const identityVerificationId =
    params.get("identityVerificationId") ??
    sessionStorage.getItem(PHONE_VERIFICATION_ID_KEY);

  if (errorCode) {
    throw new Error(
      params.get("message") || "본인인증이 취소되었거나 실패했습니다."
    );
  }

  if (!identityVerificationId || !params.get("identityVerificationId")) {
    return null;
  }

  const expected = peekExpectedIdentity();
  const confirmed = await confirmPhoneVerification(identityVerificationId);
  sessionStorage.removeItem(PHONE_VERIFICATION_ID_KEY);
  window.history.replaceState({}, "", "/signup");
  assertMatchesVerifiedName(expected.name, confirmed.name);
  clearExpectedIdentity();
  return confirmed;
}

export async function completePhoneVerification(
  phoneNumber: string,
  name: string
): Promise<PhoneVerificationConfirmResult> {
  rememberExpectedIdentity(name, phoneNumber);
  const prepared = await preparePhoneVerification(phoneNumber, name);

  if (
    !prepared.storeId ||
    !prepared.channelKey ||
    !prepared.identityVerificationId
  ) {
    throw new Error("본인인증 준비에 실패했습니다.");
  }

  if (isStubStore(prepared.storeId, prepared.channelKey)) {
    throw new Error(
      "연결된 서버가 포트원 스텁 모드입니다. 요청이 가는 member에 PORTONE_STUB_ENABLED=false 와 콘솔 Store ID/채널키를 넣으세요."
    );
  }

  if (!canUsePortOneSdk(prepared.storeId, prepared.channelKey)) {
    throw new Error(
      "포트원 storeId/channelKey 형식이 올바르지 않습니다. store-..., channel-key-... 인지 확인하세요."
    );
  }

  sessionStorage.setItem(
    PHONE_VERIFICATION_ID_KEY,
    prepared.identityVerificationId
  );
  await requestPortOneIdentity(prepared);
  const confirmed = await confirmPhoneVerification(
    prepared.identityVerificationId
  );
  sessionStorage.removeItem(PHONE_VERIFICATION_ID_KEY);
  assertMatchesVerifiedName(name, confirmed.name);
  clearExpectedIdentity();
  return confirmed;
}
