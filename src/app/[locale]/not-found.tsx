import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div style={{ padding: 24 }}>
      <h2>{t("title")}</h2>
      <p>{t("description")}</p>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <Link href="/login">{t("goLogin")}</Link>
        <Link href="/">{t("goHome")}</Link>
      </div>
    </div>
  );
}
