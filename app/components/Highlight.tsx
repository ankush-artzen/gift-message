import { BlockStack, Box, Icon, InlineStack, Text } from "@shopify/polaris";
import type { SVGProps } from "react";

export function Highlight({
  icon,
  title,
  description,
}: {
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  title: string;
  description: string;
}) {
  return (
    <InlineStack gap="300" blockAlign="start" wrap={false}>
      <Box
        background="bg-surface-secondary"
        borderRadius="200"
        minWidth="36px"
        maxWidth="36px"
        minHeight="36px"
        padding="200"
      >
        <Icon source={icon} tone="base" />
      </Box>
      <BlockStack gap="050">
        <Text as="h3" variant="headingSm">
          {title}
        </Text>
        <Text as="p" tone="subdued">
          {description}
        </Text>
      </BlockStack>
    </InlineStack>
  );
}
