"use client";

import {
  Page,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Box,
  Divider,
  Collapsible,
} from "@shopify/polaris";

import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [checkoutEditorUrl, setCheckoutEditorUrl] = useState<string | null>(
    null,
  );
  const [checkoutSettingsUrl, setCheckoutSettingsUrl] = useState<
    string | null
  >(null);
  const [linksLoading, setLinksLoading] = useState(true);
  const [giftPreviewOpen, setGiftPreviewOpen] = useState(false);

  const loadCheckoutLinks = useCallback(async () => {
    setLinksLoading(true);

    try {
      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              shop {
                myshopifyDomain
              }
              checkoutProfiles(first: 1) {
                nodes {
                  id
                }
              }
            }
          `,
        }),
      });

      if (!res.ok) {
        throw new Error(`Shopify Admin API returned ${res.status}`);
      }

      const result = await res.json();

      if (result.errors?.length) {
        throw new Error(
          result.errors.map((error: { message?: string }) => error.message).join(
            ", ",
          ),
        );
      }

      const data = result.data;

      const myshopifyDomain = data?.shop?.myshopifyDomain;

      if (!myshopifyDomain) {
        throw new Error("Missing shop domain");
      }

      // Shopify Admin URLs require the shop handle, without .myshopify.com.
      const handle = myshopifyDomain
        .replace(/^https?:\/\//, "")
        .replace(/\.myshopify\.com\/?$/, "");

      if (!handle) {
        throw new Error("Unable to determine Shopify store handle");
      }

      setCheckoutSettingsUrl(
        `https://admin.shopify.com/store/${encodeURIComponent(handle)}/settings/checkout`,
      );

      const profileId = data?.checkoutProfiles?.nodes?.[0]?.id
        ?.split("/")
        .pop();

      if (!profileId) {
        throw new Error("Missing checkout profile");
      }

      // Use Shopify's normal checkout editor URL. Do not depend on an
      // extension ID being present in NEXT_PUBLIC_* environment variables.
      const editorUrl =
        `https://admin.shopify.com/store/${encodeURIComponent(handle)}` +
        `/settings/checkout/editor/profiles/${encodeURIComponent(profileId)}` +
        `?page=checkout`;

      setCheckoutEditorUrl(editorUrl);
    } catch (error) {
      console.error("Failed to load checkout links:", error);
      setCheckoutEditorUrl(null);
      setCheckoutSettingsUrl(null);
    } finally {
      setLinksLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCheckoutLinks();
  }, [loadCheckoutLinks]);

  return (
    <Page>
      <BlockStack gap="600">
        {/* Hero */}
        <Card>
          <Box padding="600">
            <BlockStack gap="500">
              <InlineStack
                align="space-between"
                blockAlign="center"
                wrap
                gap="400"
              >
                <BlockStack gap="100">
                  <Text as="h1" variant="headingXl">
                    Gift Checkout
                  </Text>

                  <InlineStack gap="200">
                    <Badge tone="success">Active</Badge>
                    <Badge>Checkout Extension</Badge>
                  </InlineStack>
                </BlockStack>

                <Button
                  variant="primary"
                  url={checkoutEditorUrl ?? undefined}
                  target="_top"
                  disabled={linksLoading || !checkoutEditorUrl}
                >
                  Configure checkout
                </Button>
              </InlineStack>

              <Box paddingBlockStart="300">
                <BlockStack gap="300">
                  <Text as="h2" variant="heading2xl">
                    Make every order a little more personal.
                  </Text>

                  <Text as="p" variant="bodyLg" tone="subdued">
                    Let customers add a thoughtful gift message during
                    checkout. Their message is securely saved with the cart
                    and carried through to the order.
                  </Text>
                </BlockStack>
              </Box>
            </BlockStack>
          </Box>
        </Card>

        {/* Main feature */}
        <Card>
          <BlockStack gap="500">
            <BlockStack gap="100">
                <Text as="h2" variant="headingLg">
                  Gift messages made simple
                </Text>

                <Text as="p" tone="subdued">
                  Give your customers an easy way to add a personal note to
                  their order.
                </Text>
            </BlockStack>

            <Divider />

            <InlineStack
              gap="500"
              align="space-between"
              wrap
            >
              <Feature
                title="Personal messages"
                description="Customers can write a custom message of up to 500 characters. Inappropriate or abusive language is blocked."
              />

              <Feature
                title="Works with checkout"
                description="The gift message is collected directly during the checkout experience."
              />

              <Feature
                title="Saved with the order"
                description="The message stays connected to the customer's order."
              />
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Preview */}
        <InlineStack gap="500" wrap>
          <Box width="100%">
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingLg">
                    Customer experience
                  </Text>

                  <Text as="p" tone="subdued">
                    This is what your customers see during checkout.
                  </Text>
                </BlockStack>

                <Box
                  padding="500"
                  background="bg-surface-secondary"
                  borderRadius="300"
                >
                  <BlockStack gap="300">
                    <Divider />
                    <Button
                      variant="monochromePlain"
                      textAlign="start"
                      fullWidth
                      disclosure={giftPreviewOpen ? "up" : "down"}
                      onClick={() => setGiftPreviewOpen((open) => !open)}
                      ariaExpanded={giftPreviewOpen}
                      ariaControls="gift-preview-panel"
                    >
                      {/* <Text as="span" fontWeight="semibold"> */}
                        Gift message
                      {/* </Text> */}
                    </Button>
                    <Divider />

                    <Collapsible open={giftPreviewOpen} id="gift-preview-panel">
                      <BlockStack gap="400">
                        <Text as="p" tone="subdued">
                          Add a personal message with your gift.
                        </Text>

                        <Box
                          background="bg-surface"
                          padding="400"
                          borderRadius="200"
                          borderWidth="025"
                          borderColor="border"
                        >
                          <BlockStack gap="200">
                            <Text as="p" tone="subdued">
                              Gift message
                            </Text>

                            <Text as="p">Happy Birthday! 🎉</Text>
                          </BlockStack>
                        </Box>

                        <Button variant="primary">Save Gift Message</Button>
                      </BlockStack>
                    </Collapsible>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Box>
        </InlineStack>

        {/* How it works */}
        <Card>
          <BlockStack gap="500">
            <BlockStack gap="100">
              <Text as="h2" variant="headingLg">
                How it works
              </Text>

              <Text as="p" tone="subdued">
                A simple three-step experience for your customers.
              </Text>
            </BlockStack>

            <InlineStack
              gap="600"
              align="space-between"
              wrap
            >
              <Step
                number="01"
                title="Customer writes a message"
                description="The customer adds their personal gift message during checkout."
              />

              <Step
                number="02"
                title="Message is saved"
                description="The message is securely stored with the cart."
              />

              <Step
                number="03"
                title="Message follows the order"
                description="The gift message is available with the resulting order."
              />
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Configuration */}
        <Card>
          <BlockStack gap="400">
            <InlineStack
              align="space-between"
              blockAlign="center"
              wrap
              gap="400"
            >
              <BlockStack gap="100">
                <Text as="h2" variant="headingLg">
                  Checkout configuration
                </Text>

                <Text as="p" tone="subdued">
                  Manage where the Gift Checkout extension appears.
                </Text>
              </BlockStack>

              <Badge tone="success">Ready to configure</Badge>
            </InlineStack>

            <Divider />

            <InlineStack gap="300">
              <Button
                variant="primary"
                url={checkoutEditorUrl ?? undefined}
                target="_top"
                disabled={linksLoading || !checkoutEditorUrl}
              >
                Open checkout editor
              </Button>

              <Button
                url={checkoutSettingsUrl ?? undefined}
                target="_top"
                disabled={!checkoutSettingsUrl}
              >
                Checkout settings
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Footer info */}
        <Box paddingBlockEnd="600">
          <InlineStack align="center">
            <Text as="p" tone="subdued" alignment="center">
              Gift Checkout makes thoughtful gifting part of every
              checkout experience.
            </Text>
          </InlineStack>
        </Box>
      </BlockStack>
    </Page>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Box width="30%">
      <BlockStack gap="100">
        <Text as="h3" variant="headingMd">
          {title}
        </Text>

        <Text as="p" tone="subdued">
          {description}
        </Text>
      </BlockStack>
    </Box>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <Box width="30%">
      <BlockStack gap="300">
        <Text as="p" variant="headingXl">
          {number}
        </Text>

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