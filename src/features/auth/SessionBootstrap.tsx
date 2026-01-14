"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStatus } from "@/features/auth/authSlice";
import { useMeQuery } from "@/features/auth/authApi";

export function SessionBootstrap() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  const shouldRun = status === "idle" || status === "checking";

  const me = useMeQuery(undefined, {
    skip: !shouldRun,
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });

  useEffect(() => {
    if (status === "idle") dispatch(setStatus("checking"));
  }, [dispatch, status]);

  useEffect(() => {
    if (status !== "checking") return;

    if (me.isSuccess) return;

    if (me.isError) {
      dispatch(setStatus("anonymous"));
    }
  }, [dispatch, me.isError, me.isSuccess, status]);

  return null;
}
