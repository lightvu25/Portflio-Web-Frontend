import { describe, expect, it } from "vitest";
import {
  ADMIN_BASE_PATH,
  ADMIN_LOGIN_PATH,
  isAdminRoute,
} from "./routes";

describe("admin routes helper", () => {
  it("points to /bcc-10d09m25y and /bcc-10d09m25y/login", () => {
    expect(ADMIN_BASE_PATH).toBe("/bcc-10d09m25y");
    expect(ADMIN_LOGIN_PATH).toBe("/bcc-10d09m25y/login");
  });

  it("matches exact admin root and sub-routes while rejecting /admin and public paths", () => {
    expect(isAdminRoute("/bcc-10d09m25y")).toBe(true);
    expect(isAdminRoute("/bcc-10d09m25y/login")).toBe(true);
    expect(isAdminRoute("/bcc-10d09m25y/photos")).toBe(true);
    expect(isAdminRoute("/admin")).toBe(false);
    expect(isAdminRoute("/admin/login")).toBe(false);
    expect(isAdminRoute("/bcc-10d09m25y-extra")).toBe(false);
    expect(isAdminRoute("/gallery")).toBe(false);
    expect(isAdminRoute(null)).toBe(false);
  });
});
