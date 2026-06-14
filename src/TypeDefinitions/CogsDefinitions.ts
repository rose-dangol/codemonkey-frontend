export type CogsDefinitionType = {
  id: string;
  name: string;
  key: string;
  isActive?: boolean;
};

export type Cogs = {
  [key: string]: string;
};
