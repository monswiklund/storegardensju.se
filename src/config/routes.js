export const appRoutes = [
  { path: "/", label: "Hem" },
  {
    path: "/event",
    label: "Event",
    children: [
      { path: "/mohippa", label: "Möhippa" },
      { path: "/konst", label: "Konst" },
    ],
  },
  { path: "/galleri", label: "Galleri" },
  { path: "/butik", label: "Butik" },
  { path: "/om-oss", label: "Om Oss" },
];
