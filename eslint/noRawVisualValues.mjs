/**
 * Design-system enforcement: components consume visual values only through semantic tokens
 * (bg-surface, text-muted, border-default …). This rule rejects, inside string and template
 * literals, the four ways of bypassing them.
 */
const PALETTES =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const COLOR_UTILITIES =
  'bg|text|border|ring|outline|from|via|to|fill|stroke|divide|placeholder|accent|caret|decoration|shadow|inset-ring';

const CHECKS = [
  {
    id: 'palette',
    pattern: new RegExp(
      `(?:^|[\\s:"'\`])(?:[a-z-]+:)*(?:${COLOR_UTILITIES})-(?:${PALETTES})-\\d{2,3}(?:/\\d+)?(?=$|[\\s"'\`])`,
    ),
    message: 'Raw palette class "{{match}}": use a semantic colour token (bg-surface, text-muted, border-default …).',
  },
  {
    id: 'white-black',
    pattern: new RegExp(`(?:^|[\\s:"'\`])(?:[a-z-]+:)*(?:${COLOR_UTILITIES})-(?:white|black)(?:/\\d+)?(?=$|[\\s"'\`])`),
    message: 'Raw colour class "{{match}}": use a semantic colour token (bg-surface, text-inverted …).',
  },
  {
    id: 'hex',
    pattern: /#[0-9a-fA-F]{3,8}\b/,
    message: 'Hex colour "{{match}}": add a token to globals.css and use its utility class.',
  },
  {
    id: 'arbitrary',
    pattern: /\[[^\]\s]*?(?:\d(?:px|rem|em|%|vh|vw)|#[0-9a-fA-F]{3,8}|rgb|hsl)[^\]\s]*\]/,
    message: 'Arbitrary value "{{match}}": add a token (spacing, radius, colour …) instead of hard-coding it.',
  },
  {
    id: 'dark-pair',
    pattern: new RegExp(`(?:^|[\\s"'\`])dark:(?:[a-z-]+:)*(?:${COLOR_UTILITIES})-`),
    message:
      'Paired dark colour class "{{match}}": light and dark are defined once in the token layer, never per component.',
  },
];

const check = (context, node, text) => {
  for (const { pattern, message } of CHECKS) {
    const found = pattern.exec(text);
    if (found) {
      context.report({ node, message, data: { match: found[0].trim() } });
      return;
    }
  }
};

export const noRawVisualValues = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow raw colours, arbitrary values and dark: colour pairs outside the design tokens' },
    schema: [],
  },
  create: (context) => ({
    Literal: (node) => {
      if (typeof node.value === 'string') {
        check(context, node, node.value);
      }
    },
    TemplateElement: (node) => check(context, node, node.value.raw),
  }),
};
