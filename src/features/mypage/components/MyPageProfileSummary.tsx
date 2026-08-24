import { ProfileAvatar } from "@/features/mypage/components/ProfileAvatar";

interface MyPageProfileSummaryProps {
  nickname: string;
  profileImage: string | null;
  profileIntro: string | null;
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-2 px-4">
      <span className="text-body-sm text-text-secondary">{label}</span>
      <strong className="text-heading-md text-text-primary">
        {value ?? "—"}
      </strong>
    </div>
  );
}

export function MyPageProfileSummary({
  nickname,
  profileImage,
  profileIntro,
  postCount,
  followerCount,
  followingCount,
}: MyPageProfileSummaryProps) {
  return (
    <section className="w-full rounded-[24px] border-[1.5px] border-blue-ice bg-surface-default p-6 sm:p-8">
      <div className="flex flex-col items-center">
        <ProfileAvatar nickname={nickname} size={120} src={profileImage} />
        <h1 className="mt-5 text-heading-xl text-text-primary">{nickname}님</h1>
        <p className="mt-1 text-body-sm text-text-secondary">
          {profileIntro || "소개글을 입력해주세요"}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-blue-ice border-t border-blue-ice pt-6">
        <Stat label="게시글" value={postCount} />
        <Stat label="팔로워" value={followerCount} />
        <Stat label="팔로우" value={followingCount} />
      </div>
    </section>
  );
}
