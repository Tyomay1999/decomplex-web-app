import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import type { AbstractIntlMessages } from "next-intl";
import type { Metadata } from "next";

import { AppProviders } from "../providers";
import { locales } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { HeaderContainer } from "@/components/Header";

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

function resolveLocale(v: string): Locale | null {
  for (const l of locales) {
    if (l === v) return l;
  }
  return null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isAbstractIntlMessages(v: unknown): v is AbstractIntlMessages {
  if (!isRecord(v)) return false;

  for (const value of Object.values(v)) {
    if (typeof value === "string") continue;
    if (!isAbstractIntlMessages(value)) return false;
  }

  return true;
}

async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  const mod: unknown = await import(`../../../messages/${locale}.json`);
  if (!isRecord(mod) || !("default" in mod)) {
    throw new Error(`Invalid messages module for locale: ${locale}`);
  }

  const messages: unknown = mod.default;
  if (!isAbstractIntlMessages(messages)) {
    throw new Error(`Invalid messages shape for locale: ${locale}`);
  }

  return messages;
}

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  if (!resolveLocale(locale)) return {};
  return {};
}

export default async function LocaleLayout({ children, params }: Props) {
  const payload = await params;
  const locale = resolveLocale(payload.locale);
  if (!locale) notFound();

  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppProviders>
        <HeaderContainer />
        {children}
      </AppProviders>
    </NextIntlClientProvider>
  );
}
