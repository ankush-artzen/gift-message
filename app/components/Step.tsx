import { Badge, BlockStack, Box, Text } from "@shopify/polaris";

export function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <Box
      background="bg-surface-secondary"
      padding="400"
      borderRadius="200"
      minHeight="100%"
    >
      <BlockStack gap="300">
        <Badge tone="info">{number}</Badge>
        <BlockStack gap="100">
          <Text as="h3" variant="headingMd">
            {title}
          </Text>
          <Text as="p" tone="subdued">
            {description}
          </Text>
        </BlockStack>
      </BlockStack>
    </Box>
  );
}
