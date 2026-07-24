(() => {
  if (window.location.pathname.startsWith("/admin")) {
    return;
  }

  const addPreload = (attributes) => {
    const link = document.createElement("link");
    Object.entries(attributes).forEach(([name, value]) => {
      link.setAttribute(name, value);
    });
    document.head.appendChild(link);
  };

  addPreload({
    rel: "preload",
    as: "font",
    type: "font/woff2",
    href: "/fonts/lato-normal-400.woff2",
    crossorigin: "",
  });
  addPreload({
    rel: "preload",
    as: "font",
    type: "font/woff2",
    href: "/fonts/playfair-display-normal-400.woff2",
    crossorigin: "",
  });

  if (window.location.pathname === "/") {
    addPreload({
      rel: "preload",
      as: "image",
      href: "/images/logoTransp_cropped.png",
      fetchpriority: "high",
    });
  }
})();
