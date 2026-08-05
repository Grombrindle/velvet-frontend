import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Root / -> /en/woman directly (the user's requested default landing page).
  // No API call here, so the root never depends on the backend being up.
  redirect("/en/woman");
}
