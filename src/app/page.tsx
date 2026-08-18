export default function Home() {
  const stack = [
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "TanStack Query",
    "React Hook Form",
    "Zod",
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold text-primary">PLAN&amp;WITH</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        프론트엔드 개발 환경
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        공통 화면 개발을 위한 기본 기술 스택과 애플리케이션 구조가
        준비되었습니다.
      </p>

      <section
        aria-label="설정된 기술 스택"
        className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {stack.map((name) => (
          <div
            className="rounded-xl border border-border bg-surface p-5 font-semibold"
            key={name}
          >
            {name}
          </div>
        ))}
      </section>
    </main>
  );
}
