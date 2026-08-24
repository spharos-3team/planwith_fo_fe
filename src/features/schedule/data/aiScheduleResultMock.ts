export type AiScheduleCategory = "이동" | "식사" | "관광";

export interface AiScheduleActivity {
  id: string;
  time: string;
  title: string;
  category: AiScheduleCategory;
  description: string;
  cost: string;
}

export interface AiScheduleDay {
  id: string;
  day: number;
  theme: string;
  activities: AiScheduleActivity[];
}

const tokyoActivities: AiScheduleActivity[] = [
  {
    id: "airport-transfer",
    time: "10:00",
    title: "나리타 국제공항 도착 & 열차 이동",
    category: "이동",
    description:
      "스카이라이너 또는 N'EX 고속열차를 탑승하여 신속하게 도쿄 시내로 안전 진입 (약 45~60분 소요 예정)",
    cost: "약 ₩23,000",
  },
  {
    id: "sushi-midori",
    time: "12:30",
    title: "시부야 마크시티 스시 미도리",
    category: "식사",
    description:
      "가성비와 퀄리티를 모두 잡은 신선한 수제 초밥 전문점 (런치 대기 인원이 있을 수 있으니 가자마자 번호표 수령 필수!)",
    cost: "약 ₩35,000",
  },
  {
    id: "takeshita-street",
    time: "14:30",
    title: "하라주쿠 다케시타 스트리트",
    category: "관광",
    description:
      "독특한 스트리트 패션과 디저트 샵이 가득한 젊음의 거리. 맛있는 정통 마리온 크레페를 맛보며 산책하기 좋습니다.",
    cost: "약 ₩8,000",
  },
  {
    id: "shibuya-sky",
    time: "17:30",
    title: "시부야 스카이 전망대",
    category: "관광",
    description:
      "시부야 스크램블 교차로와 일몰, 그리고 도쿄 시내의 주홍빛 황홀한 야경을 사방 통유리로 볼 수 있는 도쿄 No.1 랜드마크 전망대 (예약필수!)",
    cost: "약 ₩22,000",
  },
];

export const aiScheduleResultDays: AiScheduleDay[] = [
  {
    id: "day-1",
    day: 1,
    theme: "도쿄 입국 & 시부야 탐방",
    activities: tokyoActivities,
  },
  {
    id: "day-2",
    day: 2,
    theme: "신주쿠 & 아사쿠사 코스",
    activities: tokyoActivities.map((activity) => ({
      ...activity,
      id: `day-2-${activity.id}`,
    })),
  },
];

export const aiTripSummary = [
  ["목적지", "일본 도쿄(Tokyo)"],
  ["여행 기간", "2026. 8. 1 ~ 8. 6 (5박 6일)"],
  ["인원수", "성인 2명"],
  ["이동 수단", "대중 교통"],
  ["총 예상 경비(1인 기준)", "약 1,800,000원"],
  ["날씨 정보", "현재 맑음 (최고 37° / 최저 28°)"],
] as const;
