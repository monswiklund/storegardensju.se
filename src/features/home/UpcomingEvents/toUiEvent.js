import { getPageCopySync } from "../../../hooks/usePageCopy.js";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const formatted = date.toLocaleDateString("sv-SE", {
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

  const titleLower = (item?.title || "").toLowerCase();
  const categoryLower = (item?.category || "").toLowerCase();

  const isYoga = categoryLower === "yoga" || titleLower.includes("yoga");
  const isMaleri =
    categoryLower === "maleri" ||
    categoryLower === "konst" ||
    categoryLower === "keramik" ||
    titleLower.includes("måleri") ||
    titleLower.includes("keramik") ||
    titleLower.includes("konst");

  if (isYoga && (links.length === 0 || links[0]?.href?.startsWith("mailto:"))) {
    links = [
      {
        href: "/kurser/yoga",
        label: readMoreLabel,
      },
    ];
  } else if (isMaleri && (links.length === 0 || links[0]?.href?.startsWith("mailto:"))) {
    links = [
      {
        href: "/kurser/konst",
        label: readMoreLabel,
      },
    ];
  }

  return {
    id: item?.id || "",
    title: item?.title || "",
    category: item?.category || (isYoga ? "yoga" : isMaleri ? "konst" : "ovrigt"),
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
    seriesText: isYoga ? "11/8, 12/8, 13/8, 18/8, 19/8, 20/8" : null,
    links,
    image: mappedImages.length > 0 ? mappedImages[0] : null,
    images: mappedImages,
  };
};
