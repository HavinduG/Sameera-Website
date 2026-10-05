import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { HOME_TAG } from "@/lib/wordpress";

// Called by WordPress (acf/save_post hook) so edits appear immediately.
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided =
    request.headers.get("x-revalidate-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return Response.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag(HOME_TAG, { expire: 0 });
  return Response.json({ revalidated: true, now: Date.now() });
}
