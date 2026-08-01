import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import TerminalReplay from "./TerminalReplay";
import type { TerminalLine } from "./TerminalReplay";

function mockMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

const sampleLines: TerminalLine[] = [
  { type: "prompt", text: "$ laurel-proxy start" },
  { type: "output", text: "Proxy listening on :9229" },
  { type: "comment", text: "# Filter by status" },
  { type: "highlight", text: "POST /api/users 422 34ms" },
];

describe("TerminalReplay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the terminal frame with colored dots", () => {
    const { container } = render(<TerminalReplay lines={sampleLines} />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots.length).toBe(3);
  });

  it("renders empty terminal with empty lines array", () => {
    const { container } = render(<TerminalReplay lines={[]} />);
    // The frame still renders. Note `.font-mono` alone also matches the header
    // "Terminal" label, so scope to the content div that holds the replay lines.
    const content = container.querySelector("div.font-mono");
    expect(content).toBeTruthy();
    // ...but runAnimation bails early on an empty array, so no lines are appended.
    expect(content?.childNodes.length).toBe(0);
  });

  it("types prompt lines character by character", async () => {
    const lines: TerminalLine[] = [{ type: "prompt", text: "$ hello" }];
    const { container } = render(
      <TerminalReplay lines={lines} speed={10} delay={50} />
    );

    // Advance through typing animation
    for (let i = 0; i < 20; i++) {
      await act(async () => {
        vi.advanceTimersByTime(15);
      });
    }

    expect(container.textContent).toContain("hello");
  });

  it("shows output lines instantly", async () => {
    const lines: TerminalLine[] = [
      { type: "output", text: "Hello World" },
    ];
    const { container } = render(
      <TerminalReplay lines={lines} speed={30} delay={50} />
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(container.textContent).toContain("Hello World");
  });

  it("respects prefers-reduced-motion", async () => {
    mockMatchMedia(true);

    const { container } = render(<TerminalReplay lines={sampleLines} />);

    // Give the useEffect a tick to run
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(container.textContent).toContain("laurel-proxy start");
    expect(container.textContent).toContain("Proxy listening on :9229");
    expect(container.textContent).toContain("# Filter by status");
    expect(container.textContent).toContain("POST /api/users 422 34ms");
  });
});
