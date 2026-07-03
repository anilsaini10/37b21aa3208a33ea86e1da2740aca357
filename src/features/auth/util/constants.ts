import type {TranslationKey} from '../../../core/i18n';
import type {UserRole} from '../../../shared/types';

const HERO_HEIGHT = 340;
const LOGO_SIZE = 84;
const BACKGROUND_IMAGE = require('../../../assets/images/school-building.jpg');
const ROLES: {role: UserRole; titleKey: TranslationKey; descKey: TranslationKey; icon: string}[] = [
  {role: 'admin', titleKey: 'roleAdminTitle', descKey: 'roleAdminDesc', icon: 'settings'},
  {role: 'teacher', titleKey: 'roleTeacherTitle', descKey: 'roleTeacherDesc', icon: 'teacher'},
  {role: 'parent', titleKey: 'roleParentTitle', descKey: 'roleParentDesc', icon: 'parent'},
];

export const Constants = {
    HERO_HEIGHT,
    LOGO_SIZE,
    ROLES,
    BACKGROUND_IMAGE
};

