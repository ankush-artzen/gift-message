import '@shopify/ui-extensions/preact';

const MERCHANT_HTML_TAGS = new Set(['p', 'ul', 'li', 'b', 'em', 'br', 'hr']);
const VOID_HTML_TAGS = new Set(['br', 'hr']);
const INLINE_CONTAINER_TAGS = new Set(['p', 'li', 'b', 'em']);
const TAG_ALIASES = {
  strong: 'b',
  i: 'em',
};

/**
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
export function merchantText(key, fallback) {
  const value = shopify.settings?.value?.[key];
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return fallback;
}

/**
 * @param {string} text
 * @returns {string}
 */
function decodeHtmlText(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

/**
 * @param {string} name
 * @returns {string}
 */
function normalizeMerchantTag(name) {
  const tag = name.toLowerCase();
  return TAG_ALIASES[tag] || tag;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function containsMerchantHtml(text) {
  return /<\/?(?:p|ul|li|b|strong|em|i|br|hr)\b/i.test(text);
}

/**
 * @param {string} line
 * @returns {boolean}
 */
function isBulletLine(line) {
  return line.startsWith('- ') || line.startsWith('* ');
}

/**
 * @param {{type: string, text?: string, children?: any[]}[]} nodes
 */
function trimHtmlEdges(nodes) {
  const first = nodes[0];
  const last = nodes[nodes.length - 1];

  if (first?.type === 'text' && typeof first.text === 'string') {
    first.text = first.text.replace(/^\s+/, '');
  }
  if (last?.type === 'text' && typeof last.text === 'string') {
    last.text = last.text.replace(/\s+$/, '');
  }

  nodes.forEach((node) => {
    if (Array.isArray(node.children)) {
      trimHtmlEdges(node.children);
    }
  });
}

/**
 * @param {any[]} stack
 * @param {string} text
 */
function appendHtmlText(stack, text) {
  const parent = stack[stack.length - 1];
  const inline = INLINE_CONTAINER_TAGS.has(parent.type);
  const value = inline ? decodeHtmlText(text).replace(/\s+/g, ' ') : text;

  if (!value || (!inline && !value.trim())) {
    return;
  }

  const previous = parent.children[parent.children.length - 1];
  if (previous?.type === 'text') {
    previous.text += value;
    return;
  }

  parent.children.push({type: 'text', text: value});
}

/**
 * @param {string} source
 */
function parseMerchantHtml(source) {
  const root = {type: 'root', children: []};
  const stack = [root];
  const tags = /<\/?\s*([a-zA-Z]+)[^>]*>/g;
  let lastIndex = 0;
  let match = tags.exec(source);

  while (match) {
    appendHtmlText(stack, source.slice(lastIndex, match.index));

    const name = normalizeMerchantTag(match[1]);
    const allowed = MERCHANT_HTML_TAGS.has(name);
    const isClose = match[0].startsWith('</');

    if (allowed && !isClose) {
      const node = {type: name, children: []};
      stack[stack.length - 1].children.push(node);
      if (!VOID_HTML_TAGS.has(name)) {
        stack.push(node);
      }
    } else if (allowed && !VOID_HTML_TAGS.has(name)) {
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index].type === name) {
          stack.length = index;
          break;
        }
      }
    }

    lastIndex = tags.lastIndex;
    match = tags.exec(source);
  }

  appendHtmlText(stack, source.slice(lastIndex));
  trimHtmlEdges(root.children);
  return root.children;
}

/**
 * @param {any[]} nodes
 * @returns {boolean}
 */
function hasVisibleText(nodes) {
  return nodes.some((node) => {
    if (node.type === 'text') {
      return Boolean(node.text?.trim());
    }
    if (INLINE_CONTAINER_TAGS.has(node.type) || node.type === 'li') {
      return hasVisibleText(node.children || []);
    }
    return false;
  });
}

/**
 * @param {any} node
 * @returns {boolean}
 */
function isInlineNode(node) {
  return (
    node.type === 'text' ||
    node.type === 'b' ||
    node.type === 'em' ||
    node.type === 'br'
  );
}

/**
 * @param {any[]} nodes
 */
function blocksFromHtml(nodes) {
  const blocks = [];
  let inline = [];

  function flushInline() {
    if (
      inline.some(
        (node) =>
          node.type === 'br' || node.type === 'hr' || hasVisibleText([node]),
      )
    ) {
      blocks.push({type: 'paragraph', children: inline});
    }
    inline = [];
  }

  nodes.forEach((node) => {
    if (isInlineNode(node)) {
      inline.push(node);
      return;
    }

    flushInline();

    if (node.type === 'hr') {
      blocks.push({type: 'rule'});
      return;
    }

    if (node.type === 'p') {
      const children = node.children || [];
      if (
        hasVisibleText(children) ||
        children.some((child) => child.type === 'br' || child.type === 'hr')
      ) {
        blocks.push({type: 'paragraph', children});
      }
      return;
    }

    if (node.type === 'ul' || node.type === 'li') {
      const items = (node.type === 'ul' ? node.children : [node])
        .filter((child) => child.type === 'li' && hasVisibleText(child.children || []))
        .map((child) => child.children || []);
      if (items.length) {
        blocks.push({type: 'list', items});
      }
    }
  });

  flushInline();
  return blocks;
}

