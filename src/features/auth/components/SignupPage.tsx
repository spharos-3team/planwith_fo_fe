"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { ProfileStep } from "@/features/auth/components/ProfileStep";
import { TermsStep } from "@/features/auth/components/TermsStep";
import { VerificationStep } from "@/features/auth/components/VerificationStep";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { hasPhoneVerificationRedirect } from "@/features/auth/lib/phone-verification";
import {
  getPendingSocialSignup,
  getSignupDraft,
  setPendingSocialSignup,
  setSignupDraft,
} from "@/features/auth/lib/storage";
import { nameSchema } from "@/features/auth/schemas/auth";
import {
  listTerms,
  signupLocal,
  uploadProfileImage,
} from "@/services/auth/member";
import { socialSignup } from "@/services/auth/social";

interface SignupState {
  step: 1 | 2 | 3;
  over14: boolean;
  agreements: Record<string, boolean>;
  marketingEmail: boolean;
  marketingSms: boolean;
  phoneNumber: string;
  phoneVerified: boolean;
  name: string;
  identityVerificationId: string;
  email: string;
  emailVerified: boolean;
  verificationCode: string;
  password: string;
  nickname: string;
  nicknameAvailable: boolean;
  profileIntro: string;
  profileImageFile: File | null;
  profilePreview: string | null;
  submitting: boolean;
  error: string;
}

const initialState: SignupState = {
  step: 1,
  over14: false,
  agreements: {},
  marketingEmail: false,
  marketingSms: false,
  phoneNumber: "",
  phoneVerified: false,
  name: "",
  identityVerificationId: "",
  email: "",
  emailVerified: false,
  verificationCode: "",
  password: "",
  nickname: "",
  nicknameAvailable: false,
  profileIntro: "",
  profileImageFile: null,
  profilePreview: null,
  submitting: false,
  error: "",
};

const emptySubscribe = () => () => undefined;

export function SignupPage() {
  const router = useRouter();
  const { applySession, login } = useAuth();
  const pendingSocial = useMemo(() => getPendingSocialSignup(), []);
  const [state, setState] = useState<SignupState>(initialState);
  const phoneRedirect = useSyncExternalStore(
    emptySubscribe,
    hasPhoneVerificationRedirect,
    () => false
  );

  useEffect(() => {
    const draft = getSignupDraft();
    if (!draft) {
      return;
    }

    // sessionStorage는 브라우저에서만 읽을 수 있어 마운트 후 초안을 복구한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- signup draft hydrate
    setState((current) => ({
      ...current,
      ...draft,
    }));
  }, []);

  useEffect(() => {
    if (state === initialState) {
      return;
    }

    setSignupDraft({
      step: state.step,
      over14: state.over14,
      agreements: state.agreements,
      marketingEmail: state.marketingEmail,
      marketingSms: state.marketingSms,
      phoneNumber: state.phoneNumber,
      phoneVerified: state.phoneVerified,
      name: state.name,
      email: state.email,
      emailVerified: state.emailVerified,
      verificationCode: state.verificationCode,
      password: state.password,
      nickname: state.nickname,
      nicknameAvailable: state.nicknameAvailable,
      profileIntro: state.profileIntro,
    });
  }, [state]);

  const patch = (next: Partial<SignupState>) => {
    setState((current) => ({ ...current, ...next }));
  };

  const step = phoneRedirect && state.step === 1 ? 2 : state.step;

  const handleSubmit = async () => {
    patch({ submitting: true, error: "" });

    try {
      if (!state.phoneVerified || !nameSchema.safeParse(state.name).success) {
        throw new Error("이름과 휴대폰 본인인증을 완료해주세요.");
      }

      const terms = await listTerms();
      const agreements = terms.map((term) => ({
        termUuid: term.termUuid,
        agreed: Boolean(state.agreements[term.termUuid]),
      }));
      if (pendingSocial) {
        const tokens = await socialSignup(pendingSocial.provider, {
          authorizationCode: pendingSocial.authorizationCode,
          redirectUri: pendingSocial.redirectUri,
          state: pendingSocial.oauthState,
          nickname: state.nickname,
          profileIntro: state.profileIntro || null,
          phoneNumber: state.phoneNumber,
          name: state.name,
          agreements,
        });
        await applySession(tokens);
        setPendingSocialSignup(null);
        setSignupDraft(null);
      } else {
        await signupLocal({
          email: state.email,
          password: state.password,
          phoneNumber: state.phoneNumber,
          name: state.name,
          nickname: state.nickname,
          profileIntro: state.profileIntro || null,
          agreements,
        });
        await login(state.email, state.password);
        setSignupDraft(null);
      }

      if (state.profileImageFile) {
        await uploadProfileImage(state.profileImageFile);
      }

      router.replace("/");
    } catch (error) {
      patch({
        submitting: false,
        error:
          error instanceof Error ? error.message : "회원가입에 실패했습니다.",
      });
    }
  };

  return (
    <section className="flex flex-col items-center bg-surface-default px-6 pb-16 pt-10">
      {step === 1 ? (
        <TermsStep
          agreements={state.agreements}
          marketingEmail={state.marketingEmail}
          marketingSms={state.marketingSms}
          onAgreementChange={(termUuid, agreed) =>
            setState((current) => ({
              ...current,
              agreements: { ...current.agreements, [termUuid]: agreed },
            }))
          }
          onMarketingChange={(channel, value) =>
            patch(
              channel === "email"
                ? { marketingEmail: value }
                : { marketingSms: value }
            )
          }
          onNext={() => patch({ step: 2 })}
          onOver14Change={(over14) => patch({ over14 })}
          over14={state.over14}
        />
      ) : null}

      {step === 2 ? (
        <VerificationStep
          email={state.email}
          emailVerified={state.emailVerified}
          name={state.name}
          onChange={(next) => patch(next)}
          onNext={() => patch({ step: 3 })}
          password={state.password}
          phoneNumber={state.phoneNumber}
          phoneVerified={state.phoneVerified}
          requireLocalCredentials={!pendingSocial}
          verificationCode={state.verificationCode}
        />
      ) : null}

      {step === 3 ? (
        <ProfileStep
          email={state.email}
          error={state.error}
          nickname={state.nickname}
          nicknameAvailable={state.nicknameAvailable}
          onImageChange={(file, preview) =>
            patch({ profileImageFile: file, profilePreview: preview })
          }
          onIntroChange={(profileIntro) => patch({ profileIntro })}
          onNicknameChange={(nickname) => patch({ nickname })}
          onNicknameChecked={(nicknameAvailable) =>
            patch({ nicknameAvailable })
          }
          onSubmit={handleSubmit}
          profileIntro={state.profileIntro}
          profilePreview={state.profilePreview}
          submitLabel={pendingSocial ? "login" : "다음"}
          submitting={state.submitting}
        />
      ) : null}
    </section>
  );
}
