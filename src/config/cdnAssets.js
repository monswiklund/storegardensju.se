const CDN = "https://pub-fd3f0e7f69dc410c9cdaffdf1a0a35b1.r2.dev";

const assets = {
  "/images/ann-profile.webp": `${CDN}/media-2f1b53dc8f2d36b38564c752e99add39fd13cee486c62ff3b409143c770f7c07.webp`,
  "/images/carl-profile.webp": `${CDN}/media-96123394ec856575160755d02ad3a5d93961c0d15bbfb1251994fb9ec2257295.webp`,
  "/images/lina-profile.webp": `${CDN}/media-766a48e7a4881a6c454ab11a09291b330c9621336de2fd2e7538737f9e8ab7b6.webp`,
  "/images/mans-profile.webp": `${CDN}/media-44c3496ed83085427eddb19101dc631b01e3020aa10ea5c0eb0335aa2f78145b.webp`,
  "/images/logoTransp_cropped.png": `${CDN}/media-c0a7592815264a8e7e550bd2a176c8c05dfcefd1ecaac1d9fe33f3096aac918d.webp`,
  "/images/event/hero/hero.webp": `${CDN}/media-ce29422fa2a743f701c9d0facf651e2fde99e24830e456ec9e9528d84fc031a6.webp`,
  "/images/event/hero/hero-2.webp": `${CDN}/media-dff6a2a272afadabeb1dda43b1d18767bb2becfafb54faf719415169eb882118.webp`,
  "/images/event/hero/hero-3.webp": `${CDN}/media-d69c59504d96e8b7110a7ec7debbf92006197846dcaca05e1c42d821933891ab.webp`,
  "/images/evenemang/heldag-paket.webp": `${CDN}/media-8a060a87b6009d8b0080c4d7cc4a330ad507726a6157d9b7b7ea60f224e6dbea.webp`,
  "/images/evenemang/konstafton/konstafton-2025.webp": `${CDN}/media-ea1d3ea9f92bd2c7fc05a03e4c0289b2a898da0f9073859b804f98a7c18b3fc9.webp`,
  "/images/evenemang/lina-yoga-header.jpg": `${CDN}/media-e7839e9c79596fef7c265a5eb559b5dd462bcf527e1dc8fdc5fcc791ff33feeb.webp`,
  "/images/evenemang/lina-yoga-yta2.jpg": `${CDN}/media-1700ba80263a73b4651cdf694207cc3fc69d40a8c8513a294ed8ced5142f4d5c.webp`,
  "/images/evenemang/lina-yoga.jpg": `${CDN}/media-cf02dc0c7c508dc745b21e3123b624571992aa14506190d457509b24ddd131a8.webp`,
  "/images/evenemang/maleri-kurs.webp": `${CDN}/media-d7743fb09164a602a57c6c4c95adcded969067294675fffd758f2c63fb53e3f0.webp`,
  "/images/evenemang/slide10.webp": `${CDN}/media-8c1ed13330582ca52244842eddf11572ba46dce29b50eb167678d714e9976d8c.webp`,
  "/images/evenemang/slide12.webp": `${CDN}/media-f05f736991c5a2f901f75763a35f73dede19a1eea5a7eed359c1d54f634715c2.webp`,
  "/images/evenemang/slide2.webp": `${CDN}/media-4b889fb3f52d042602beedbf879e40f8f42b1dc0a511ec4da6c949d27c62f940.webp`,
  "/images/evenemang/yoga-loft.webp": `${CDN}/media-8726c9e3085b089bb87ab02ded765ae0228d1834f7e777665a058a16d4197736.webp`,
  "/images/konst-keramik/slide16.webp": `${CDN}/media-fe40af419ba45578623c199b08c14e569087511e62dacf98cdf6683da9275f01.webp`,
  "/images/lokal/slide23.webp": `${CDN}/media-b4988d02bbd6bc55a67ecacc8fbf2ee233345d9c27148bb9c9354b9d0376dac2.webp`,
  "/images/portfolio/ann-2.webp": `${CDN}/media-bb3e5b809e099ae41f94f521d760603a1a22024cd13f74d55376316ce0b7efb3.webp`,
};

export const cdnAsset = (path) => assets[path] || path;
