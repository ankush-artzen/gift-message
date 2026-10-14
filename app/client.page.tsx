"use client";

import { CheckoutPreview } from "@/app/components/CheckoutPreview";
import { Highlight } from "@/app/components/Highlight";
import { Step } from "@/app/components/Step";
import { NoteIcon, OrderIcon, ShieldIcon } from "@/app/components/icons";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  Divider,
  FooterHelp,
  InlineGrid,
  InlineStack,
  Page,
  Text,
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
  const [linksError, setLinksError] = useState(false);

  const loadCheckoutLinks = useCallback(async () => {
    setLinksLoading(true);
    setLinksError(false);

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
          result.errors
            .map((error: { message?: string }) => error.message)
            .join(", "),
        );
      }

      const data = result.data;
      const myshopifyDomain = data?.shop?.myshopifyDomain;

      if (!myshopifyDomain) {
        throw new Error("Missing shop domain");
      }

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


      const editorUrl =
        `https://admin.shopify.com/store/${encodeURIComponent(handle)}` +
        `/settings/checkout/editor/profiles/${encodeURIComponent(profileId)}` +
        `?page=checkout`;

      setCheckoutEditorUrl(editorUrl);
    } catch (error) {
      console.error("Failed to load checkout links:", error);
      setCheckoutEditorUrl(null);
      setCheckoutSettingsUrl(null);
      setLinksError(true);
    } finally {
      setLinksLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCheckoutLinks();
  }, [loadCheckoutLinks]);

  return (
    <Page
      title="Gift Checkout"
      subtitle="Let customers add a personal note during checkout."
      // primaryAction={{
      //   content: "Open checkout editor",
      //   url: checkoutEditorUrl ?? undefined,
      //   target: "_top",
      //   disabled: linksLoading || !checkoutEditorUrl,
      //   loading: linksLoading,
      // }}
      // secondaryActions={[
      //   {
      //     content: "Checkout settings",
      //     url: checkoutSettingsUrl ?? undefined,
      //     target: "_top",
      //     disabled: linksLoading || !checkoutSettingsUrl,
      //   },
      // ]}
    >
      <BlockStack gap="500">
        {linksError ? (
          <Banner
            tone="warning"
            title="Checkout links are unavailable"
            action={{ content: "Try again", onAction: loadCheckoutLinks }}
          >
            <p>
              Refresh the page, or open checkout from Shopify admin under
              Settings, then Checkout.
            </p>
          </Banner>
        ) : null}

        <Card>
          <InlineGrid columns={{ xs: 1, md: 2 }} gap="600">
            <BlockStack gap="400">
              <InlineStack gap="200">
                <Badge tone="success">Active</Badge>
                <Badge>Checkout extension</Badge>
              </InlineStack>

              <BlockStack gap="200">
                <Text as="h2" variant="headingXl">
                  Make every order a little more personal.
                </Text>
                <Text as="p" variant="bodyLg" tone="subdued">
                  Customers write a gift message on the checkout page. The note
                  is saved with the cart and stays with the order.
                </Text>
              </BlockStack>

              <BlockStack gap="300">
                <Highlight
                  icon={NoteIcon}
                  title="personal note"
                  description="A short, personal note with room for a real message."
                />
                <Highlight
                  icon={ShieldIcon}
                  title="Language is checked"
                  description="Abusive language is blocked before the message can be saved."
                />
                <Highlight
                  icon={OrderIcon}
                  title="Kept with the order"
                  description="The message travels from checkout to the finished order."
                />
              </BlockStack>
            </BlockStack>

            <CheckoutPreview />
          </InlineGrid>
        </Card>

        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingLg">
                How it works
              </Text>
              <Text as="p" tone="subdued">
                Three steps, from the note a customer writes to the order you
                fulfill.
              </Text>
            </BlockStack>

            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
              <Step
                number="1"
                title="Customer writes a message"
                description="They open Gift message during checkout and add a personal note."
              />
              <Step
                number="2"
                title="Message is saved"
                description="The note is stored with the cart after they save it."
              />
              <Step
                number="3"
                title="Message follows the order"
                description="The same gift message is available with the resulting order."
              />
            </InlineGrid>
          </BlockStack>
        </Card>

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
                  Place it in checkout
                </Text>
                <Text as="p" tone="subdued">
                  Add the Gift Checkout block in the checkout editor, then
                  position it where customers should see it.
                </Text>
              </BlockStack>
              <Badge tone="success">Ready</Badge>
            </InlineStack>

            <Divider />

            <ButtonGroup>
              <Button
                variant="primary"
                url={checkoutEditorUrl ?? undefined}
                target="_top"
                loading={linksLoading}
                disabled={linksLoading || !checkoutEditorUrl}
              >
                Open checkout editor
              </Button>
              <Button
                url={checkoutSettingsUrl ?? undefined}
                target="_top"
                disabled={linksLoading || !checkoutSettingsUrl}
              >
                Checkout settings
              </Button>
            </ButtonGroup>
          </BlockStack>
        </Card>

        <FooterHelp>
          Gift messages are collected in checkout and kept with the order.
        </FooterHelp>
      </BlockStack>
    </Page>
  );
}
