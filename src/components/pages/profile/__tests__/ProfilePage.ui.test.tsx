import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";

import { ProfilePage } from "../ProfilePage";

type MeUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: string;
  createdAt?: string;
};

type MeResponse = {
  user: MeUser;
};

type UseMeQueryResult = {
  data?: MeResponse;
};

type AuthState = {
  user: unknown;
};

type ApplicationEntityDto = {
  id: string;
};

type MyAppsInfinite = {
  items: ApplicationEntityDto[];
  isInitialLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reload: () => void;
  isFetching: boolean;
};

type TFn = (key: string, values?: Record<string, unknown>) => string;

type ProfileInfoCardProps = {
  avatarText: string;
  fullName: string;
  email: string;
  accountTypeLabel: string;
  memberSinceLabel: string;
  labels: {
    accountType: string;
    email: string;
    memberSince: string;
    accountInfoTitle: string;
  };
};

type ProfileApplicationsCardProps = {
  title: string;
  emptyText: string;
  applications: ApplicationEntityDto[];
  isLoading: boolean;
  isError: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  labels: Record<string, string>;
  statusLabels: Record<string, string>;
  appliedLabel: (dateStr: string) => string;
};

type RootState = { auth: AuthState };

const h = vi.hoisted(() => {
  const t: TFn = (key, values) => {
    if (key === "fallbackName") return "Fallback Name";
    if (key === "valueUnknown") return "Unknown";
    if (key === "memberSinceUnknown") return "Member since: unknown";
    if (key === "memberSinceValue") return `Member since: ${String(values?.date ?? "")}`;
    if (key === "avatarCompany") return "Company";
    if (key === "avatarCandidate") return "Candidate";
    if (key === "accountTypeCandidate") return "Candidate account";
    if (key === "accountTypeCompany") return "Company account";
    if (key === "accountTypeLabel") return "Account type";
    if (key === "emailLabel") return "Email";
    if (key === "memberSinceLabel") return "Member since";
    if (key === "accountInfoTitle") return "Account info";
    if (key === "applicationsTitle") return "Applications";
    if (key === "applicationsEmpty") return "No applications";
    if (key === "applicationsSearchPlaceholder") return "Search";
    if (key === "loadMore") return "Load more";
    if (key === "loading") return "Loading";
    if (key === "retry") return "Retry";
    if (key === "filterAll") return "All";
    if (key === "filterReset") return "Reset";
    if (key === "filterLocation") return "Location";
    if (key === "filterJobType") return "Job type";
    if (key === "loadErrorTitle") return "Load error";
    if (key === "loadErrorBody") return "Please try again";
    if (key === "statusApplied") return "Applied";
    if (key === "statusPending") return "Pending";
    if (key === "statusReviewing") return "Reviewing";
    if (key === "statusApproved") return "Approved";
    if (key === "statusRejected") return "Rejected";
    if (key === "statusAccepted") return "Accepted";
    if (key === "statusCanceled") return "Canceled";
    if (key === "statusWithdrawn") return "Withdrawn";
    if (key === "statusUnknown") return "Unknown";
    if (key === "appliedOn") return `Applied on: ${String(values?.date ?? "")}`;
    return key;
  };

  const useMeQuery: MockedFunction<() => UseMeQueryResult> = vi.fn(() => ({ data: undefined }));

  const auth: AuthState = { user: undefined };

  const useAppSelector: MockedFunction<(selector: (s: RootState) => unknown) => unknown> = vi.fn(
    (selector: (s: RootState) => unknown) => selector({ auth }),
  );

  const loadMore: MockedFunction<() => void> = vi.fn();
  const reload: MockedFunction<() => void> = vi.fn();

  const appsHook: MyAppsInfinite = {
    items: [],
    isInitialLoading: false,
    isError: false,
    hasMore: false,
    loadMore,
    reload,
    isFetching: false,
  };

  const useMyApplicationsInfinite: MockedFunction<() => MyAppsInfinite> = vi.fn(() => appsHook);

  const infoProps: { current: ProfileInfoCardProps | null } = { current: null };
  const appsProps: { current: ProfileApplicationsCardProps | null } = { current: null };

  return {
    t,
    useMeQuery,
    auth,
    useAppSelector,
    appsHook,
    useMyApplicationsInfinite,
    infoProps,
    appsProps,
  };
});

