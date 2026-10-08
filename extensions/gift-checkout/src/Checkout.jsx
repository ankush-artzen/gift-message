import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useRef, useState} from 'preact/hooks';
import {containsAbusiveLanguage} from './abusive-language.js';

const GIFT_MESSAGE_KEY = 'gift_message';
const GIFT_MESSAGE_TYPE = 'multi_line_text_field';
const GIFT_MESSAGE_MAX_LENGTH = 500;
const GIFT_MESSAGE_ATTRIBUTE_KEY = 'Gift message';
const GIFT_MESSAGE_NAMESPACES = ['$app', 'custom'];

export default async () => {
  render(<GiftMessage />, document.body);
};

function getSavedGiftMessage() {
  const metafields = shopify.appMetafields?.value;
  if (Array.isArray(metafields)) {
    const entry = metafields.find((item) => {
      return (
        item.target?.type === 'cart' &&
        item.metafield?.key === GIFT_MESSAGE_KEY
      );
    });

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

function getEventStringValue(event, fallback = '') {
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

async function persistGiftMessage(message) {
  /** @type {Array<() => Promise<unknown>>} */
  const tasks = [];

  if (typeof shopify.applyMetafieldChange === 'function') {
    for (const namespace of GIFT_MESSAGE_NAMESPACES) {
      tasks.push(() =>
        shopify.applyMetafieldChange({
          type: 'updateCartMetafield',
          metafield: {
            namespace,
            key: GIFT_MESSAGE_KEY,
            type: GIFT_MESSAGE_TYPE,
            value: message,
          },
        }),
      );
    }
  }

  // if (typeof shopify.applyNoteChange === 'function') {
  //   tasks.push(() =>
  //     shopify.applyNoteChange({
  //       type: 'updateNote',
  //       note: message,
  //     }),
  //   );
  // }

  if (typeof shopify.applyAttributeChange === 'function') {
    tasks.push(() =>
      shopify.applyAttributeChange({
        type: 'updateAttribute',
        key: GIFT_MESSAGE_ATTRIBUTE_KEY,
        value: message,
      }),
    );
  }

  const results = await Promise.all(tasks.map((task) => runSaveTask(task)));
  return results;
}

function didSaveSucceed(result) {
  return result?.type !== 'error';
}

export function GiftMessage() {
  const {translate} = shopify.i18n;
  const metafieldMessage = getSavedGiftMessage();
  const [committedMessage, setCommittedMessage] = useState(null);
  const savedMessage = committedMessage ?? metafieldMessage;
  const [draft, setDraft] = useState(savedMessage);
  const draftRef = useRef(savedMessage);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const showEditor = isEditing || !savedMessage;

  async function handleSave() {
    const message = String(draftRef.current || draft || '').trim();

    if (!message) {
      setError(translate('giftMessageRequired'));
      return;
    }

    if (containsAbusiveLanguage(message)) {
      setError(translate('abusiveLanguage'));
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const results = await persistGiftMessage(message);

      if (!results.some(didSaveSucceed)) {
        setError(translate('saveError'));
        return;
      }

      setCommittedMessage(message);
      setDraft(message);
      draftRef.current = message;
      setIsEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : translate('saveError'),
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit() {
    draftRef.current = savedMessage;
    setDraft(savedMessage);
    setError('');
    setIsEditing(true);
  }

  /**
   * @param {Event} event
   */
  function handleEditClick(event) {
    event.preventDefault();
    handleEdit();
  }

  /**
   * @param {Event} event
   */
  function handleInput(event) {
    const value = getEventStringValue(event, draftRef.current);
    draftRef.current = value;
    setDraft(value);

    if (containsAbusiveLanguage(value)) {
      setError(translate('abusiveLanguage'));
      return;
    }

    if (error) {
      setError('');
    }
  }

  return (
    <s-box
      border="base"
      borderWidth="base none base"
      borderStyle="solid"
      inlineSize="100%"
    >
      <s-clickable
        type="button"
        inlineSize="100%"
        padding="small none"
        accessibilityLabel={translate('giftMessage')}
        onClick={() => setIsOpen((open) => !open)}
      >
        <s-grid
          gridTemplateColumns="1fr auto"
          alignItems="center"
          inlineSize="100%"
        >
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-icon type="gift-card" size="base" />
            <s-text type="strong">{translate('giftMessage')}</s-text>
          </s-stack>
          <s-icon type={isOpen ? 'chevron-up' : 'chevron-down'} size="small" />
        </s-grid>
      </s-clickable>

      {isOpen ? (
        <s-stack gap="base">
        <s-text color="subdued">{translate('giftingDescription')}</s-text>

        {showEditor ? (
          <s-stack gap="base">
            <s-text-area
              label={translate('giftMessage')}
              labelAccessibilityVisibility="exclusive"
              value={draft}
              rows={4}
              maxLength={GIFT_MESSAGE_MAX_LENGTH}
              error={error}
              disabled={isSaving}
              onInput={handleInput}
              onChange={handleInput}
              onBlur={handleInput}
            />
            <s-button
              variant="primary"
              type="button"
              loading={isSaving}
              disabled={isSaving || containsAbusiveLanguage(draft)}
              onClick={() => {
                void handleSave();
              }}
            >
              {translate('save')}
            </s-button>
          </s-stack>
        ) : (
          <s-stack gap="base">
            <s-box padding="base" borderWidth="base" borderRadius="base">
              <s-stack gap="base" alignItems="center">
                {savedMessage.split('\n').map((line, index) => (
                  <s-text key={`${index}-${line}`}>{line || ' '}</s-text>
                ))}
              </s-stack>
            </s-box>
            <s-link href="#" onClick={handleEditClick}>
              {translate('editGiftMessage')}
            </s-link>
          </s-stack>
        )}
        </s-stack>
      ) : null}
    </s-box>
  );
}
