import Image from "next/image";

import { ContentContainer } from "@/components/common/layout/ContentContainer";

export function MeetingHero() {
  return (
    <section
      aria-label="함께 만드는 특별한 여행 스토리"
      className="relative isolate h-[clamp(260px,26vw,500px)] w-full overflow-hidden bg-surface-default text-text-primary"
    >
      <Image
        alt="해변에서 함께 여행하는 사람들"
        className="object-cover object-center opacity-60"
        fill
        priority
        sizes="100vw"
        src="/images/meetings/hero-background.png"
        unoptimized
      />

      <ContentContainer className="absolute inset-0 z-[1] h-full">
        <div className="relative h-full w-full">
          <div className="absolute left-0 right-0 top-1/2 max-w-[580px] -translate-y-1/2 sm:right-auto sm:w-[60%] md:left-[15.21%] md:w-[36.77%]">
            <h1 className="text-[clamp(2.25rem,2.5vw,3rem)] font-semibold leading-[1.25]">
              함께 만드는
              <br />
              특별한 여행 스토리
            </h1>
            <p className="mt-4 text-[15px] leading-[1.6]">
              혼자 가기 머뭇거려졌던 코스도, 부담되는 렌트카 비용도 이제
              고민하지 마세요. 검증된 멤버들과 안전하게 동행할 모임을 탐색하고
              손쉽게 참여해 보세요.
            </p>
          </div>
        </div>
      </ContentContainer>
    </section>
  );
}
