import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LiveRegion } from "./LiveRegion";

describe("LiveRegion", () => {
  it("renders visually hidden element", () => {
    const { container } = render(<LiveRegion message="Todo added" />);
    const region = container.querySelector("[role=\"status\"]");
    expect(region).toHaveClass("sr-only");
  });

  it("has aria-live=\"polite\" attribute", () => {
    const { container } = render(<LiveRegion message="Todo added" />);
    const region = container.querySelector("[role=\"status\"]");
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("displays announcement message", () => {
    const message = "Todo added: Buy milk";
    const { container } = render(<LiveRegion message={message} />);
    const region = container.querySelector("[role=\"status\"]");
    expect(region?.textContent).toBe(message);
  });

  it("has aria-atomic=\"true\" for atomic updates", () => {
    const { container } = render(<LiveRegion message="Todo added" />);
    const region = container.querySelector("[role=\"status\"]");
    expect(region).toHaveAttribute("aria-atomic", "true");
  });
});
