import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Root / -> default locale. The [locale] home page then auto-redirects to
  // the first gender (e.g. /en/woman). No API call here, so the root never
  // depends on the backend being up.
  redirect("/en");
}
