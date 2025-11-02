import { render, screen } from "@testing-library/react";
import { GridBackground } from ".";

describe("GridGround", () => {
  it("renders multiple instances with unique pattern IDs, and each rect references its own pattern", () => {
    render(
      <>
        <GridBackground data-testid="g1" />
        <GridBackground data-testid="g2" />
      </>,
    );

    const svg1 = screen.getByTestId("g1");
    const svg2 = screen.getByTestId("g2");

    const p1 = svg1.querySelector("pattern")!;
    const p2 = svg2.querySelector("pattern")!;
    expect(p1.id).not.toBe(p2.id);

    const r1 = svg1.querySelector("rect")!;
    const r2 = svg2.querySelector("rect")!;
    expect(r1.getAttribute("fill")).toBe(`url(#${p1.id})`);
    expect(r2.getAttribute("fill")).toBe(`url(#${p2.id})`);
  });
});
