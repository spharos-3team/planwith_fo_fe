import Link from "next/link";

interface AuthHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function AuthHero({ eyebrow, title, description }: AuthHeroProps) {
  return (
    <div className="flex flex-col items-center pt-10 text-center">
      {eyebrow ? (
        <p className="text-body-md uppercase tracking-[0.08em] text-text-primary [text-shadow:0_3px_2.5px_#216bfe]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-5 text-heading-hero uppercase text-text-primary">
        {title}
      </h1>
      <p className="mt-3 text-body-sm text-text-tertiary">{description}</p>
    </div>
  );
}

export function AuthLoginLink() {
  return (
    <p className="text-center text-body-md text-text-tertiary">
      이미 계정이 있으신가요?{" "}
      <Link className="font-bold underline" href="/login">
        로그인
      </Link>
    </p>
  );
}
