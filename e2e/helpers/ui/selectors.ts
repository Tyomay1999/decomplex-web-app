export const sel = {
  burger: '[data-testid="header-burger"]',
  mobileMenu: '[data-testid="mobile-menu"]',
  userMenuTrigger: '[data-testid="user-menu-trigger"]',
  userMenuPanel: '[data-testid="user-menu-panel"]',
  themeToggle: "[data-theme-toggle]",
  confirmModal: '[data-testid="modal"][role="dialog"][aria-modal="true"]',
  confirmOverlay: '[data-testid="modal-overlay"]',
  confirmClose: '[data-testid="modal-close"]',
} as const;
