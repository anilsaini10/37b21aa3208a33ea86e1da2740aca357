/** A registered school — the tenant a teacher/parent picks before logging in. */
import type {ID} from './common';

export interface SchoolSummary {
  id: ID;
  name: string;
  city?: string;
}
