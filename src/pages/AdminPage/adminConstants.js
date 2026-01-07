export const FULFILLMENT_LABELS = {
  new: "Ny",
  ship: "Att skicka",
  pickup_ready: "Klar för hämtning",
  completed: "Klar",
};

export const PAYMENT_LABELS = {
  paid: "Betald",
  unpaid: "Obetald",
  no_payment_required: "Ej betalning",
};

export const PAYMENT_CHIP_CLASS = {
  paid: "admin-chip-paid",
  unpaid: "admin-chip-unpaid",
  no_payment_required: "admin-chip-no-payment",
};

export const FULFILLMENT_FILTERS = [
  { value: "new", label: "Nya" },
  { value: "ship", label: "Att skicka" },
  { value: "pickup_ready", label: "Hämtning" },
  { value: "completed", label: "Klart" },
  { value: "all", label: "Alla" },
];

export const FULFILLMENT_OPTIONS = [
  { value: "new", label: "Ny" },
  { value: "ship", label: "Att skicka" },
  { value: "pickup_ready", label: "Klar för hämtning" },
  { value: "completed", label: "Klar" },
];

export const FULFILLMENT_RANK = {
  new: 1,
  ship: 2,
  pickup_ready: 2,
  completed: 3,
};

export const NOTE_MAX_LENGTH = 2000;
export const NOTE_TEMPLATES = [
  "Ring kunden innan leverans.",
  "Packad och redo att skickas.",
  "Redo för upphämtning i butik.",
  "Skickad med PostNord.",
  "Kunden vill byta leveransdatum.",
];

export const TRACKING_CARRIER_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "postnord", label: "PostNord" },
  { value: "dhl", label: "DHL" },
  { value: "schenker", label: "Schenker" },
];

export const HIGH_ORDER_THRESHOLD = 200000;

export const DEFAULT_FILTER = "new";
export const DEFAULT_STATS_RANGE = "90";

export const STATS_RANGE_OPTIONS = [
  { value: "30", label: "30 dagar" },
  { value: "90", label: "90 dagar" },
  { value: "180", label: "180 dagar" },
  { value: "365", label: "1 år" },
  { value: "all", label: "Alla" },
];

export const DATE_FILTER_OPTIONS = [
  { value: "all", label: "Alla datum" },
  { value: "today", label: "Idag" },
  { value: "week", label: "Senaste veckan" },
  { value: "month", label: "Senaste månaden" },
];

export const AMOUNT_FILTER_OPTIONS = [
  { value: "all", label: "Alla belopp" },
  { value: "high_value", label: "Över 1000 kr" },
  { value: "very_high_value", label: "Över 5000 kr" },
];

export const ADMIN_VIEW_OPTIONS = [
  { value: "overview", label: "Översikt" },
  { value: "stats", label: "Statistik" },
  { value: "orders", label: "Ordrar" },
  { value: "customers", label: "Kunder" },
  { value: "products", label: "Produkter" },
  { value: "coupons", label: "Rabatter" },
];

export const ORDER_SORT_OPTIONS = [
  { value: "created", label: "Senast skapad" },
  { value: "event", label: "Senaste händelse" },
];

export const SORT_STORAGE_KEY = "adminOrderSort";

export const DEMO_ORDERS = [
  {
    id: "cs_demo_1",
    created: 1734600000,
    status: "complete",
    paymentStatus: "paid",
    amountTotal: 124900,
    currency: "sek",
    customerEmail: "kund@exempel.se",
    fulfillment: "new",
    fulfillmentUpdatedAt: 1734603600,
    lastEventType: "note",
    lastEventAt: 1734603600,
    stripeUrl: "",
  },
  {
    id: "cs_demo_2",
    created: 1734500000,
    status: "complete",
    paymentStatus: "paid",
    amountTotal: 329000,
    currency: "sek",
    customerEmail: "anna@exempel.se",
    fulfillment: "pickup_ready",
    fulfillmentUpdatedAt: 1734510000,
    lastEventType: "fulfillment",
    lastEventAt: 1734510000,
    lastEventValue: "pickup_ready",
    stripeUrl: "",
  },
];

