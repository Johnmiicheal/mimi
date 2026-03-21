import { ReactNode } from "react";

export interface ParsedSegment {
  type: 'text' | 'stepper' | 'price' | 'date' | 'country' | 'toggle' | 'slider' | 'select' | 'voting';
  content: string;
  controlId?: string;
  props?: Record<string, any>;
}

/**
 * Parse inline UI syntax from AI responses
 *
 * Supported syntax:
 * - {{+[travelers]-}} → NumberStepper
 * - {{+[$budget]-}} → PriceStepper
 * - {{::date-picker[departure]}} → DatePicker
 * - {{::country[destination]}} → CountryPicker
 * - {{[x] Culture}} → ToggleChip
 * - {{::slider[budget|min:500|max:10000]}} → Slider
 * - {{::select[pace|relaxed,moderate,packed]}} → Select
 * - {{::vote[activity1|up:5|down:2]}} → VotingButtons
 */
export function parseInlineUI(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;

  // Regex patterns for each inline UI type
  const patterns = {
    stepper: /\{\{[+]\[([a-zA-Z0-9_]+)\][-]\}\}/g,
    price: /\{\{[+]\[\$([a-zA-Z0-9_]+)\][-]\}\}/g,
    date: /\{\{::date-picker\[([a-zA-Z0-9_]+)\]\}\}/g,
    country: /\{\{::country\[([a-zA-Z0-9_]+)\]\}\}/g,
    toggle: /\{\{\[(x| )\]\s*([a-zA-Z0-9_ ]+)\}\}/g,
    slider: /\{\{::slider\[([a-zA-Z0-9_]+)\|min:(\d+)\|max:(\d+)(?:\|step:(\d+))?\]\}\}/g,
    select: /\{\{::select\[([a-zA-Z0-9_]+)\|([a-zA-Z0-9_,]+)\]\}\}/g,
    voting: /\{\{::vote\[([a-zA-Z0-9_]+)\|up:(\d+)\|down:(\d+)\]\}\}/g,
  };

  // Find all matches
  const allMatches: Array<{
    index: number;
    length: number;
    type: string;
    controlId: string;
    raw: string;
    props?: Record<string, any>;
  }> = [];

  // Find stepper matches
  let match;
  while ((match = patterns.stepper.exec(text)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'stepper',
      controlId: match[1],
      raw: match[0],
    });
  }

  // Find price stepper matches
  while ((match = patterns.price.exec(text)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'price',
      controlId: match[1],
      raw: match[0],
    });
  }

  // Find date picker matches
  while ((match = patterns.date.exec(text)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'date',
      controlId: match[1],
      raw: match[0],
    });
  }

  // Find country picker matches
  while ((match = patterns.country.exec(text)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'country',
      controlId: match[1],
      raw: match[0],
    });
  }

  // Find toggle chip matches
  while ((match = patterns.toggle.exec(text)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'toggle',
      controlId: match[2].toLowerCase().replace(/\s+/g, '_'),
      raw: match[0],
      props: {
        label: match[2],
        defaultValue: match[1] === 'x',
      },
    });
  }

  // Find slider matches
  while ((match = patterns.slider.exec(text)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'slider',
      controlId: match[1],
      raw: match[0],
      props: {
        min: parseInt(match[2]),
        max: parseInt(match[3]),
        step: match[4] ? parseInt(match[4]) : 1,
      },
    });
  }

  // Find select matches
  while ((match = patterns.select.exec(text)) !== null) {
    const options = match[2].split(',').map(opt => ({
      value: opt.trim(),
      label: opt.trim().charAt(0).toUpperCase() + opt.trim().slice(1),
    }));
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'select',
      controlId: match[1],
      raw: match[0],
      props: {
        options,
      },
    });
  }

  // Find voting matches
  while ((match = patterns.voting.exec(text)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'voting',
      controlId: match[1],
      raw: match[0],
      props: {
        upvotes: parseInt(match[2]),
        downvotes: parseInt(match[3]),
      },
    });
  }

  // Sort by index
  allMatches.sort((a, b) => a.index - b.index);

  // Build segments
  for (const match of allMatches) {
    // Add text before this match
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) {
        segments.push({
          type: 'text',
          content: textBefore,
        });
      }
    }

    // Add the control
    segments.push({
      type: match.type as any,
      content: match.raw,
      controlId: match.controlId,
      props: match.props,
    });

    lastIndex = match.index + match.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    if (remaining) {
      segments.push({
        type: 'text',
        content: remaining,
      });
    }
  }

  // If no matches found, return the whole text
  if (segments.length === 0) {
    return [{ type: 'text', content: text }];
  }

  return segments;
}
