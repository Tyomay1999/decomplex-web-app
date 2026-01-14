"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";

import { ToastHost } from "@/components/shared/toast";
import { SessionBootstrap } from "@/features/auth/SessionBootstrap";
import { store } from "@/store/store";

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return (
    <Provider store={store}>
      <SessionBootstrap />
      <ToastHost />
      {children}
    </Provider>
  );
}
