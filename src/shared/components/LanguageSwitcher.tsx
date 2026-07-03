/** Language icon button — opens a bottom sheet to pick the app language. */
import React, {useState} from 'react';
import {Pressable, View, type StyleProp, type ViewStyle} from 'react-native';
import {useTheme} from '../../core/theme';
import {LANGUAGES, useLanguage} from '../../core/i18n';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {CustomBottomSheet} from './CustomBottomSheet';

export interface LanguageSwitcherProps {
  /** Icon tint — override when placed over a dark/image background. */
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function LanguageSwitcher({iconColor, style}: LanguageSwitcherProps): React.JSX.Element {
  const {theme} = useTheme();
  const {language, setLanguage, t} = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={[
          {
            width: 40,
            height: 40,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.overlay,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}>
        <Icon name="globe" size={20} color={iconColor ?? theme.colors.text} />
      </Pressable>

      <CustomBottomSheet visible={open} onClose={() => setOpen(false)} title={t('selectLanguage')}>
        {LANGUAGES.map(item => (
          <Pressable
            key={item.code}
            onPress={() => {
              setLanguage(item.code);
              setOpen(false);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: theme.spacing.md,
            }}>
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
