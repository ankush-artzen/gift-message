import '@shopify/ui-extensions/preact';

/**
 * @param {{
 *   icon: any,
 *   title: string,
 *   open: boolean,
 *   onToggle: () => void,
 *   children?: import('preact').ComponentChildren,
 * }} props
 */
export function AccordionRow({icon, title, open, onToggle, children}) {
  return (
    <s-box
      background="base"
      border="base"
      borderWidth="none none base none"
      borderStyle="solid"
      inlineSize="100%"
    >
      <s-clickable
        type="button"
        inlineSize="100%"
        background="base"
        blockSize="48px"
        padding="none small"
        accessibilityLabel={title}
        onClick={onToggle}
      >
        <s-grid
          gridTemplateColumns="minmax(0, 1fr) auto"
          alignItems="center"
          inlineSize="100%"
        >
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-icon type={icon} size="base" />
            <s-text type="strong">{title}</s-text>
          </s-stack>
          <s-icon type={open ? 'chevron-up' : 'chevron-down'} size="small" />
        </s-grid>
      </s-clickable>
      {open ? (
        <>
          <s-divider />
          <s-box padding="base small" inlineSize="100%">
            {children}
          </s-box>
        </>
      ) : null}
    </s-box>
  );
}
