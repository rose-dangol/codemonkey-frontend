export type NavigationItemType = {
  id: string;
  label: string;
  pageId: string;
  sortOrder?: number;
  isVisible?: boolean;
  page?: {
    slug: string;
    id: string;
  };
};

export type UpdateNavigationItemDto = {
  id?: string;
  label?: string;
  pageId?: string;
  sortOrder?: number;
  isVisible?: boolean;
};
