import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { HomePage } from "../HomePage";

type PushFn = (url: string) => void;

type Router = {
  push: PushFn;
};

type LocaleParams = { locale?: string };

type UiVacancy = {
  id: string;
  title: string;
  companyId: string;
  location: string;
  postedLabel: string;
};

type HomeVacanciesHook = {
  uiVacancies: UiVacancy[];
  countLabel: string;
  isFetching: boolean;
  isError: boolean;
  isInitialLoading: boolean;
  isEndReached: boolean;
  loadMore: () => void;
  reload: () => void;
  onSearchClick: () => void;
};

type HomeHeroProps = {
  query: string;
  onQueryChange: (v: string) => void;
  onSearchClick: () => void;
};

type VacanciesSectionProps = {
  title: string;
  countLabel: string;
  items: UiVacancy[];
  isInitialLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  isEndReached: boolean;
  onLoadMore: () => void;
  onVacancyClick: (id: string) => void;
};

type TFn = (key: string, values?: Record<string, unknown>) => string;

type AuthState = { accessToken: string | null };

type RootState = { auth: AuthState };

type ListParams = { status: "active"; limit: number; q?: string };

const h = vi.hoisted(() => {
  const push: MockedFunction<PushFn> = vi.fn();
  const router: Router = { push };

  const params: LocaleParams = { locale: "en" };

  const t: TFn = (key, values) => {
    if (key === "sectionTitle") return "SECTION_TITLE";
    if (key === "count") return `COUNT:${String(values?.count ?? "")}`;
    return key;
  };

  const loadMore: MockedFunction<() => void> = vi.fn();
  const reload: MockedFunction<() => void> = vi.fn();
  const onSearchClick: MockedFunction<() => void> = vi.fn();

  const homeHook: HomeVacanciesHook = {
    uiVacancies: [
      {
        id: "v1",
        title: "Frontend",
        companyId: "c1",
        location: "Yerevan",
        postedLabel: "DAYS_AGO:1",
      },
    ],
    countLabel: "COUNT:1",
    isFetching: false,
    isError: false,
    isInitialLoading: false,
    isEndReached: false,
    loadMore,
    reload,
    onSearchClick,
  };

  const getAccessTokenFromCookie: MockedFunction<() => string | null> = vi.fn(() => null);

  const authState: AuthState = { accessToken: null };

  const useAppSelector: MockedFunction<(selector: (s: RootState) => unknown) => unknown> = vi.fn(
    (selector: (s: RootState) => unknown) => selector({ auth: authState }),
  );

  const useHomeVacancies: MockedFunction<(params: ListParams) => HomeVacanciesHook> = vi.fn(
    (_params: ListParams) => homeHook,
  );

  const useDebouncedValue: MockedFunction<<T>(value: T, _delay?: number) => T> = vi.fn(
    <T,>(value: T) => value,
  );

  return {
    push,
    router,
    params,
    t,
    homeHook,
    getAccessTokenFromCookie,
    authState,
    useAppSelector,
    useHomeVacancies,
    useDebouncedValue,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => h.router,
  useParams: <T,>() => h.params as T,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => h.t,
}));

vi.mock("@/lib/authCookies", () => ({
  getAccessTokenFromCookie: () => h.getAccessTokenFromCookie(),
}));

vi.mock("@/store/hooks", () => ({
  useAppSelector: (selector: (s: RootState) => unknown) => h.useAppSelector(selector),
}));

vi.mock("../hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T, _delay?: number) => h.useDebouncedValue(value),
}));

vi.mock("../hooks/useHomeVacancies", () => ({
  useHomeVacancies: (params: ListParams) => h.useHomeVacancies(params),
}));

vi.mock("../ui/HomeHero", () => ({
  HomeHero: (props: HomeHeroProps) => (
    <div>
      <div data-testid="query">{props.query}</div>
      <button type="button" onClick={() => props.onQueryChange(" dev ")}>
        change-query
      </button>
      <button type="button" onClick={() => props.onSearchClick()}>
        search
      </button>
    </div>
  ),
}));

vi.mock("../ui/VacanciesSection", () => ({
  VacanciesSection: (props: VacanciesSectionProps) => (
    <div>
      <div data-testid="title">{props.title}</div>
      <div data-testid="count">{props.countLabel}</div>
      <button type="button" onClick={() => props.onVacancyClick(props.items[0]?.id ?? "")}>
        open-first
      </button>
    </div>
  ),
}));

describe("HomePage", () => {
  beforeEach(() => {
    h.push.mockClear();
    h.getAccessTokenFromCookie.mockClear();
    h.useHomeVacancies.mockClear();
    h.useDebouncedValue.mockClear();

    h.authState.accessToken = null;
    h.params.locale = "en";
    h.getAccessTokenFromCookie.mockImplementation(() => null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("passes base list params when debounced query is empty", () => {
    render(<HomePage />);

    expect(h.useHomeVacancies).toHaveBeenCalledTimes(1);
    expect(h.useHomeVacancies).toHaveBeenCalledWith({ status: "active", limit: 20 });
  });

  it("adds q to list params when debounced query is not empty", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "change-query" }));

    expect(h.useHomeVacancies).toHaveBeenLastCalledWith({ status: "active", limit: 20, q: "dev" });
  });

  it("redirects to login with redirect param when user is not authenticated", () => {
    h.params.locale = "hy";
    h.authState.accessToken = null;
    h.getAccessTokenFromCookie.mockImplementation(() => null);

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "open-first" }));

    expect(h.push).toHaveBeenCalledTimes(1);
    expect(h.push).toHaveBeenCalledWith("/hy/login?redirect=%2Fhy%2Fvacancies%2Fv1");
  });

  it("navigates to details when user is authenticated via store token", () => {
    h.params.locale = "en";
    h.authState.accessToken = "token";
    h.getAccessTokenFromCookie.mockImplementation(() => null);

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "open-first" }));

    expect(h.push).toHaveBeenCalledTimes(1);
    expect(h.push).toHaveBeenCalledWith("/en/vacancies/v1");
  });

  it("treats user as authenticated when cookie token exists", () => {
    h.params.locale = "en";
    h.authState.accessToken = null;
    h.getAccessTokenFromCookie.mockImplementation(() => "cookie-token");

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "open-first" }));

    expect(h.push).toHaveBeenCalledTimes(1);
    expect(h.push).toHaveBeenCalledWith("/en/vacancies/v1");
  });

  it("falls back to en when locale param is not a string", () => {
    const brokenParams: unknown = { locale: 123 };
    h.params = brokenParams as LocaleParams;

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "open-first" }));

    expect(h.push).toHaveBeenCalledTimes(1);
    expect(h.push).toHaveBeenCalledWith("/en/login?redirect=%2Fen%2Fvacancies%2Fv1");
  });
});
