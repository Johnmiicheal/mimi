"use client";

import { Fragment } from "react";
import { NumberStepper } from "@/components/inline-ui/NumberStepper";
import { PriceStepper } from "@/components/inline-ui/PriceStepper";
import { DatePicker } from "@/components/inline-ui/DatePicker";
import { CountryPicker, type Country } from "@/components/inline-ui/CountryPicker";
import { ToggleChip } from "@/components/inline-ui/ToggleChip";
import { Slider } from "@/components/inline-ui/Slider";
import { Select } from "@/components/inline-ui/Select";
import { VotingButtons } from "@/components/inline-ui/VotingButtons";
import { parseInlineUI, type ParsedSegment } from "./parser";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { parseItinerary } from "@/lib/utils/parse-itinerary";

interface InlineUIRendererProps {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlValues: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onControlChange: (id: string, value: any) => void;
}

// Apply **bold**, *italic*, `code` to a plain string — returns React nodes
function applyInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  if (!text) return [];
  const regex = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const raw = m[0];
    if (raw.startsWith('**')) {
      parts.push(<strong key={`${keyPrefix}-${m.index}`}>{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith('*')) {
      parts.push(<em key={`${keyPrefix}-${m.index}`}>{raw.slice(1, -1)}</em>);
    } else {
      parts.push(
        <code
          key={`${keyPrefix}-${m.index}`}
          className="px-1 py-0.5 bg-white/15 rounded text-xs font-mono text-white/90"
        >
          {raw.slice(1, -1)}
        </code>
      );
    }
    last = m.index + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

// Render a single ParsedSegment as a React node
function renderSegment(
  segment: ParsedSegment,
  idx: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlValues: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onControlChange: (id: string, value: any) => void,
  lineKey: string
): React.ReactNode {
  const key = `${lineKey}-seg-${idx}`;

  if (segment.type === 'text') {
    const nodes = applyInlineMarkdown(segment.content, key);
    return <Fragment key={key}>{nodes}</Fragment>;
  }

  if (!segment.controlId) return null;
  const id = segment.controlId;

  if (segment.type === 'stepper') {
    return (
      <NumberStepper
        key={key}
        value={controlValues[id] ?? 1}
        onChange={(v) => onControlChange(id, v)}
        min={1}
        max={99}
      />
    );
  }
  if (segment.type === 'price') {
    return (
      <PriceStepper
        key={key}
        value={controlValues[id] ?? 1000}
        onChange={(v) => onControlChange(id, v)}
        min={0}
        max={100000}
        step={50}
      />
    );
  }
  if (segment.type === 'date') {
    return (
      <DatePicker
        key={key}
        value={controlValues[id] ?? new Date()}
        onChange={(v) => onControlChange(id, v)}
      />
    );
  }
  if (segment.type === 'country') {
    const defaultCountry: Country = { code: 'US', name: 'United States', flag: '🇺🇸' };
    return (
      <CountryPicker
        key={key}
        value={controlValues[id] ?? defaultCountry}
        onChange={(v) => onControlChange(id, v)}
      />
    );
  }
  if (segment.type === 'toggle') {
    return (
      <ToggleChip
        key={key}
        label={segment.props?.label ?? id}
        value={controlValues[id] ?? segment.props?.defaultValue ?? false}
        onChange={(v) => onControlChange(id, v)}
      />
    );
  }
  if (segment.type === 'slider') {
    return (
      <Slider
        key={key}
        value={controlValues[id] ?? segment.props?.min ?? 0}
        onChange={(v) => onControlChange(id, v)}
        min={segment.props?.min ?? 0}
        max={segment.props?.max ?? 100}
        step={segment.props?.step ?? 1}
        formatValue={(v) => `$${v.toLocaleString()}`}
        label={id}
      />
    );
  }
  if (segment.type === 'select') {
    const options = segment.props?.options ?? [];
    return (
      <Select
        key={key}
        value={controlValues[id] ?? options[0]?.value ?? ''}
        onChange={(v) => onControlChange(id, v)}
        options={options}
      />
    );
  }
  if (segment.type === 'voting') {
    return (
      <VotingButtons
        key={key}
        upvotes={segment.props?.upvotes ?? 0}
        downvotes={segment.props?.downvotes ?? 0}
        userVote={controlValues[id] ?? null}
        onVote={(v) => onControlChange(id, v)}
      />
    );
  }
  return null;
}

// Render the mixed content of a single line (text + inline UI controls)
function renderLineSegments(
  line: string,
  lineKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlValues: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onControlChange: (id: string, value: any) => void
): React.ReactNode[] {
  const segments = parseInlineUI(line);
  return segments.map((seg, i) => renderSegment(seg, i, controlValues, onControlChange, lineKey));
}

function renderMarkdownBlock(
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlValues: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onControlChange: (id: string, value: any) => void,
  keyOffset = 0
): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  const listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' = 'ul';
  let k = keyOffset;
  const nextKey = () => `md-${k++}`;

  function flushList() {
    if (listItems.length === 0) return;
    const key = nextKey();
    if (listType === 'ul') {
      elements.push(
        <ul key={key} className="list-disc list-inside space-y-1 my-2 text-sm">
          {[...listItems]}
        </ul>
      );
    } else {
      elements.push(
        <ol key={key} className="list-decimal list-inside space-y-1 my-2 text-sm">
          {[...listItems]}
        </ol>
      );
    }
    listItems.length = 0;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineKey = `line-${keyOffset + i}`;

    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={nextKey()} className="text-sm font-semibold mt-4 mb-1 text-white">
          {renderLineSegments(line.slice(4), lineKey, controlValues, onControlChange)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={nextKey()} className="text-base font-bold mt-4 mb-2 text-white">
          {renderLineSegments(line.slice(3), lineKey, controlValues, onControlChange)}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={nextKey()} className="text-lg font-bold mt-4 mb-2 text-white">
          {renderLineSegments(line.slice(2), lineKey, controlValues, onControlChange)}
        </h1>
      );
    } else if (/^---+$/.test(line) || /^\*\*\*+$/.test(line) || /^___+$/.test(line)) {
      flushList();
      elements.push(
        <hr key={nextKey()} className="my-3 border-white/20" />
      );
    } else if (/^[-*+] /.test(line)) {
      listType = 'ul';
      const lk = nextKey();
      listItems.push(
        <li key={lk} className="flex items-start gap-1">
          <span className="mt-0.5 shrink-0">•</span>
          <span>{renderLineSegments(line.slice(2), lineKey, controlValues, onControlChange)}</span>
        </li>
      );
    } else if (/^\d+\. /.test(line)) {
      listType = 'ol';
      const lk = nextKey();
      const num = line.match(/^(\d+)\. /)?.[1] ?? '';
      listItems.push(
        <li key={lk} className="flex items-start gap-1">
          <span className="shrink-0 text-gray-500">{num}.</span>
          <span>{renderLineSegments(line.replace(/^\d+\. /, ''), lineKey, controlValues, onControlChange)}</span>
        </li>
      );
    } else if (line === '') {
      flushList();
      if (elements.length > 0) {
        elements.push(<div key={nextKey()} className="h-2" />);
      }
    } else {
      flushList();
      const content = renderLineSegments(line, lineKey, controlValues, onControlChange);
      elements.push(
        <p key={nextKey()} className="leading-relaxed text-sm">
          {content}
        </p>
      );
    }
  }

  flushList();
  return <>{elements}</>;
}

