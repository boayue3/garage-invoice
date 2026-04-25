export interface Listing {
    id: string;
    listingId: number;
    title: string;
    description?: string;
    price?: number;
    year?: number;
    make?: string;
    model?: string;
    mileage?: number;
    location?: string;
    condition?: string;
    images?: string[];
    [key: string]: unknown;
  }
  