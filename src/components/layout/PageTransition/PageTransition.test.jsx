import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { describe, expect, it } from "vitest";
import PageTransition from "./PageTransition.jsx";

function NavigationHarness() {
  const navigate = useNavigate();

  return (
    <>
      <button type="button" onClick={() => navigate("/next")}>
        Next
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
      <PageTransition>
        <div>Page content</div>
      </PageTransition>
    </>
  );
}

describe("PageTransition", () => {
  it("animates new navigation but not initial or history navigation", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <NavigationHarness />
      </MemoryRouter>,
    );

    expect(container.querySelector(".page-transition")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(container.querySelector(".page-transition")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(container.querySelector(".page-transition")).not.toBeInTheDocument();
  });
});