export function InlineUIRenderer({ text, controlValues, onControlChange }: InlineUIRendererProps) {
  // Detect itinerary — if we have ≥2 complete Day sections, render as Kanban
  const DAY_HEADING_RE = /^#{2,3}\s+Day\s+\d+/im;
  const firstDayIdx = text.search(DAY_HEADING_RE);

  if (firstDayIdx !== -1) {
    const schedule = parseItinerary(text.slice(firstDayIdx));
    if (schedule && schedule.length >= 2) {
      const preText = text.slice(0, firstDayIdx).trimEnd();
      // Find where the itinerary ends (next non-Day ## heading or end of text)
      const afterItinerary = text.slice(firstDayIdx);
      const dayLines = afterItinerary.split('\n');
      let itinEnd = dayLines.length;
      let inItinerary = false;
      for (let i = 0; i < dayLines.length; i++) {
        if (/^#{2,3}\s+Day\s+\d+/i.test(dayLines[i])) {
          inItinerary = true;
        } else if (inItinerary && /^#{1,2}\s+(?!Day\s)/i.test(dayLines[i])) {
          itinEnd = i;
          break;
        }
      }
      const postText = dayLines.slice(itinEnd).join('\n').trimStart();

      return (
        <div className="space-y-0.5">
          {preText && renderMarkdownBlock(preText, controlValues, onControlChange, 0)}
          <div className="my-4">
            <KanbanBoard schedule={schedule} />
          </div>
          {postText && renderMarkdownBlock(postText, controlValues, onControlChange, 10000)}
        </div>
      );
    }
  }

  // No itinerary — standard markdown rendering
  return (
    <div className="space-y-0.5">
      {renderMarkdownBlock(text, controlValues, onControlChange)}
    </div>
  );
}
