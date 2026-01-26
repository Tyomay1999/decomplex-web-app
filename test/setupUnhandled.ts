import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./msw/server";

process.on("unhandledRejection", (reason) => {
  throw reason instanceof Error ? reason : new Error(String(reason));
});

process.on("uncaughtException", (err) => {
  throw err;
});

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
