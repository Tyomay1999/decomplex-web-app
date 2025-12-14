import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { AppProviders } from "../providers";
import {locales} from "../../i18n/config";
import type {Locale} from "../../i18n/config";

export function generateStaticParams(): Array<{ locale: string }> {
    return locales.map((locale) => ({ locale }));
}

type Props = {
    children: ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    if (!locales.includes(locale as Locale)) notFound();

    const messages = (await import(`../../../messages/${locale}.json`)).default;

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
    );
}
