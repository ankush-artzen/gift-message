import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useRef, useState} from 'preact/hooks';
import {AccordionRow} from './AccordionRow.jsx';
import {containsAbusiveLanguage} from './abusive-language.js';
import {
  getEventStringValue,
  getGiftImageUrl,
  getGiftMessageMaxLength,
  getSavedGiftMessage,
  messageWasSaved,
  persistGiftMessage,
} from './gift-message.js';
import {merchantText, renderMerchantContent} from './merchant-content.jsx';

export default async () => {
  render(<GiftMessage />, document.body);
};

/**
 * @param {(key: string) => string} translate
 * @returns {string}
 */
function defaultReturnsBody(translate) {
  return `${translate('returnsBody')}\n\n${translate('returnsFinalSale')}`;
}

/**
 * @param {(key: string) => string} translate
 * @returns {string}
 */
function defaultShippingBody(translate) {
  return [
    translate('shippingOvernightTitle'),
    '',
    `- ${translate('shippingOvernightWeekday')}`,
    `- ${translate('shippingOvernightFriday')}`,
    '',
    translate('shippingGroundTitle'),
    '',
    `- ${translate('shippingGroundFree')}`,
    `- ${translate('shippingGroundEstimate')}`,
  ].join('\n');
}

/**
 * @param {{
 *   description: string,
 *   imageUrl: string,
 *   imageAlt: string,
 * }} props
 */
function GiftIntro({description, imageUrl, imageAlt}) {
  const copy = renderMerchantContent(description);

  if (!imageUrl) {
    return copy;
  }

  return (
    <s-grid
      gridTemplateColumns="168px minmax(0, 1fr)"
      alignItems="center"
      columnGap="base"
      inlineSize="100%"
    >
      <s-image
        src={imageUrl}
        alt={imageAlt}
        aspectRatio="1/1"
        objectFit="contain"
        inlineSize="fill"
      />
      <s-box
        border="base"
        borderWidth="none none none base"
        borderStyle="solid"
        padding="none none none base"
        inlineSize="100%"
        minInlineSize="0"
      >
        {copy}
      </s-box>
    </s-grid>
  );
}

export function GiftMessage() {
  const {translate} = shopify.i18n;
  const maxLength = getGiftMessageMaxLength();
  const imageUrl = getGiftImageUrl();
  const metafieldMessage = getSavedGiftMessage();
  const [committedMessage, setCommittedMessage] = useState(null);
  const savedMessage = committedMessage ?? metafieldMessage;
  const [draft, setDraft] = useState(savedMessage);
  const draftRef = useRef(savedMessage);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState({
    returns: false,
    shipping: false,
    gift: false,
  });
  const showEditor = isEditing || !savedMessage;
  const isAbusiveDraft = containsAbusiveLanguage(draft);
  const giftMessagePlaceholder = translate('giftMessagePlaceholder', {
    max: maxLength,
  });

  /**
   * @param {'returns' | 'shipping' | 'gift'} section
   */
  function toggleSection(section) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

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

      if (!messageWasSaved(results)) {
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
    const value = getEventStringValue(event, draftRef.current).slice(
      0,
      maxLength,
    );
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
      background="base"
      border="base"
      borderWidth="base none none none"
      borderStyle="solid"
      padding="none"
      inlineSize="100%"
    >
      <AccordionRow
        icon="return"
        title={merchantText('returns_title', translate('returnsTitle'))}
        open={openSections.returns}
        onToggle={() => toggleSection('returns')}
      >
        {renderMerchantContent(
          merchantText('returns_body', defaultReturnsBody(translate)),
        )}
      </AccordionRow>

      <AccordionRow
        icon="truck"
        title={merchantText('shipping_title', translate('shippingTitle'))}
        open={openSections.shipping}
        onToggle={() => toggleSection('shipping')}
      >
        {renderMerchantContent(
          merchantText('shipping_body', defaultShippingBody(translate)),
        )}
      </AccordionRow>

      <AccordionRow
        icon="gift-card"
        title={merchantText('gift_title', translate('giftMessage'))}
        open={openSections.gift}
        onToggle={() => toggleSection('gift')}
      >
        <s-stack gap="large" inlineSize="100%">
          <GiftIntro
            description={merchantText(
              'gift_description',
              translate('giftingDescription'),
            )}
            imageUrl={imageUrl}
            imageAlt={merchantText('gift_image_alt', translate('giftImageAlt'))}
          />

          {showEditor ? (
            <s-stack gap="small" inlineSize="100%">
              <s-text-area
                label={giftMessagePlaceholder}
                placeholder={giftMessagePlaceholder}
                value={draft}
                rows={4}
                maxLength={maxLength}
                error={error}
                disabled={isSaving}
                onInput={handleInput}
                onChange={handleInput}
                onBlur={handleInput}
              />
              <s-text color="subdued">
                {translate('giftMessageCount', {
                  count: draft.length,
                  max: maxLength,
                })}
              </s-text>
              <s-stack direction="inline" justifyContent="end" inlineSize="100%">
                {/* <s-button
                  variant="primary"
                  type="button"
                  loading={isSaving}
                  disabled={isSaving || isAbusiveDraft}
                  onClick={() => {
                    void handleSave();
                  }}
                >
                  {translate('save')}
                </s-button> */}
                <s-button
  variant="primary"
  type="button"
  loading={isSaving}
  disabled={isSaving || isAbusiveDraft}
  appearance="monochrome"
  onClick={() => {
    void handleSave();
  }}
>
  {translate('save')}
</s-button>
              </s-stack>
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
      </AccordionRow>
    </s-box>
  );
}
