export const GIFT_MESSAGE_KEY = 'gift_message';
export const GIFT_MESSAGE_NAMESPACE = '$app';
export const GIFT_MESSAGE_TYPE = 'multi_line_text_field';
export const GIFT_MESSAGE_MAX_LENGTH = 150;
export const GIFT_MESSAGE_ATTRIBUTE_KEY = 'Gift message';

/**
 * @returns {number}
 */
export function getGiftMessageMaxLength() {
  const raw = shopify.settings?.value?.gift_message_max_length;
  const parsed = typeof raw === 'number' ? raw : Number(raw);

  if (Number.isFinite(parsed) && parsed >= 1) {
    return Math.min(1000, Math.floor(parsed));
  }

  return GIFT_MESSAGE_MAX_LENGTH;
}

const GIFT_BOX_IMAGE_URL =
  'https://cdn.shopify.com/s/files/1/0649/0449/5187/files/giftm.png?v=1795088710';

/**
 * @returns {string}
 */
export function getGiftImageUrl() {
  const value = shopify.settings?.value?.gift_image_url;
  if (typeof value === 'string') {
    const url = value.trim();
    if (/^https:\/\//i.test(url)) {
      return url;
    }
  }

  return GIFT_BOX_IMAGE_URL;
}

/**
 * @returns {string}
 */
export function getSavedGiftMessage() {
  const metafields = shopify.appMetafields?.value;
  if (Array.isArray(metafields)) {
    const entry = metafields.find(
      (item) =>
        item.target?.type === 'cart' && item.metafield?.key === GIFT_MESSAGE_KEY,
    );

    if (typeof entry?.metafield?.value === 'string' && entry.metafield.value) {
      return entry.metafield.value;
    }
  }

  const attributes = shopify.attributes?.value;
  if (Array.isArray(attributes)) {
    const attribute = attributes.find(
      (item) => item.key === GIFT_MESSAGE_ATTRIBUTE_KEY,
    );
    if (typeof attribute?.value === 'string' && attribute.value) {
      return attribute.value;
    }
  }

  const note = shopify.note?.value;
  return typeof note === 'string' ? note : '';
}

/**
 * @param {any} event
 * @param {string} [fallback]
 * @returns {string}
 */
export function getEventStringValue(event, fallback = '') {
  const candidates = [
    event?.currentValue?.value,
    event?.currentTarget?.value,
    event?.target?.value,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      return candidate;
    }
  }

  return fallback;
}

/**
 * @param {() => Promise<unknown>} task
 */
async function runSaveTask(task) {
  try {
    const result = await task();
    if (result && typeof result === 'object' && 'type' in result) {
      return result;
    }

    return {type: 'success'};
  } catch (error) {
    return {
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * @param {string} message
 */
function applyGiftMessageAttribute(message) {
  const checkout = /** @type {{ applyAttributeChange?: (change: {type: 'updateAttribute', key: string, value: string}) => Promise<{type?: string, message?: string}> }} */ (
    shopify
  );

  if (typeof checkout.applyAttributeChange !== 'function') {
    return Promise.resolve({
      type: 'error',
      message: 'Cart attributes are unavailable',
    });
  }

  return checkout.applyAttributeChange({
    type: 'updateAttribute',
    key: GIFT_MESSAGE_ATTRIBUTE_KEY,
    value: message,
  });
}

/**
 * @param {string} message
 */
export async function persistGiftMessage(message) {
  const results = [];

  const attributeResult = await runSaveTask(() =>
    applyGiftMessageAttribute(message),
  );
  results.push({...attributeResult, source: 'attribute'});

  if (typeof shopify.applyMetafieldChange === 'function') {
    const metafieldResult = await runSaveTask(() =>
      shopify.applyMetafieldChange({
        type: 'updateCartMetafield',
        metafield: {
          namespace: GIFT_MESSAGE_NAMESPACE,
          key: GIFT_MESSAGE_KEY,
          type: GIFT_MESSAGE_TYPE,
          value: message,
        },
      }),
    );
    results.push({...metafieldResult, source: 'metafield'});
  }

  return results;
}

/**
 * @param {{type?: unknown} | null | undefined} result
 * @returns {boolean}
 */
function didSaveSucceed(result) {
  return result?.type !== 'error';
}

/**
 * @param {Array<{type?: unknown, source?: string}>} results
 * @returns {boolean}
 */
export function messageWasSaved(results) {
  const attributeResult = results.find((result) => result.source === 'attribute');
  if (attributeResult) {
    return didSaveSucceed(attributeResult);
  }

  return results.some(didSaveSucceed);
}
