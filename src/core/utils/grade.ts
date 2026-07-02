/** Grade computation from percentage using a configurable grade system. */
import type {GradeBand} from '../../shared/types/exam';

export const DEFAULT_GRADE_BANDS: GradeBand[] = [
  {grade: 'A+', minPercentage: 90, maxPercentage: 100, point: 10},
  {grade: 'A', minPercentage: 80, maxPercentage: 89.99, point: 9},
  {grade: 'B+', minPercentage: 70, maxPercentage: 79.99, point: 8},
  {grade: 'B', minPercentage: 60, maxPercentage: 69.99, point: 7},
  {grade: 'C', minPercentage: 50, maxPercentage: 59.99, point: 6},
  {grade: 'D', minPercentage: 40, maxPercentage: 49.99, point: 5},
  {grade: 'F', minPercentage: 0, maxPercentage: 39.99, point: 0},
];

export function percentage(obtained: number, max: number): number {
  if (max <= 0) {
    return 0;
  }
  return Math.round((obtained / max) * 10000) / 100;
}

export function gradeFor(pct: number, bands: GradeBand[] = DEFAULT_GRADE_BANDS): string {
  const clamped = Math.min(Math.max(pct, 0), 100);
  const band = bands.find(b => clamped >= b.minPercentage && clamped <= b.maxPercentage);
  return band?.grade ?? 'F';
}

export function gradePoint(pct: number, bands: GradeBand[] = DEFAULT_GRADE_BANDS): number {
  const clamped = Math.min(Math.max(pct, 0), 100);
  const band = bands.find(b => clamped >= b.minPercentage && clamped <= b.maxPercentage);
  return band?.point ?? 0;
}
