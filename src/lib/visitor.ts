import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function getVisitorId() {
  const store = await cookies();
  let visitorId = store.get("visitorId")?.value;

  if (!visitorId) {
    visitorId = randomUUID();
    store.set("visitorId", visitorId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      path: "/",
    });
  }

  return visitorId;
}
