import { describe, it, expect } from 'vitest';
import { LAYER_COLORS, LAYER_CLASSES, LAYER_LABELS, TYPE_COLORS, TYPE_LABELS } from '@/lib/analytics-colors';

describe('analytics-colors', () => {
  it('defines colors for all memory layers', () => {
    const layers = ['IDENTITY', 'PROJECT', 'SESSION', 'TASK', 'INSIGHT'];
    for (const layer of layers) {
      expect(LAYER_COLORS[layer]).toBeDefined();
      expect(LAYER_CLASSES[layer]).toBeDefined();
      expect(LAYER_LABELS[layer]).toBeDefined();
    }
  });

  it('defines colors for all memory types', () => {
    const types = ['CONSTRAINT', 'PREFERENCE', 'FACT', 'TASK', 'EVENT', 'LESSON'];
    for (const type of types) {
      expect(TYPE_COLORS[type]).toBeDefined();
      expect(TYPE_LABELS[type]).toBeDefined();
    }
  });

  it('uses consistent color mapping for layers', () => {
    expect(LAYER_COLORS['IDENTITY']).toBe('#3B82F6'); // Blue
    expect(LAYER_COLORS['PROJECT']).toBe('#22C55E');   // Green
    expect(LAYER_COLORS['SESSION']).toBe('#EAB308');   // Yellow
    expect(LAYER_COLORS['TASK']).toBe('#8B5CF6');      // Purple
    expect(LAYER_COLORS['INSIGHT']).toBe('#F59E0B');   // Amber
  });

  it('layer classes match Tailwind conventions', () => {
    expect(LAYER_CLASSES['IDENTITY']).toContain('bg-blue');
    expect(LAYER_CLASSES['PROJECT']).toContain('bg-green');
  });
});
