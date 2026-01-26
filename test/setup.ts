import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./msw/server";

process.env.NEXT_PUBLIC_API_BASE_URL ??= "http://localhost:9999";
process.env.NEXT_PUBLIC_BASE_PATH ??= "";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
export {};