/**
 * @param {string[]} lines
 * @param {number} startIndex
 * @returns {string}
 */
function nextNonEmptyLine(lines, startIndex) {
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line) {
      return line;
    }
  }

  return '';
}

/**
 * @param {string} text
 */
function blocksFromPlainText(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (isBulletLine(line)) {
      const items = [];
      while (index < lines.length && isBulletLine(lines[index].trim())) {
        items.push([
          {type: 'text', text: lines[index].trim().slice(2).trim()},
        ]);
        index += 1;
      }
      blocks.push({type: 'list', items});
      continue;
    }

    // Section titles above a bullet list stay bold, even with blank lines between.
    const followedByBullets = isBulletLine(nextNonEmptyLine(lines, index + 1));
    blocks.push({
      type: 'paragraph',
      children: followedByBullets
        ? [{type: 'b', children: [{type: 'text', text: line}]}]
        : [{type: 'text', text: line}],
    });
    index += 1;
  }

  return blocks;
}

/**
 * @param {any[]} nodes
 * @param {string} keyPrefix
 */
function renderInlineNodes(nodes, keyPrefix) {
  return nodes.flatMap((node, index) => {
    if (node.type === 'text') {
      return node.text ? [node.text] : [];
    }

    if (node.type === 'b' || node.type === 'em') {
      return [
        <s-text
          key={`${keyPrefix}-${node.type}-${index}`}
          type={node.type === 'b' ? 'strong' : 'offset'}
        >
          {renderInlineNodes(node.children || [], `${keyPrefix}-${index}`)}
        </s-text>,
      ];
    }

    if (node.type === 'p') {
      return renderInlineNodes(node.children || [], `${keyPrefix}-p-${index}`);
    }

    return [];
  });
}

/**
 * @param {any[]} nodes
 */
function splitByBreak(nodes) {
  if (!nodes.length) {
    return [];
  }

  const lines = [[]];
  nodes.forEach((node) => {
    if (node.type === 'br') {
      lines.push([]);
      return;
    }
    lines[lines.length - 1].push(node);
  });
  return lines;
}

/**
 * @param {any[]} nodes
 * @param {string} keyPrefix
 */
function renderFlow(nodes, keyPrefix) {
  const elements = [];
  let inline = [];
  let partIndex = 0;

  function flushLines() {
    const lines = splitByBreak(inline);
    inline = [];
    if (!lines.length) {
      return;
    }

    lines.forEach((line) => {
      const content = renderInlineNodes(line, `${keyPrefix}-${partIndex}`);
      elements.push(
        <s-text key={`${keyPrefix}-line-${partIndex}`}>
          {content.length ? content : '\u00a0'}
        </s-text>,
      );
      partIndex += 1;
    });
  }

  nodes.forEach((node) => {
    if (node.type === 'hr') {
      flushLines();
      elements.push(<s-divider key={`${keyPrefix}-hr-${partIndex}`} />);
      partIndex += 1;
      return;
    }

    inline.push(node);
  });
  flushLines();
  return elements;
}

/**
 * @param {string} text
 */
export function renderMerchantContent(text) {
  const source = String(text || '');
  const blocks = containsMerchantHtml(source)
    ? blocksFromHtml(parseMerchantHtml(source))
    : blocksFromPlainText(source);

  return (
    <s-stack gap="base" inlineSize="100%">
      {blocks.map((block, blockIndex) => {
        if (block.type === 'rule') {
          return <s-divider key={`rule-${blockIndex}`} />;
        }

        if (block.type === 'list') {
          return (
            <s-unordered-list key={`list-${blockIndex}`}>
              {block.items.map((item, itemIndex) => (
                <s-list-item key={`${blockIndex}-${itemIndex}`}>
                  <s-stack gap="none">
                    {renderFlow(item, `${blockIndex}-${itemIndex}`)}
                  </s-stack>
                </s-list-item>
              ))}
            </s-unordered-list>
          );
        }

        return (
          <s-stack key={`text-${blockIndex}`} gap="none">
            {renderFlow(block.children, `text-${blockIndex}`)}
          </s-stack>
        );
      })}
    </s-stack>
  );
}
