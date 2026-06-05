export type TagType = {
  id?: string;
  name: string;
  slug: string;
  isActive?: boolean;
};

export type Attributes = {
  id: string;
  key: string;
  value: string;
  attributeDefinitionId: string;
};
