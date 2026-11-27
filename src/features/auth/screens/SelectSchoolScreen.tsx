/** Teacher/parent entry point — pick your school before logging in. */
import React, {useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StatusBar, StyleSheet, TextInput, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Circle, Path} from 'react-native-svg';
import {lightTheme, ThemeContext, useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, BackButton, Spacer} from '../../../shared/components';
import {useSchools} from '../schoolApi';
import type {AuthScreenProps} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {SchoolSummary} from '../../../shared/types';
import {ArrowRightIcon} from '../../../assets/svg/svgIcons';

const ACCENT = {accent: '#4F46E5', accentLight: '#EEF2FF'} as const;

function SearchIcon({color}: {color: string}) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Circle cx="9" cy="9" r="6" stroke={color} strokeWidth={2} />
      <Path d="M13.5 13.5L18 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function SelectSchoolScreen({route, navigation}: AuthScreenProps<'SelectSchool'>): React.JSX.Element {
  const themeCtx = useTheme();
  const theme = lightTheme;
  const insets = useSafeAreaInsets();
  const {t} = useLanguage();
  const {role} = route.params;
  const [search, setSearch] = useState('');
  const {data: schools, isLoading} = useSchools(search);

  const colors = ACCENT;

  const onSelect = (school: SchoolSummary): void => {
    navigation.navigate(ScreenNames.Login, {role, schoolId: school.id, schoolName: school.name});
  };

  const renderHeader = () => (
    <>
      {/* Back button */}
      <View style={{paddingTop: insets.top + theme.spacing.sm}}>
        <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
      </View>

      {/* Hero */}
      <View style={styles.heroSection}>
        <AppText variant="h1" style={styles.heading}>
          {t('selectSchool_headerTitle')}
        </AppText>
        <Spacer size={6} />
        <AppText variant="body" color="textSecondary">
          Search and select your school to continue
        </AppText>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <SearchIcon color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('selectSchool_searchPlaceholder')}
          placeholderTextColor="#94A3B8"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
              <Circle cx="9" cy="9" r="8" fill="#E2E8F0" />
              <Path d="M6 6L12 12M12 6L6 12" stroke="#64748B" strokeWidth={1.6} strokeLinecap="round" />
            </Svg>
          </Pressable>
        )}
      </View>
      <Spacer size={16} />
    </>
  );

  return (
    <ThemeContext.Provider value={{...themeCtx, theme: lightTheme}}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        <FlatList
          data={isLoading ? [] : (schools ?? [])}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({item}) => (
            <Pressable
              onPress={() => onSelect(item)}
              style={({pressed}) => [styles.card, pressed && styles.cardPressed]}>
              <View style={[styles.initialCircle, {backgroundColor: colors.accentLight}]}>
                <AppText variant="bodyBold" style={{color: colors.accent, fontSize: 18}}>
                  {item.name.charAt(0).toUpperCase()}
                </AppText>
              </View>
              <View style={styles.textBlock}>
                <AppText variant="bodyBold">{item.name}</AppText>
                {item.city ? (
                  <>
                    <Spacer size={2} />
                    <AppText variant="label" color="textSecondary">{item.city}</AppText>
                  </>
                ) : null}
              </View>
              <View style={[styles.arrowBtn, {backgroundColor: colors.accentLight}]}>
                <ArrowRightIcon color={colors.accent} />
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.centerWrap}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Spacer size={12} />
                <AppText variant="body" color="textSecondary">{t('selectSchool_loading')}</AppText>
              </View>
            ) : (
              <View style={styles.centerWrap}>
                <AppText variant="bodyBold" color="textSecondary" center>
                  {t('selectSchool_emptyTitle')}
                </AppText>
                <Spacer size={4} />
                <AppText variant="caption" color="textSecondary" center>
                  {t('selectSchool_emptyMessage')}
                </AppText>
              </View>
            )
          }
        />

        {/* Background decorative wave */}
        <View style={styles.bgWave} pointerEvents="none">
          <Svg width="100%" height={140} viewBox="0 0 400 140" preserveAspectRatio="none">
            <Path d="M0,70 C60,30 140,90 220,55 C300,20 360,75 400,50 L400,140 L0,140Z" fill={colors.accent} opacity={0.06} />
            <Path d="M0,95 C80,60 180,110 260,80 C340,50 390,85 400,70 L400,140 L0,140Z" fill={colors.accent} opacity={0.04} />
          </Svg>
        </View>
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  heroSection: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1E293B',
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{scale: 0.98}],
  },
  initialCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    marginLeft: 12,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  bgWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
