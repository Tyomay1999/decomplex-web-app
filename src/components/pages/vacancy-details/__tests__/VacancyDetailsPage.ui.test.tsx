import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { VacancyDetailsPage } from "../VacancyDetailsPage";

type LocaleParams = { locale?: unknown };

type Router = {
  back: MockedFunction<() => void>;
};

type TFn = (key: string, values?: Record<string, unknown>) => string;

type VacancyEntityDto = {
  id: string;
  title: string;
  location?: string | null;
  jobType?: string | null;
  status?: string | null;
  hasApplied?: boolean | null;
};

type UseGetByIdResult = {
  data?: VacancyEntityDto;
  isLoading: boolean;
  isError: boolean;
};

type ApplyHook = {
  applyTitle?: string;
  openApply: MockedFunction<() => boolean>;
};

type ShellProps = { children: React.ReactNode };

type HeaderProps = {
  title: string;
  meta: string;
  onBack: () => void;
  backLabel: string;
};

type BodyProps = {
  descriptionLabel: string;
  detailsLabel: string;
  vacancy: VacancyEntityDto;
};

type FooterProps = {
  onClose: () => void;
  closeLabel: string;
  applyLabel: string;
  applyDisabled: boolean;
  applyTitle?: string;
  onApply: () => void;
};

type ErrorProps = {
  onBack: () => void;
  onRetry: () => void;
};

type ApplyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vacancyId: string;
  vacancyTitle: string;
};

type UseGetVacancyByIdQuery = (id: string) => UseGetByIdResult;

type VacancyApplyParams = {
  vacancyId: string;
  locale: string;
};

type UseVacancyApply = (p: VacancyApplyParams) => ApplyHook;
type UseBodyScrollLock = (locked: boolean) => void;

type ReloadFn = () => void;

const h = vi.hoisted(() => {
  const router: Router = { back: vi.fn() as MockedFunction<() => void> };

  const params: LocaleParams = { locale: "en" };

  const t: TFn = (key) => {
    if (key === "unknownLocation") return "Unknown location";
    if (key === "back") return "Back";
    if (key === "close") return "Close";
    if (key === "apply") return "Apply";
    if (key === "description") return "Description";
    if (key === "details") return "Details";
    return key;
  };

  const getVacancy: { current: UseGetByIdResult } = {
    current: { data: undefined, isLoading: false, isError: false },
  };

  const useGetVacancyByIdQuery: MockedFunction<UseGetVacancyByIdQuery> = vi.fn((id: string) => {
    void id;
    return getVacancy.current;
  });

  const applyHook: ApplyHook = {
    applyTitle: undefined,
    openApply: vi.fn() as MockedFunction<() => boolean>,
  };

  const useVacancyApply: MockedFunction<UseVacancyApply> = vi.fn((p: VacancyApplyParams) => {
    void p;
    return applyHook;
  });

  const useBodyScrollLock: MockedFunction<UseBodyScrollLock> = vi.fn((locked: boolean) => {
    void locked;
  });

  const captured: {
    header: HeaderProps | null;
    footer: FooterProps | null;
    modal: ApplyModalProps | null;
  } = { header: null, footer: null, modal: null };

  return {
    router,
    params,
    t,
    getVacancy,
    useGetVacancyByIdQuery,
    applyHook,
    useVacancyApply,
    useBodyScrollLock,
    captured,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => h.router,
  useParams: <T,>() => h.params as T,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => h.t,
}));

vi.mock("@/features/vacancies", () => ({
  useGetVacancyByIdQuery: (id: string) => h.useGetVacancyByIdQuery(id),
}));

vi.mock("../hooks", () => ({
  useBodyScrollLock: (locked: boolean) => h.useBodyScrollLock(locked),
  useVacancyApply: (p: VacancyApplyParams) => h.useVacancyApply(p),
}));

vi.mock("@/features/applications/ui/ApplyModal", () => ({
  ApplyModal: (props: ApplyModalProps) => {
    h.captured.modal = props;
    return (
      <div data-testid="apply-modal">
        <div data-testid="apply-modal-open">{String(props.isOpen)}</div>
        <button type="button" onClick={() => props.onClose()}>
          modal-close
        </button>
      </div>
    );
  },
}));

vi.mock("../ui/VacancyDetailsSkeleton", () => ({
  VacancyDetailsSkeleton: () => <div data-testid="skeleton">skeleton</div>,
}));

vi.mock("../ui/VacancyDetailsError", () => ({
  VacancyDetailsError: (props: ErrorProps) => (
    <div data-testid="error">
      <button type="button" onClick={() => props.onBack()}>
        error-back
      </button>
      <button type="button" onClick={() => props.onRetry()}>
        error-retry
      </button>
    </div>
  ),
}));

vi.mock("../ui", () => ({
  VacancyDetailsShell: (props: ShellProps) => <div data-testid="shell">{props.children}</div>,
  VacancyDetailsHeader: (props: HeaderProps) => {
    h.captured.header = props;
    return (
      <div data-testid="header">
        <div data-testid="header-title">{props.title}</div>
        <div data-testid="header-meta">{props.meta}</div>
        <button type="button" onClick={() => props.onBack()}>
          header-back
        </button>
      </div>
    );
  },
  VacancyDetailsBody: (props: BodyProps) => (
    <div data-testid="body">
      <div data-testid="body-description-label">{props.descriptionLabel}</div>
      <div data-testid="body-details-label">{props.detailsLabel}</div>
      <div data-testid="body-vacancy-id">{props.vacancy.id}</div>
    </div>
  ),
  VacancyDetailsFooter: (props: FooterProps) => {
    h.captured.footer = props;
    return (
      <div data-testid="footer">
        <div data-testid="footer-apply-disabled">{String(props.applyDisabled)}</div>
        <div data-testid="footer-apply-title">{props.applyTitle ?? ""}</div>
        <button type="button" onClick={() => props.onApply()}>
          footer-apply
        </button>
        <button type="button" onClick={() => props.onClose()}>
          footer-close
        </button>
      </div>
    );
  },
}));

