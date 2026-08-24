import { Check, Coins } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { StatusMessage } from "@/components/common/StatusMessage";
import { MyPageCard } from "@/features/mypage/components/MyPageCard";
import { MyPageSectionHeading } from "@/features/mypage/components/MyPageSectionHeading";

const grades = [
  {
    name: "새싹 (Rookie)",
    posts: "-",
    followers: "-",
    likes: "-",
    tokens: "10토큰",
  },
  {
    name: "잎새 (Leaf)",
    posts: "3개 이상",
    followers: "10명 이상",
    likes: "30개 이상",
    tokens: "20토큰",
  },
  {
    name: "여행자 (Traveler)",
    posts: "10개 이상",
    followers: "100명 이상",
    likes: "500개 이상",
    tokens: "30토큰",
  },
  {
    name: "탐험가 (Explorer)",
    posts: "30개 이상",
    followers: "1,000명 이상",
    likes: "5,000개 이상",
    tokens: "50토큰",
  },
  {
    name: "모험가 (Adventurer)",
    posts: "100개 이상",
    followers: "10,000명 이상",
    likes: "30,000개 이상",
    tokens: "70토큰",
  },
  {
    name: "PLAN&WITH 마스터",
    posts: "200개 이상",
    followers: "50,000명 이상",
    likes: "150,000개 이상",
    tokens: "120토큰",
  },
];

export function MembershipPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <MyPageCard>
        <div className="flex w-full items-start justify-between gap-4">
          <div>
            <h1 className="text-heading-lg text-text-primary">멤버십 관리</h1>
            <p className="mt-5 text-caption text-text-secondary">
              현재 멤버십 등급
            </p>
            <p className="mt-1 text-[28px] font-bold leading-none text-blue-700">
              —
            </p>
          </div>
          <Button disabled size="sm">
            멤버십 신청하기
          </Button>
        </div>
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading title="다음 등급까지" />
        <StatusMessage>등급 진행 정보를 불러올 API가 필요합니다.</StatusMessage>
      </MyPageCard>

      <MyPageCard className="overflow-hidden">
        <MyPageSectionHeading
          description="게시글, 팔로워, 누적 좋아요 기준으로 등급이 자동으로 올라가고 매달 토큰이 지급돼요."
          title="등급 안내"
        />
        <div className="w-full overflow-x-auto">
          <table className="min-w-[760px] w-full border-separate border-spacing-0 text-left text-caption">
            <thead>
              <tr className="bg-surface-page text-text-secondary">
                {["등급", "게시글", "팔로워", "좋아요(누적)", "토큰(매달)"].map(
                  (label) => (
                    <th className="px-4 py-3 font-semibold" key={label}>
                      {label}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr className="border-b border-blue-ice" key={grade.name}>
                  <td className="px-4 py-3 font-semibold text-text-primary">
                    {grade.name}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {grade.posts}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {grade.followers}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {grade.likes}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">
                    {grade.tokens}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading
          description="등급에 따라 매달 자동으로 토큰을 지급받아요."
          title="토큰 리워드 멤버십"
        />
        <div className="flex w-full items-center gap-3 rounded-lg bg-blue-ice/60 px-5 py-4 text-body-sm text-text-primary">
          <Coins aria-hidden="true" className="size-5 text-accent-gold" />
          멤버십 정보 연동 후 월 지급 토큰이 표시됩니다.
        </div>
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading
          description="크리에이터의 프리미엄 콘텐츠를 구독하거나 멤버십을 운영할 수 있어요."
          title="크리에이터 멤버십"
        />
        <Badge tone="green">
          <Check aria-hidden="true" className="mr-1 size-3" /> 준비 중
        </Badge>
        <StatusMessage>멤버십 운영 및 구독 정보가 없습니다.</StatusMessage>
      </MyPageCard>
    </div>
  );
}
