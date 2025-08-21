import { getGlobalTag, getIdTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export function getUserGlobalTag() {
  return getGlobalTag("users");
}

export function getUserIdTag(id: string) {
  return getIdTag("users", id);
}

export function revalidateUserCache(id: string) {
  revalidateTag(getUserGlobalTag());
  revalidateTag(getUserIdTag(id));
}
