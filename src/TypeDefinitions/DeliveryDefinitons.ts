export type DeliveryCharge = {
  id: string;
  city: string;
  charge: number;
  isActive?: boolean;
};

export type CreateDeliveryCharge = {
  city: string;
  charge: number;
  isActive?: boolean;
};

export type UpdateDeliveryCharge = {
  city?: string;
  charge?: number;
  isActive?: boolean;
};
