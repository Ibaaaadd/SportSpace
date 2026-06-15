export type VenueItem = {
  id: string;
  name: string;
  sportTypeId: string;
  sportTypeName: string;
  capacity: number;
  location: string;
  description: string;
  imageUrl: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export type FormData = {
  name: string;
  sportTypeId: string;
  capacity: string;
  location: string;
  description: string;
  imageUrl: string | null;
  active: boolean;
};

export type FormErrors = Partial<Record<keyof FormData, string>>;

export const EMPTY_FORM: FormData = {
  name: "",
  sportTypeId: "",
  capacity: "",
  location: "",
  description: "",
  imageUrl: null,
  active: true,
};

export function normalizeVenue(item: {
  id: string;
  name: string;
  sportTypeId: string;
  capacity: number;
  location: string;
  description?: string | null;
  imageUrl?: string | null;
  status?: string;
  sportType?: {
    name: string;
  };
}): VenueItem {
  return {
    id: item.id,
    name: item.name,
    sportTypeId: item.sportTypeId,
    sportTypeName: item.sportType?.name ?? "",
    capacity: item.capacity,
    location: item.location,
    description: item.description ?? "",
    imageUrl: item.imageUrl ?? null,
    status: (item.status ?? "ACTIVE") as "ACTIVE" | "INACTIVE",
  };
}
