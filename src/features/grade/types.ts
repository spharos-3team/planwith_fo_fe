export type GradeCode =
  "ROOKIE" | "LEAF" | "TRAVELER" | "EXPLORER" | "ADVENTURE" | "PLANWITH";

export type GradeMetricType =
  "STORY_COUNT" | "FOLLOWER_COUNT" | "RECEIVED_LIKE_COUNT";

export interface GradeCondition {
  metricType: GradeMetricType;
  conditionName: string;
  thresholdValue: number;
  description: string;
}

export interface GradeBenefit {
  benefitCode: string;
  benefitName: string;
  benefitValue: string;
  description: string;
}

export interface GradeCatalogItem {
  gradeCode: GradeCode;
  gradeName: string;
  gradeLevel: number;
  conditions: GradeCondition[];
  benefits: GradeBenefit[];
}

export interface CurrentGrade {
  code: GradeCode;
  name: string;
  level: number;
  benefits: GradeBenefit[];
}

export interface CurrentGradeBenefits {
  gradeCode: GradeCode;
  gradeName: string;
  gradeLevel: number;
  monthlyTokenAmount: number;
  profileBadge: boolean;
  profileSpecialBorder: boolean;
  membershipPublicStory: boolean;
  membershipAccess: boolean;
  storyPriorityExposure: string;
}

export interface GradeManagementPage {
  grades: GradeCatalogItem[];
  currentGrade: CurrentGrade;
  currentMetrics: {
    storyCount: number;
    followerCount: number;
    receivedLikeCount: number;
  };
  nextGrade: {
    code: GradeCode;
    name: string;
    conditions: GradeCondition[];
  } | null;
  progress: {
    story: GradeMetricProgress;
    follower: GradeMetricProgress;
    receivedLike: GradeMetricProgress;
  };
  currentBenefits: CurrentGradeBenefits;
}

interface GradeMetricProgress {
  current: number;
  required: number;
  remaining: number;
  percentage: number;
}
