export type TagType = {
  id?: string;
  name: string;
  slug: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export interface ProductTag {
  productId: string;
  tagId: string;
  assignedAt: string;
  tag: TagType;
}

export type Attributes = {
  id: string;
  key: string;
  value: string;
  attributeDefinitionId: string;
};