vi.mock("next-intl", () => ({
  useTranslations: () => h.t,
}));

vi.mock("@/features/auth/authApi", () => ({
  useMeQuery: () => h.useMeQuery(),
}));

vi.mock("@/store/hooks", () => ({
  useAppSelector: (selector: (s: RootState) => unknown) => h.useAppSelector(selector),
}));

vi.mock("@/features/applications/hooks/useMyApplicationsInfinite", () => ({
  useMyApplicationsInfinite: () => h.useMyApplicationsInfinite(),
}));

vi.mock("../ui", () => ({
  ProfileInfoCard: (props: ProfileInfoCardProps) => {
    h.infoProps.current = props;
    return (
      <div>
        <div data-testid="avatarText">{props.avatarText}</div>
        <div data-testid="fullName">{props.fullName}</div>
        <div data-testid="email">{props.email}</div>
        <div data-testid="accountTypeLabel">{props.accountTypeLabel}</div>
        <div data-testid="memberSinceLabel">{props.memberSinceLabel}</div>
      </div>
    );
  },
  ProfileApplicationsCard: (props: ProfileApplicationsCardProps) => {
    h.appsProps.current = props;
    return (
      <div>
        <div data-testid="appsTitle">{props.title}</div>
        <div data-testid="appsEmpty">{props.emptyText}</div>
      </div>
    );
  },
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    h.useMeQuery.mockImplementation(() => ({ data: undefined }));
    h.auth.user = undefined;

    h.appsHook.items = [];
    h.appsHook.isInitialLoading = false;
    h.appsHook.isError = false;
    h.appsHook.hasMore = false;
    h.appsHook.isFetching = false;

    h.infoProps.current = null;
    h.appsProps.current = null;

    vi.spyOn(Date.prototype, "toLocaleDateString").mockImplementation(() => "January 2026");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("renders candidate profile with unknown memberSince when no dates are present", () => {
    h.useMeQuery.mockImplementation(() => ({
      data: { user: { firstName: "John", lastName: "Smith", email: "a@a.com" } },
    }));
    h.auth.user = {};

    render(<ProfilePage />);

    expect(screen.getByTestId("avatarText").textContent).toBe("Candidate");
    expect(screen.getByTestId("fullName").textContent).toBe("John Smith");
    expect(screen.getByTestId("email").textContent).toBe("a@a.com");
    expect(screen.getByTestId("accountTypeLabel").textContent).toBe("Candidate account");
    expect(screen.getByTestId("memberSinceLabel").textContent).toBe("Member since: unknown");
  });

  it("renders company profile and formats memberSince from createdAt", () => {
    h.useMeQuery.mockImplementation(() => ({
      data: {
        user: {
          firstName: "Acme",
          lastName: "Inc",
          email: "hr@acme.com",
          userType: "company",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      },
    }));

    render(<ProfilePage />);

    expect(screen.getByTestId("avatarText").textContent).toBe("Company");
    expect(screen.getByTestId("accountTypeLabel").textContent).toBe("Company account");
    expect(screen.getByTestId("memberSinceLabel").textContent).toBe("Member since: January 2026");
  });

  it("uses fallback email label when email is empty", () => {
    h.useMeQuery.mockImplementation(() => ({
      data: { user: { firstName: "John", lastName: "Smith", email: "   " } },
    }));

    render(<ProfilePage />);

    expect(screen.getByTestId("email").textContent).toBe("Unknown");
  });

  it("passes applications hook output into ProfileApplicationsCard", () => {
    h.appsHook.items = [{ id: "app1" }];
    h.appsHook.isFetching = true;

    render(<ProfilePage />);

    const props = h.appsProps.current;
    expect(props).not.toBeNull();
    expect(props?.applications).toHaveLength(1);
    expect(props?.isLoading).toBe(false);
    expect(props?.isFetchingMore).toBe(true);
  });
});
