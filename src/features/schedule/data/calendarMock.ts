export type ScheduleTab = "plan" | "companion" | "review";

export type ActivityBadgeTone = "meal" | "arrival" | "default";

export interface ScheduleActivity {
  id: string;
  time: string;
  title: string;
  badge?: string;
  badgeTone?: ActivityBadgeTone;
  description: string;
  location: string;
}

export interface ScheduleDay {
  id: string;
  label: string;
  theme: string;
  activities: ScheduleActivity[];
}

export interface TripSummary {
  destination: string;
  dates: string;
  duration: string;
  people: string;
  theme: string;
  budget: string;
  note: string;
}

export const scheduleTabs: { id: ScheduleTab; label: string }[] = [
  { id: "plan", label: "내 계획의 여행" },
  { id: "companion", label: "동행 구함" },
  { id: "review", label: "후기" },
];

export const mockTripSummary: TripSummary = {
  destination: "일본 / 도쿄(Tokyo)",
  dates: "2024. 8. 1 - 8. 5",
  duration: "4박 5일",
  people: "성인 2명",
  theme: "대표 코스",
  budget: "약 1,500,000원",
  note: "위 상세 정보를 기반으로 AI가 생성한 맞춤형 여행 일정입니다. 현지 날씨와 이동 시간을 반영해 조정할 수 있습니다.",
};

export const mockScheduleDays: ScheduleDay[] = [
  {
    id: "day-1",
    label: "DAY 1",
    theme: "도심 및 쇼핑 · 전통과 현대의 조화",
    activities: [
      {
        id: "d1-a1",
        time: "10:00",
        title: "나리타 공항 도착",
        badge: "도착",
        badgeTone: "arrival",
        description:
          "입국 수속 후 공항 리무진을 이용해 시부야로 이동합니다. 교통카드를 미리 준비해 두세요.",
        location: "Narita International Airport",
      },
      {
        id: "d1-a2",
        time: "12:30",
        title: "시부야 스크램블 교차로 & 하치코",
        badge: "식사",
        badgeTone: "meal",
        description:
          "도쿄의 상징적인 랜드마크를 둘러본 뒤 근처 라멘집에서 점심 식사를 즐깁니다.",
        location: "Shibuya Scramble Crossing",
      },
      {
        id: "d1-a3",
        time: "15:00",
        title: "하라주쿠 & 오모테산도 산책",
        description:
          "젊은 문화의 거리 하라주쿠를 거닌 후 오모테산도 카페에서 휴식을 취합니다.",
        location: "Harajuku / Omotesando",
      },
      {
        id: "d1-a4",
        time: "19:00",
        title: "시부야 스카이 야경",
        description:
          "일몰 시간에 맞춰 전망대에서 도쿄 야경을 감상하고 저녁 식사를 합니다.",
        location: "Shibuya Sky",
      },
    ],
  },
  {
    id: "day-2",
    label: "DAY 2",
    theme: "전통 문화 · 아사쿠사와 스카이트리",
    activities: [
      {
        id: "d2-a1",
        time: "09:30",
        title: "센소지 & 나카미세 거리",
        description:
          "도쿄에서 가장 오래된 사찰을 방문하고 기념품 거리를 둘러봅니다.",
        location: "Asakusa",
      },
      {
        id: "d2-a2",
        time: "13:00",
        title: "스카이트리 전망 & 쇼핑",
        badge: "식사",
        badgeTone: "meal",
        description:
          "도쿄 스카이트리 전망대 입장 후 주변 쇼핑몰에서 점심과 쇼핑을 진행합니다.",
        location: "Tokyo Skytree",
      },
      {
        id: "d2-a3",
        time: "17:30",
        title: "스미다강 유람선",
        description:
          "황혼 시간대 강 유람선을 타며 도쿄의 저녁 풍경을 감상합니다.",
        location: "Sumida River",
      },
    ],
  },
];
