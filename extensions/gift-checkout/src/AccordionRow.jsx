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
          gridTemplateColumns="20px minmax(0, 1fr) 20px"
          alignItems="center"
          columnGap="small"
          inlineSize="100%"
        >
          <s-grid
            inlineSize="20px"
            blockSize="20px"
            alignItems="center"
            justifyItems="center"
          >
            <s-icon type={icon} size="base" tone="neutral" />
          </s-grid>
          <s-text type="strong">{title}</s-text>
          <s-grid
            inlineSize="20px"
            blockSize="20px"
            alignItems="center"
            justifyItems="end"
          >
            <s-icon
              type={open ? 'chevron-up' : 'chevron-down'}
              size="small"
              tone="neutral"
            />
          </s-grid>
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
