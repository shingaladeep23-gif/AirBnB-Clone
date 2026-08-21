import { ListingPage } from "@/components/listing/ListingPage";
import { listing } from "@/lib/listing";

/**
 * Route entry. Renders on the server — all listing content is static, so there is
 * no loading state to clone.
 */
export default function Home() {
  return <ListingPage listing={listing} />;
}
