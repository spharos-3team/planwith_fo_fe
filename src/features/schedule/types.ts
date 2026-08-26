export type ScheduleCreatorType = "USER" | "AI" | "OTHER";

export type ScheduleTransportation =
  "TRAIN_PUBLIC_TRANSIT" | "SHIP_FERRY" | "RENTAL_CAR" | "WALKING" | "OTHER";

export type ScheduleTravelStyle =
  "TOUR_LANDMARK" | "RELAXATION_HEALING" | "FOOD_TOUR" | "ACTIVITY" | "OTHER";

export type ScheduleItemType =
  "MOVE" | "FOOD" | "TOUR" | "STAY" | "ACTIVITY" | "ETC";

export type ScheduleCategoryId = "owned" | "ai" | "shared" | "review";

export interface CalendarSchedule {
  scheduleUuid: string;
  title: string;
  startDate: string;
  endDate: string;
  calendarColor: string | null;
  creatorType: ScheduleCreatorType | string | null;
}

export interface ScheduleRecord {
  scheduleUuid: string;
  title: string;
  destination: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  headcount: number | null;
  expectedCost: number | null;
  transportation: ScheduleTransportation | string | null;
  travelStyle: ScheduleTravelStyle | string | null;
  content: string | null;
  calendarColor: string | null;
  creatorType: ScheduleCreatorType | string | null;
}

export interface ScheduleItem {
  scheduleItemId: number;
  dayNumber: number;
  scheduleTime: string | null;
  subtitle: string | null;
  scheduleType: ScheduleItemType | string | null;
  description: string | null;
  estimatedCost: number | null;
  placeName: string | null;
  placeAddress: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ScheduleDetail {
  schedule: ScheduleRecord;
  items: ScheduleItem[];
}

export interface CreateSchedulePayload {
  memberUuid: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  headcount: number;
  content?: string;
  calendarColor?: string;
  expectedCost?: number;
  transportation?: ScheduleTransportation;
  travelStyle?: ScheduleTravelStyle;
}

export interface UpdateSchedulePayload {
  title?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  headcount?: number;
  content?: string;
  calendarColor?: string;
  expectedCost?: number;
  transportation?: ScheduleTransportation;
  travelStyle?: ScheduleTravelStyle;
}

export interface CreateScheduleResult {
  scheduleUuid: string;
  memberUuid: string;
  title: string;
}

export interface AiScheduleReviseResult {
  scheduleUuid: string;
  revisedContent: string;
}

export interface AiScheduleGeneratePayload {
  destination: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  estimatedBudget: number;
  transportation?: ScheduleTransportation;
  travelStyle?: ScheduleTravelStyle;
  additionalRequest?: string;
}

export interface AiGeneratedItem {
  dayNumber: number;
  scheduleTime: string | null;
  subtitle: string | null;
  scheduleType: ScheduleItemType | string | null;
  description: string | null;
  estimatedCost: number | null;
  placeName: string | null;
  placeAddress: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface AiScheduleGenerateResult {
  memberUuid: string | null;
  title: string;
  destination: string;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  participantCount: number | null;
  estimatedBudget: number | null;
  transportation: ScheduleTransportation | string | null;
  travelStyle: ScheduleTravelStyle | string | null;
  content: string | null;
  items: AiGeneratedItem[];
}

export interface AiScheduleSaveResult {
  scheduleUuid: string;
  memberUuid: string;
  title: string;
  itemCount: number;
}
