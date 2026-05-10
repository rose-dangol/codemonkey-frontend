import type { Product } from "./Product";

export type AttributeDefinitionType = {
  serviceTypeId: string;
  key: string;
  name: string;
  type: string;
  allowedValues?: string[];
  isActive?: boolean;
};

export type Attributes = {
  id: string;
  key: string;
  value: string;
  attributeDefinitionId: string;
};
