export type SportTypeItem = {
  id: string;
  name: string;
  description: string;
  color: string;
  venueCount: number;
};

export type FormData = {
  name: string;
  description: string;
  color: string;
};

export type FormErrors = Partial<Record<keyof FormData, string>>;

export const EMPTY_FORM: FormData = { name: "", description: "", color: "blue" };

export function normalizeSportType(item: {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  venueCount?: number;
}): SportTypeItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    color: item.color ?? "blue",
    venueCount: item.venueCount ?? 0,
  };
}