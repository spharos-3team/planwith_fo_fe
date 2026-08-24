import Image from "next/image";

export function MeetingHero() {
  return (
    <section
      aria-label="함께 만드는 특별한 여행 스토리"
      className="relative isolate h-[40rem] w-full overflow-hidden text-white"
    >
      <Image
        alt="함께 만드는 특별한 여행 스토리"
        className="object-cover object-[center_28%]"
        fill
        priority
        sizes="100vw"
        src="/images/meetings/hero.png"
      />
    </section>
  );
}
