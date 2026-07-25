import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminOverviewQueue from "./AdminOverviewQueue";

describe("AdminOverviewQueue", () => {
  it("opens the selected operational order queue", () => {
    const onOpen = vi.fn();
    render(
      <AdminOverviewQueue
        counts={{ all: 8, new: 3, ship: 2, pickup_ready: 1 }}
        onOpen={onOpen}
      />
    );

    expect(screen.getByText("8 ordrar totalt")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Att skicka/i }));
    expect(onOpen).toHaveBeenCalledWith("ship");
  });
});