describe("VacancyDetailsPage", () => {
  beforeEach(() => {
    h.router.back.mockClear();
    h.applyHook.openApply.mockClear();

    h.params.locale = "en";
    h.getVacancy.current = { data: undefined, isLoading: false, isError: false };

    h.applyHook.applyTitle = undefined;
    h.applyHook.openApply.mockImplementation(() => true);

    h.captured.header = null;
    h.captured.footer = null;
    h.captured.modal = null;

    const reload: MockedFunction<ReloadFn> = vi.fn() as MockedFunction<ReloadFn>;
    Object.defineProperty(window, "location", {
      value: { reload },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders skeleton when loading", () => {
    h.getVacancy.current = { data: undefined, isLoading: true, isError: false };

    render(<VacancyDetailsPage id="v1" />);

    expect(screen.getByTestId("skeleton").textContent).toBe("skeleton");
  });

  it("renders error when query fails or vacancy is missing", () => {
    h.getVacancy.current = { data: undefined, isLoading: false, isError: true };

    render(<VacancyDetailsPage id="v1" />);

    expect(screen.getByTestId("error")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "error-back" }));
    expect(h.router.back).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "error-retry" }));
    const loc = window.location as unknown as { reload: ReloadFn };
    expect(loc.reload).toBeDefined();
    expect(typeof loc.reload).toBe("function");
  });

  it("computes meta with unknown location fallback and passes props to header/footer", () => {
    const v: VacancyEntityDto = {
      id: "v1",
      title: "Frontend",
      location: null,
      jobType: "Full-time",
      status: "active",
      hasApplied: false,
    };

    h.getVacancy.current = { data: v, isLoading: false, isError: false };
    h.applyHook.applyTitle = "Only candidates can apply";

    render(<VacancyDetailsPage id="v1" />);

    expect(screen.getByTestId("header-title").textContent).toBe("Frontend");
    expect(screen.getByTestId("header-meta").textContent).toBe(
      "Unknown location • Full-time • active",
    );

    expect(screen.getByTestId("footer-apply-disabled").textContent).toBe("false");
    expect(screen.getByTestId("footer-apply-title").textContent).toBe("Only candidates can apply");

    const modalOpen = screen.getByTestId("apply-modal-open").textContent;
    expect(modalOpen).toBe("false");
  });

  it("opens modal when footer apply is clicked and openApply returns true", () => {
    const v: VacancyEntityDto = {
      id: "v1",
      title: "Frontend",
      location: "Yerevan",
      jobType: "Contract",
      status: "active",
      hasApplied: false,
    };

    h.getVacancy.current = { data: v, isLoading: false, isError: false };
    h.applyHook.openApply.mockImplementation(() => true);

    render(<VacancyDetailsPage id="v1" />);

    fireEvent.click(screen.getByRole("button", { name: "footer-apply" }));

    expect(h.applyHook.openApply).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("apply-modal-open").textContent).toBe("true");
  });

  it("does not open modal when openApply returns false", () => {
    const v: VacancyEntityDto = {
      id: "v1",
      title: "Frontend",
      location: "Yerevan",
      jobType: "Contract",
      status: "active",
      hasApplied: false,
    };

    h.getVacancy.current = { data: v, isLoading: false, isError: false };
    h.applyHook.openApply.mockImplementation(() => false);

    render(<VacancyDetailsPage id="v1" />);

    fireEvent.click(screen.getByRole("button", { name: "footer-apply" }));

    expect(h.applyHook.openApply).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("apply-modal-open").textContent).toBe("false");
  });

  it("disables apply in footer when vacancy hasApplied is true", () => {
    const v: VacancyEntityDto = {
      id: "v1",
      title: "Frontend",
      location: "Yerevan",
      jobType: "Contract",
      status: "active",
      hasApplied: true,
    };

    h.getVacancy.current = { data: v, isLoading: false, isError: false };

    render(<VacancyDetailsPage id="v1" />);

    expect(screen.getByTestId("footer-apply-disabled").textContent).toBe("true");
  });

  it("calls router.back when header back is clicked", () => {
    const v: VacancyEntityDto = {
      id: "v1",
      title: "Frontend",
      location: "Yerevan",
      jobType: "Contract",
      status: "active",
      hasApplied: false,
    };

    h.getVacancy.current = { data: v, isLoading: false, isError: false };

    render(<VacancyDetailsPage id="v1" />);

    fireEvent.click(screen.getByRole("button", { name: "header-back" }));
    expect(h.router.back).toHaveBeenCalledTimes(1);
  });

  it("falls back to en locale when params locale is not a string", () => {
    const broken: LocaleParams = { locale: 123 };
    h.params = broken;

    const v: VacancyEntityDto = {
      id: "v1",
      title: "Frontend",
      location: "Yerevan",
      jobType: "Contract",
      status: "active",
      hasApplied: false,
    };

    h.getVacancy.current = { data: v, isLoading: false, isError: false };

    render(<VacancyDetailsPage id="v1" />);

    expect(h.useVacancyApply).toHaveBeenCalledWith({ vacancyId: "v1", locale: "en" });
  });
});
