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

  const mappedImages = (Array.isArray(item?.images) ? item.images : []).map(
    (image) => ({
      ...image,
      src: image.url || image.src || "",
    }),
  );

  return {
    title: item?.title || "",
    spots: item?.spots || "",
    date,
    time: startTime && endTime ? `${startTime} - ${endTime}` : "",
    description: item?.description || "",
    moments: Array.isArray(item?.moments) ? item.moments : [],
    artists: item?.artists || "",
    location: item?.location || "",
    links: Array.isArray(item?.links) ? item.links : [],
    image: mappedImages.length > 0 ? mappedImages[0] : null,
    images: mappedImages,
  };
};
