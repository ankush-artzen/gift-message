"use client";

import {
  Badge,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Collapsible,
  InlineStack,
  Text,
  TextField,
} from "@shopify/polaris";
import { useState, type SVGProps } from "react";

const GIFT_MESSAGE_MAX_LENGTH = 500;
const SAMPLE_MESSAGE = "Happy Birthday! Hope you have the most wonderful day.";

export function CheckoutPreview() {
  const [open, setOpen] = useState(true);
  const [savedMessage, setSavedMessage] = useState(SAMPLE_MESSAGE);
  const [draft, setDraft] = useState(SAMPLE_MESSAGE);
  const [editing, setEditing] = useState(false);
  const showEditor = editing || !savedMessage;

  function handleSave() {
    const message = draft.trim();
    if (!message) return;

    setSavedMessage(message);
    setDraft(message);
    setEditing(false);
  }

  function handleEdit() {
    setDraft(savedMessage);
    setEditing(true);
  }

  return (
    <Box
      background="bg-surface-secondary"
      padding="400"
      borderRadius="300"
      minHeight="100%"
    >
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingSm">
            Customer preview
          </Text>
          <Badge>Sample</Badge>
        </InlineStack>

        <Box
          background="bg-surface"
          borderRadius="200"
          borderWidth="025"
          borderColor="border"
          paddingInline="400"
          paddingBlock="300"
        >
          <BlockStack gap="300">
            <Button
              variant="monochromePlain"
              textAlign="start"
              fullWidth
              icon={GiftIcon}
              disclosure={open ? "up" : "down"}
              onClick={() => setOpen((isOpen) => !isOpen)}
              ariaExpanded={open}
              ariaControls="gift-preview-panel"
            >
              Gift message
            </Button>

            <Collapsible open={open} id="gift-preview-panel">
              <BlockStack gap="300">
                <Text as="p" tone="subdued">
                  Add a personal message with your gift.
                </Text>

                {showEditor ? (
                  <BlockStack gap="300">
                    <TextField
                      label="Gift message"
                      labelHidden
                      value={draft}
                      onChange={setDraft}
                      multiline={4}
                      maxLength={GIFT_MESSAGE_MAX_LENGTH}
                      showCharacterCount
                      autoComplete="off"
                      placeholder="Write a gift message"
                    />
                    <ButtonGroup>
                      <Button
                        variant="primary"
                        disabled={!draft.trim()}
                        onClick={handleSave}
                      >
                        Save gift message
                      </Button>
                      {savedMessage ? (
                        <Button
                          onClick={() => {
                            setDraft(savedMessage);
                            setEditing(false);
                          }}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </ButtonGroup>
                  </BlockStack>
                ) : (
                  <BlockStack gap="300">
                    <Box
                      background="bg-surface-secondary"
                      padding="300"
                      borderRadius="200"
                      borderWidth="025"
                      borderColor="border"
                    >
                      <Text as="p">{savedMessage}</Text>
                    </Box>
                    <Button variant="plain" onClick={handleEdit}>
                      Edit gift message
                    </Button>
                  </BlockStack>
                )}
              </BlockStack>
            </Collapsible>
          </BlockStack>
        </Box>
      </BlockStack>
    </Box>
  );
}

function GiftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        d="M10 2.25a2.25 2.25 0 0 0-2.02 1.25H5.75A1.75 1.75 0 0 0 4 5.25V7h5.15V4.5c0-.1.01-.2.02-.3A2.24 2.24 0 0 0 10 2.25Zm1.85 2.25c.1.1.15.24.15.4V7H16V5.25A1.75 1.75 0 0 0 14.25 3.5h-2.23A2.25 2.25 0 0 0 11.85 4.5ZM4 8.5v6.25c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0 0 16 14.75V8.5H4Zm5.25.75v5.5h1.5v-5.5h-1.5Z"
      />
    </svg>
  );
}
