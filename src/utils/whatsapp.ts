/**
 * RevEg Fresh Foods - WhatsApp Link Generator & Integration
 * Official Contact Number: +91 94033 58033
 */
export const OFFICIAL_WHATSAPP_DISPLAY = "+91 94033 58033";
export const DEFAULT_WHATSAPP_NUMBER = "919403358033"; // Clean international format for wa.me

/**
 * Creates a WhatsApp URL that opens directly on desktop or mobile with a pre-filled message
 */
export function getWhatsAppUrl(message: string, customPhone?: string): string {
  const phone = customPhone || DEFAULT_WHATSAPP_NUMBER;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export const WhatsAppMessages = {
  // Hero / General inquiry
  generalInquiry: () =>
    "Hello RevEg Fresh Foods, I would like to enquire about your products. Please share the available items, festive specials, and price list.",

  // Product specific inquiry
  productInquiry: (productName: string, packSize?: string) => {
    if (packSize) {
      return `Hello RevEg Fresh Foods, I am interested in ${productName} (${packSize}). Please share the available pack sizes and price.`;
    }
    return `Hello RevEg Fresh Foods, I am interested in ${productName}. Please share the available pack sizes and price.`;
  },

  // Bulk order inquiry
  bulkOrder: () =>
    "Hello RevEg Fresh Foods, I would like to enquire about a bulk order for celebration/events. Please share the available options, packages, and pricing.",

  // Custom gift box inquiry
  giftBoxInquiry: (selectedItems?: string[], boxTier?: string) => {
    if (selectedItems && selectedItems.length > 0) {
      const itemsList = selectedItems.join(", ");
      const tierText = boxTier ? ` (${boxTier})` : "";
      return `Hello RevEg Fresh Foods, I would like to enquire about a customized gift box${tierText} containing: ${itemsList}. Please share the pricing and delivery details.`;
    }
    return "Hello RevEg Fresh Foods, I would like to enquire about customised festive gift boxes. Please share the available options and pricing.";
  },

  // Festive specials
  festivalInquiry: (festivalName: string) =>
    `Hello RevEg Fresh Foods, I would like to enquire about your special ${festivalName} sweets and snacks collection. Please share the items and pricing details.`,

  // Custom quick message
  customMessage: (name: string, subject: string, notes: string) => {
    let msg = `Hello RevEg Fresh Foods,\n`;
    if (name) msg += `Name: ${name}\n`;
    if (subject) msg += `Inquiry Type: ${subject}\n`;
    if (notes) msg += `Details: ${notes}\n`;
    msg += `\nPlease share current prices, freshness assurance, and delivery schedule.`;
    return msg;
  }
};
