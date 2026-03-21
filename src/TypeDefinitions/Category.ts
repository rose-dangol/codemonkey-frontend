export type Category = {
  id: string;
  categoryName: string;
  categoryParentId: string | null;
  categoryImage: string;
  categoryDesc: string;
  subCategories: Category[]; // recursive!
}