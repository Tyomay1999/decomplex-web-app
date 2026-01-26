import { describe, expect, it, vi } from "vitest";
import type { MockedFunction } from "vitest";

type CookieBag = {
  get: (name: string) => { value: string } | undefined;
};

type NextUrlLike = {
  pathname: string;
  clone: () => URL;
};

type NextRequestLike = {
  nextUrl: NextUrlLike;
  cookies: CookieBag;
};

type CookiesOut = {
  set: (name: string, value: string, opts: Record<string, unknown>) => void;
};

type ResponseLike = {
  cookies: CookiesOut;
  type: "next" | "redirect";
  url?: URL;
};

type CookieSet = (name: string, value: string, opts: Record<string, unknown>) => void;

const cookieSetSpy: MockedFunction<CookieSet> = vi.fn();

vi.mock("next/server", () => {
  class NextResponse {
    static next(): ResponseLike {
      return { type: "next", cookies: { set: cookieSetSpy } };
    }

    static redirect(url: URL): ResponseLike {
      return { type: "redirect", url, cookies: { set: cookieSetSpy } };
    }
  }

  return { NextResponse };
});

vi.mock("next-intl/middleware", () => {
  const createIntlMiddleware = () => {
    return (_req: unknown): ResponseLike => {
      return { type: "next", cookies: { set: cookieSetSpy } };
    };
  };

  return { default: createIntlMiddleware };
});

function makeReq(pathname: string, cookieLocale?: string): NextRequestLike {
  const url = new URL(`http://localhost${pathname}`);

  const cookies: CookieBag = {
    get: (name: string) => {
      if (!cookieLocale) return undefined;
      if (name !== "NEXT_LOCALE" && name !== "dc_locale") return undefined;
      return { value: cookieLocale };
    },
  };

  const nextUrl: NextUrlLike = {
    pathname,
    clone: () => new URL(url.toString()),
  };

  return { nextUrl, cookies };
}

describe("middleware locale routing", () => {
  it("redirects to cookie locale when locale segment is missing", async () => {
    cookieSetSpy.mockClear();

    const mod = await import("../src/middleware");
    const req = makeReq("/profile", "hy");

    const res = mod.middleware(req as never) as unknown as ResponseLike;

    expect(res.type).toBe("redirect");
    expect(res.url?.pathname).toBe("/hy/profile");
  });

  it("redirects to default locale when locale segment is missing and cookie is invalid", async () => {
    cookieSetSpy.mockClear();

    const mod = await import("../src/middleware");
    const req = makeReq("/vacancies", "xx");

    const res = mod.middleware(req as never) as unknown as ResponseLike;

    expect(res.type).toBe("redirect");
    expect(res.url?.pathname).toBe("/en/vacancies");
  });

  it("passes through and sets dc_locale cookie when locale segment exists", async () => {
    cookieSetSpy.mockClear();

    const mod = await import("../src/middleware");
    const req = makeReq("/ru/profile");

    const res = mod.middleware(req as never) as unknown as ResponseLike;

    expect(res.type).toBe("next");
    expect(cookieSetSpy).toHaveBeenCalledTimes(1);

    const call = cookieSetSpy.mock.calls[0];
    expect(call).toBeDefined();
    expect(call[0]).toBe("dc_locale");
    expect(call[1]).toBe("ru");
  });
});
