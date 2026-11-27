/** Language icon button — opens a bottom sheet to pick the app language. */
import React, {useState} from 'react';
import {Pressable, View, type StyleProp, type ViewStyle} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {LANGUAGES, useLanguage} from '../../core/i18n';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {CustomBottomSheet} from './CustomBottomSheet';

export interface LanguageSwitcherProps {
  /** Icon tint — override when placed over a dark/image background. */
  iconColor?: string;
  /** Show selected language code label (e.g. "EN") next to the icon. */
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function LanguageSwitcher({iconColor, showLabel, style}: LanguageSwitcherProps): React.JSX.Element {
  const {theme} = useTheme();
  const {language, setLanguage, t} = useLanguage();
  const [open, setOpen] = useState(false);
  const styles = useThemedStyles(t2 => ({
    trigger: {
      width: 40,
      height: 40,
      borderRadius: t2.radius.pill,
      backgroundColor: t2.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    triggerWithLabel: {
      flexDirection: 'row',
      height: 40,
      paddingHorizontal: t2.spacing.sm + 2,
      borderRadius: t2.radius.pill,
      backgroundColor: t2.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    languageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: t2.spacing.md,
    },
  }));

  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={8} style={[showLabel ? styles.triggerWithLabel : styles.trigger, style]}>
        <Icon name="globe" size={20} color={iconColor ?? theme.colors.text} />
        {showLabel ? (
          <AppText variant="label" style={{marginLeft: 4, color: iconColor ?? theme.colors.text, fontWeight: '700'}}>
            {language.toUpperCase()}
          </AppText>
        ) : null}
      </Pressable>

      <CustomBottomSheet visible={open} onClose={() => setOpen(false)} title={t('selectLanguage')}>
        {LANGUAGES.map(item => (
          <Pressable
            key={item.code}
            onPress={() => {
              setLanguage(item.code);
              setOpen(false);
            }}
            style={styles.languageRow}>
            <View>
              <AppText variant="bodyBold">{item.nativeLabel}</AppText>
              {item.nativeLabel !== item.label ? (
                <AppText variant="caption" color="textSecondary">
                  {item.label}
                </AppText>
              ) : null}
            </View>
            {language === item.code ? <Icon name="check" size={20} color={theme.colors.primary} /> : null}
          </Pressable>
        ))}
      </CustomBottomSheet>
    </>
  );
}
