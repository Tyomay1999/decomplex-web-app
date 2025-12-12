import Link from "next/link";

export default async function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404</h2>
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <Link href="./login">goLogin</Link>
        <Link href="./">goHome</Link>
      </div>
    </div>
  );
}
