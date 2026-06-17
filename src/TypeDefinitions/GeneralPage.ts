import type { NavigationItemType } from "./NavigationItem";

export interface GeneralPageDto {
  id?: string;
  heading: string;
  slug: string;
  description: string;
  bannerImage?: string | File | null;
  createdAt?: string;
  updatedAt?: string;
  navigationItems?: NavigationItemType[];
}
