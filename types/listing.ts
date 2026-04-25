interface Listing {
  id: string;
  listingTitle: string;
  listingDescription?: string;
  sellingPrice?: number;
  itemAge?: number;
  itemBrand?: string;
  status?: string;
  address?: { state?: string };
  listingImages?: { url: string; order: number }[];
  ListingAttribute?: { value: string; categoryAttributeId: string }[];
}