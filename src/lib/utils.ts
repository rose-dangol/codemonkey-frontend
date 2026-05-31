import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Granularity } from "@/TypeDefinitions/common";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const detectGranularity = (from: string, to: string): Granularity => {
  const diff = (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
  if (diff <= 31) return "day";
  if (diff <= 365) return "month";
  return "year";
};
