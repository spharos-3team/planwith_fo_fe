export function MeetingHero() {
  return (
    <section className="relative isolate h-[min(40rem,70dvh)] min-h-[22.5rem] w-full overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(110deg,#1b3a5c_0%,#387bff_48%,#7ab8ff_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgb(255_255_255/0.22),transparent_55%)]"
      />
      <div className="relative z-[1] mx-auto flex h-full max-w-[1200px] flex-col justify-center px-6 sm:px-10">
        <h1 className="max-w-[36.25rem] text-[clamp(2rem,4vw,3.75rem)] font-bold leading-tight">
          함께 만드는 특별한 여행 스토리
        </h1>
        <p className="mt-6 max-w-[36.25rem] text-body-md leading-7 text-white/90">
          혼자 가기 머뭇거려졌던 코스도, 부담되는 렌트카 비용도 이제 고민하지
          마세요. 검증된 멤버들과 안전하게 동행할 모임을 탐색하고 손쉽게 참여해
          보세요.
        </p>
      </div>
    </section>
  );
}
