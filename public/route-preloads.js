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
      href: "https://pub-fd3f0e7f69dc410c9cdaffdf1a0a35b1.r2.dev/media-c0a7592815264a8e7e550bd2a176c8c05dfcefd1ecaac1d9fe33f3096aac918d.webp",
      fetchpriority: "high",
    });
  }
})();
