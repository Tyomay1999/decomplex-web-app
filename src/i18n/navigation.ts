import { createNavigation } from "next-intl/navigation";
import { locales } from "./config";

export const { Link, useRouter, usePathname, redirect, getPathname } = createNavigation({
  locales,
});
