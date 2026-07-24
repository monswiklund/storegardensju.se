export const appRoutes = [
  { path: "/", label: "Hem" },
  {
    path: "/event",
    label: "Event",
    children: [
      { path: "/gruppdagar", label: "Gruppdagar" },
      { path: "/konst", label: "Konst" },
    ],
  },
  { path: "/kurser", label: "Kurser" },
  { path: "/galleri", label: "Galleri" },
  { path: "/butik", label: "Butik" },
  { path: "/om-oss", label: "Om Oss" },
];
