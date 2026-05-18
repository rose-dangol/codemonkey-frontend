export type CategoryType = {
  id: string;
  categoryName: string;
  categoryParentId: string | null;
  categoryImage: string;
  categoryDesc: string;
  subCategories: CategoryType[]; // recursive!
};
