import Link from "next/link";

export function LogoutCompletedPage() {
  return (
    <section className="grid min-h-[560px] place-items-center px-6 py-20 text-center">
      <div>
        <h1 className="text-heading-xl text-text-primary">
          로그아웃 되었습니다
        </h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          다시 돌아오시면 언제든 환영합니다.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            className="inline-flex h-10 min-w-32 items-center justify-center rounded-md border border-line-light bg-surface-default px-5 text-body-sm font-bold text-text-primary"
            href="/"
          >
            홈으로
          </Link>
          <Link
            className="inline-flex h-10 min-w-32 items-center justify-center rounded-md bg-blue-700 px-5 text-body-sm font-bold text-text-inverse"
            href="/login"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </section>
  );
}
