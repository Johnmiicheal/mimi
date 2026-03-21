import { useCallback, useRef, useEffect } from 'react';

interface ControlChange {
  controlId: string;
  value: any;
  timestamp: number;
}

interface UseReplanOptions {
  onReplan: (changes: Map<string, any>) => void;
  debounceMs?: number;
}

/**
 * Hook to manage control changes and trigger replanning
 * Debounces changes to avoid excessive API calls
 */
export function useReplan({ onReplan, debounceMs = 1000 }: UseReplanOptions) {
  const changesRef = useRef<Map<string, ControlChange>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleControlChange = useCallback((controlId: string, value: any) => {
    // Store the change
    changesRef.current.set(controlId, {
      controlId,
      value,
      timestamp: Date.now(),
    });

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for replan
    timeoutRef.current = setTimeout(() => {
      if (changesRef.current.size > 0) {
        // Convert changes to simple map of controlId -> value
        const changeMap = new Map<string, any>();
        changesRef.current.forEach((change) => {
          changeMap.set(change.controlId, change.value);
        });

        // Trigger replan
        onReplan(changeMap);

        // Clear changes
        changesRef.current.clear();
      }
    }, debounceMs);
  }, [onReplan, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { handleControlChange };
}

/**
 * Formats control changes into a natural language prompt for the AI
 */
export function formatReplanPrompt(changes: Map<string, any>): string {
  const changeDescriptions: string[] = [];

  changes.forEach((value, controlId) => {
    // Parse control ID to understand what changed
    switch (controlId) {
      case 'travelers':
        changeDescriptions.push(`${value} traveler${value !== 1 ? 's' : ''}`);
        break;
      case 'budget':
        changeDescriptions.push(`budget of $${value} per person`);
        break;
      case 'nights':
      case 'days':
        changeDescriptions.push(`${value} night${value !== 1 ? 's' : ''}`);
        break;
      case 'departure':
        changeDescriptions.push(`departure on ${value}`);
        break;
      case 'destination':
        changeDescriptions.push(`destination to ${value}`);
        break;
      case 'pace':
        changeDescriptions.push(`${value} pace`);
        break;
      case 'budgetRange':
        changeDescriptions.push(`budget range: $${value.min}-$${value.max}`);
        break;
      default:
        changeDescriptions.push(`${controlId}: ${value}`);
    }
  });

  if (changeDescriptions.length === 0) {
    return 'Please update the plan.';
  }

  const changesText = changeDescriptions.join(', ');
  return `I've updated my preferences: ${changesText}. Please regenerate the travel plan with these new parameters. Keep the same destination and general style, but adjust everything else to match my new requirements.`;
}
