import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import React, { createRef, useContext } from "react";
import {
  CartContext,
  CartProvider,
} from "./components/layout/CartContext/CartContext";
import ScrollCue from "./features/events/ParallaxHero/components/ScrollCue";
import HomeHeroContent from "./features/home/Hero/HomeHeroContent";
import HomeHeroLogo from "./features/home/Hero/HomeHeroLogo";
import InfoCallout from "./features/home/UpcomingEvents/components/InfoCallout";
import ActionButtons from "./features/team/ProfileShowcase/components/ActionButtons";
import ContactList from "./features/team/ProfileShowcase/components/ContactList";

vi.mock("./features/home/Hero/HomeHeroCarousel", () => ({
  default: () => null,
}));

describe("React 19 compatibility", () => {
  it("runs on React 19.2", () => {
    expect(React.version).toMatch(/^19\.2\./);
  });

  it("preserves optional prop fallbacks without function defaultProps", () => {
    const contentRef = createRef();
    const logoRef = createRef();
    const { container } = render(
      <>
        <ScrollCue />
        <HomeHeroContent ref={contentRef} />
        <HomeHeroLogo ref={logoRef} imageSrc="/logo.svg" alt="Storegården 7" />
        <InfoCallout />
        <ActionButtons />
        <ContactList />
      </>
    );

    expect(screen.getByRole("button", { name: "Scrolla ner" })).toBeEnabled();
    expect(
      screen.getByRole("complementary", {
        name: "Information om evenemang",
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(container.querySelector(".profile-actions")).not.toBeInTheDocument();
    expect(container.querySelector(".profile-contact")).not.toBeInTheDocument();
    expect(contentRef.current).toHaveClass("hero-content");
    expect(logoRef.current).toHaveClass("hero-logo");
  });

  it("provides cart context", () => {
    function CartProbe() {
      const cart = useContext(CartContext);
      return <span>{cart.itemCount ?? cart.getItemCount()}</span>;
    }

    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("V33 keeps dev startup and providers safe across React upgrades", () => {
    const providerFiles = [
      [
        "CartContext.Provider",
        resolve("src/components/layout/CartContext/CartContext.jsx"),
      ],
      [
        "ProductContext.Provider",
        resolve("src/components/layout/ProductContext/ProductContext.jsx"),
      ],
      ["ToastContext.Provider", resolve("src/contexts/ToastContext.jsx")],
    ];

    providerFiles.forEach(([provider, file]) => {
      expect(readFileSync(file, "utf8")).toContain(`<${provider}`);
    });

    const viteConfig = readFileSync(resolve("vite.config.js"), "utf8");

    expect(viteConfig).toMatch(/optimizeDeps:\s*\{\s*force:\s*true/);
  });
});
