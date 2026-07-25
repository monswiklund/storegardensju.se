import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const adminPageDirectory = path.dirname(fileURLToPath(import.meta.url));

const collectCssFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectCssFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".css") ? [entryPath] : [];
  });

const isNeutralHex = (value) => {
  const hex = value.replace("#", "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((character) => character + character)
          .join("")
      : hex.slice(0, 6);
  return (
    normalized.slice(0, 2) === normalized.slice(2, 4) &&
    normalized.slice(2, 4) === normalized.slice(4, 6)
  );
};

const hasColoredValue = (declaration) => {
  if (
    /--admin-(?:green|red|amber|blue|primary)|--primary-color/.test(
      declaration
    )
  ) {
    return true;
  }

  const hexValues = declaration.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  if (hexValues.some((value) => !isNeutralHex(value))) return true;

  const rgbValues =
    declaration.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g) || [];
  return rgbValues.some((value) => {
    const [, red, green, blue] =
      value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/) || [];
    return red !== green || green !== blue;
  });
};

describe("admin edge policy", () => {
  it("V25 keeps borders and inset edges neutral", () => {
    const violations = collectCssFiles(adminPageDirectory).flatMap((cssPath) => {
      const css = fs.readFileSync(cssPath, "utf8");
      const declarations =
        css.match(
          /^\s*(?:border(?:-(?:top|right|bottom|left))?(?:-color)?|outline|box-shadow)\s*:[^;]+;/gm
        ) || [];

      return declarations.flatMap((declaration) => {
        const normalizedDeclaration = declaration.trim();
        if (/box-shadow/.test(normalizedDeclaration)) {
          const ring = /\b0\s+0\s+0\s+(?!0(?:px|rem|em)?\b)/.test(
            normalizedDeclaration
          );
          const insetEdge =
            normalizedDeclaration.match(/\binset\b[^;]*/) || [];
          if (
            (!ring || !hasColoredValue(normalizedDeclaration)) &&
            (!insetEdge[0] || !hasColoredValue(insetEdge[0]))
          ) {
            return [];
          }
        }
        return hasColoredValue(normalizedDeclaration)
          ? [`${path.basename(cssPath)}: ${normalizedDeclaration}`]
          : [];
      });
    });

    expect(violations).toEqual([]);
  });
});
