export type CustomerType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: number;
  avatarUrl: string;
  isActive: boolean;
  isGuest: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

export type UserGrowthItemType = {
  month: string;
  users: number;
  newUsers: number;
};
