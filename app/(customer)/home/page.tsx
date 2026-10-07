import { CustomerHome } from "@/components/dashboard/customer-home";
import { greeting } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Home" };

// The layout has already checked the user is a logged-in customer; here we only need the name for the greeting.
export default async function CustomerHomePage() {
  const user = await getCurrentUser();
  const firstName = user?.name.split(/\s+/)[0] ?? "there";
  return <CustomerHome name={firstName} greeting={greeting()} />;
}
