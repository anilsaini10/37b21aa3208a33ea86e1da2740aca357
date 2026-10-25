/**
 * Event / academic-calendar entry types — labels, colours, icons and which ones close
 * the school. One place, so the events list, event form, filters and the academic
 * calendar all stay in sync when a type is added.
 */
import {useLanguage} from '../../core/i18n';
import type {BadgeTone} from '../../shared/components';
import type {EventType} from '../../shared/types';

/** Display order (selects, filter chips, legend). */
export const EVENT_TYPES: EventType[] = [
  'HOLIDAY',
  'GOVERNMENT_HOLIDAY',
  'VACATION',
  'EXAM',
  'MEETING',
  'ACTIVITY',
  'OTHER',
];

/** Types on which the school is closed. */
export const SCHOOL_CLOSED_TYPES = new Set<EventType>(['HOLIDAY', 'GOVERNMENT_HOLIDAY', 'VACATION']);

/** Calendar colour per type: red, dark red, orange, purple, blue, green, grey. */
export const EVENT_TYPE_COLOR: Record<EventType, string> = {
  HOLIDAY: '#E53935',
  GOVERNMENT_HOLIDAY: '#8E1B1B',
  VACATION: '#F57C00',
  EXAM: '#7E57C2',
  MEETING: '#1E88E5',
  ACTIVITY: '#43A047',
  OTHER: '#9E9E9E',
};

export const EVENT_TYPE_TONE: Record<EventType, BadgeTone> = {
  HOLIDAY: 'error',
  GOVERNMENT_HOLIDAY: 'error',
  VACATION: 'warning',
  EXAM: 'primary',
  MEETING: 'info',
  ACTIVITY: 'success',
  OTHER: 'neutral',
};

export const EVENT_TYPE_ICON: Record<EventType, string> = {
  HOLIDAY: 'sun',
  GOVERNMENT_HOLIDAY: 'sun',
  VACATION: 'calendar',
  EXAM: 'exam',
  MEETING: 'chat',
  ACTIVITY: 'star',
  OTHER: 'event',
};

/** When several entries cover one date, the colour of the highest-priority one wins: closed types, then exam, then the rest. */
export const EVENT_TYPE_PRIORITY: Record<EventType, number> = {
  GOVERNMENT_HOLIDAY: 7,
  HOLIDAY: 6,
  VACATION: 5,
  EXAM: 4,
  MEETING: 3,
  ACTIVITY: 2,
  OTHER: 1,
};

export function useEventTypeLabels(): Record<EventType, string> {
  const {t} = useLanguage();
  return {
    HOLIDAY: t('eventForm_typeHoliday'),
    GOVERNMENT_HOLIDAY: t('eventForm_typeGovernmentHoliday'),
    VACATION: t('eventForm_typeVacation'),
    EXAM: t('eventForm_typeExam'),
    MEETING: t('eventForm_typeMeeting'),
    ACTIVITY: t('eventForm_typeActivity'),
    OTHER: t('eventForm_typeOther'),
  };
}

/** Filter chips on the teacher / parent calendar — each groups one or more types (client-side filter). */
export type CalendarFilter = 'ALL' | 'HOLIDAYS' | 'VACATION' | 'EXAMS' | 'EVENTS';

export const CALENDAR_FILTER_TYPES: Record<Exclude<CalendarFilter, 'ALL'>, EventType[]> = {
  HOLIDAYS: ['HOLIDAY', 'GOVERNMENT_HOLIDAY'],
  VACATION: ['VACATION'],
  EXAMS: ['EXAM'],
  EVENTS: ['MEETING', 'ACTIVITY', 'OTHER'],
};

/** Chip colour per filter — the colour of the group's main type. */
export const CALENDAR_FILTER_COLOR: Record<Exclude<CalendarFilter, 'ALL'>, string> = {
  HOLIDAYS: EVENT_TYPE_COLOR.HOLIDAY,
  VACATION: EVENT_TYPE_COLOR.VACATION,
  EXAMS: EVENT_TYPE_COLOR.EXAM,
  EVENTS: EVENT_TYPE_COLOR.MEETING,
};
