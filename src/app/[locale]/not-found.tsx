import Link from "next/link";
import { defaultLocale } from "../../i18n/config";

export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404</h2>
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <Link href={`/${defaultLocale}/login`}>goLogin</Link>
        <Link href={`/${defaultLocale}`}>goHome</Link>
      </div>
    </div>
  );
}
