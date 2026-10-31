import { profiles } from "../../data/profileData.js";
import { resolveMediaUrl } from "../../services/mediaService.js";

// CMS slug, or the first name without diacritics ("Måns" -> "mans") to match profileData's keys.
export const memberSlug = (member) =>
  member.slug ||
  member.name
    ?.split(" ")[0]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() ||
  "";

/** A CMS team member as a card profile, with profileData.js filling what the CMS leaves empty. */
export const toProfile = (member) => {
  const slug = memberSlug(member);
  const fallback = profiles[slug] || {};
  return {
    key: member.id || slug,
    title: member.name || fallback.title,
    about: member.role || fallback.about,
    texts: member.bio?.trim() ? [member.bio] : fallback.texts || [],
    listItems: Array.isArray(member.skills)
      ? member.skills.map((skill) => skill.label)
      : fallback.listItems,
    imageSrc: resolveMediaUrl(member.image, "thumbnail"),
    contact: {
      email: member.email || fallback.contact?.email,
      instagram: member.instagram || fallback.contact?.instagram,
    },
    portfolioUrl: member.portfolioUrl || fallback.portfolioUrl,
    portfolio: fallback.portfolio || [],
  };
};
