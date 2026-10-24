import { getPageCopySync } from "../../../hooks/usePageCopy.js";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const formatted = date.toLocaleDateString("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [day, month, year] = formatted.split(" ");
  if (!day || !month || !year) return formatted;
  return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const toUiEvent = (item) => {
  const startAt = item?.startAt || "";
  const endAt = item?.endAt || "";
  const date = formatDate(startAt);
  const startTime = formatTime(startAt);
  const endTime = formatTime(endAt);
  const siteCopy = getPageCopySync("site");
  const readMoreLabel = siteCopy ? siteCopy("ui.read-more") : "";

  const mappedImages = (Array.isArray(item?.images) ? item.images : []).map(
    (image) => ({
      ...image,
      src: image.src || image.url || "",
    }),
  );

  let links = Array.isArray(item?.links) ? [...item.links] : [];

  // The category decides which hub an event links to; its title never does.
  const category = item?.category || "ovrigt";
  const hubPath = { yoga: "/kurser/yoga", konst: "/kurser/konst" }[category];
  if (hubPath && (links.length === 0 || links[0]?.href?.startsWith("mailto:"))) {
    links = [{ href: hubPath, label: readMoreLabel }];
  }

  return {
    id: item?.id || "",
    title: item?.title || "",
    category,
    startAt,
    endAt,
    dropIn: Boolean(item?.dropIn),
    price: item?.price,
    durationMinutes: item?.durationMinutes,
    spots: item?.spots || "",
    date,
    time: startTime && endTime ? `${startTime} - ${endTime}` : "",
    description: item?.description || "",
    moments: Array.isArray(item?.moments) ? item.moments : [],
    artists: item?.artists || "",
    location: item?.location || "",
    links,
    image: mappedImages.length > 0 ? mappedImages[0] : null,
    images: mappedImages,
  };
};
