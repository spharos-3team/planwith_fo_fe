export type StorySearchType = "CITY";

export interface StorySearchQuery {
  type: StorySearchType;
  keyword: string;
  page?: number;
  size?: number;
}

export interface StorySearchItem {
  storyUuid: string;
  title: string;
  countries: string[];
  cities: string[];
}

export interface StorySearchResult {
  items: StorySearchItem[];
  page: number;
  size: number;
}