export const DEMO_DETAILS = {
  cs_demo_1: {
    id: "cs_demo_1",
    created: 1734600000,
    status: "complete",
    paymentStatus: "paid",
    amountTotal: 124900,
    currency: "sek",
    customerEmail: "kund@exempel.se",
    customerName: "Kund Exempel",
    customerPhone: "+46 70 123 45 67",
    shippingAddress: "Storgatan 12\n123 45 Stockholm\nSE",
    fulfillment: "new",
    adminNote: "Ring kunden innan leverans.",
    customerMessage: "Kan ni slå in som present?",
    trackingNumber: "SE123456789",
    trackingCarrier: "postnord",
    fulfillmentUpdatedAt: 1734603600,
    shippingRate: "Standardfrakt",
    stripeUrl: "",
    livemode: false,
    paymentIntentId: "pi_demo_1",
    customerId: "cus_demo_1",
    lineItems: [
      {
        description: "Handgjord vas",
        productId: "prod_demo_1",
        priceId: "price_demo_1",
        unitAmount: 74900,
        currency: "sek",
        quantity: 1,
        amountTotal: 74900,
        stock: 1,
      },
      {
        description: "Ljuslykta",
        productId: "prod_demo_2",
        priceId: "price_demo_2",
        unitAmount: 50000,
        currency: "sek",
        quantity: 1,
        amountTotal: 50000,
        stock: 6,
      },
    ],
    events: [
      { type: "created", timestamp: 1734600000 },
      { type: "paid", timestamp: 1734600300 },
      { type: "customer_message", timestamp: 1734600400 },
      { type: "fulfillment", timestamp: 1734603600, value: "new" },
      { type: "note", timestamp: 1734603600 },
    ],
  },
  cs_demo_2: {
    id: "cs_demo_2",
    created: 1734500000,
    status: "complete",
    paymentStatus: "paid",
    amountTotal: 329000,
    currency: "sek",
    customerEmail: "anna@exempel.se",
    customerName: "Anna Larsson",
    customerPhone: "+46 73 987 65 43",
    shippingAddress: "Parkvägen 3\n111 22 Stockholm\nSE",
    fulfillment: "pickup_ready",
    adminNote: "",
    trackingCarrier: "schenker",
    fulfillmentUpdatedAt: 1734510000,
    shippingRate: "Hämta i butik",
    stripeUrl: "",
    livemode: false,
    paymentIntentId: "pi_demo_2",
    customerId: "cus_demo_2",
    lineItems: [
      {
        description: "Skulptur - unik",
        productId: "prod_demo_3",
        priceId: "price_demo_3",
        unitAmount: 329000,
        currency: "sek",
        quantity: 1,
        amountTotal: 329000,
        stock: 0,
      },
    ],
    events: [
      { type: "created", timestamp: 1734500000 },
      { type: "paid", timestamp: 1734500200 },
      { type: "fulfillment", timestamp: 1734510000, value: "pickup_ready" },
    ],
  },
};

export const buildDemoStats = (range) => {
  const categories = [
    { category: "Keramik", count: 2, revenue: 124900 },
    { category: "Skulptur", count: 1, revenue: 329000 },
  ];

  const itemsTotal = categories.reduce(
    (sum, category) => sum + category.revenue,
    0
  );
  const totalItems = categories.reduce(
    (sum, category) => sum + category.count,
    0
  );
  const totalOrders = 2;
  const paidTotal = itemsTotal;
  const averageOrder =
    totalOrders > 0 ? Math.round(paidTotal / totalOrders) : 0;

  const categoriesWithShare = categories.map((category) => ({
    ...category,
    shareRevenue: itemsTotal ? category.revenue / itemsTotal : 0,
    shareCount: totalItems ? category.count / totalItems : 0,
  }));

  return {
    range,
    rangeDays: range === "all" ? 0 : Number(range) || 0,
    generatedAt: Math.floor(Date.now() / 1000),
    totalOrders,
    paidTotal,
    averageOrder,
    itemsTotal,
    totalItems,
    currency: "sek",
    categories: categoriesWithShare,
  };
};
