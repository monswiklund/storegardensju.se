import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import HomeSubnav from "./HomeSubnav.jsx";

describe("HomeSubnav", () => {
  afterEach(() => document.getElementById("main-content")?.remove());

  it("links a section that mounts after the bar, without waiting for a scroll", async () => {
    const main = document.createElement("main");
    main.id = "main-content";
    main.innerHTML = '<div id="home-services"></div>';
    document.body.append(main);

    render(<HomeSubnav />);
    expect(screen.queryByRole("button", { name: /Kommande/i })).toBeNull();

    // Events arrive from the fetch later, the way HomePage mounts #home-events.
    const events = document.createElement("div");
    events.id = "home-events";
    main.append(events);

    expect(await screen.findByRole("button", { name: /Kommande/i })).toBeInTheDocument();
  });
});
