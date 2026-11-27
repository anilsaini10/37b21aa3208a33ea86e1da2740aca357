/** Entry screen — choose which portal to log into. */
import React from 'react';
import {Image, Pressable, ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Circle, G, Path, Rect} from 'react-native-svg';
import {Defs, Ellipse, LinearGradient, Stop} from 'react-native-svg';
import {lightTheme, ThemeContext, useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, LanguageSwitcher, Row, Spacer} from '../../../shared/components';
import type {AuthScreenProps} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {UserRole} from '../../../shared/types';
import {Constants} from '../util/constants';
import {RoleAdminIllustration, RoleTeacherIllustration, RoleParentIllustration, ArrowRightIcon, CardWave, DotGrid} from '../../../assets/svg/svgIcons';

const ROLE_STYLE = {
  admin:   {iconBg: '#3B82F6', wave: '#93C5FD', arrowBg: '#DBEAFE', arrow: '#3B82F6'},
  teacher: {iconBg: '#10B981', wave: '#6EE7B7', arrowBg: '#D1FAE5', arrow: '#10B981'},
  parent:  {iconBg: '#8B5CF6', wave: '#C4B5FD', arrowBg: '#EDE9FE', arrow: '#8B5CF6'},
} as const;

const ROLE_ICON: Record<string, React.FC> = {
  admin: RoleAdminIllustration,
  teacher: RoleTeacherIllustration,
  parent: RoleParentIllustration,
};

/* ── Hero illustration: graduation cap + stacked books ── */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const educationHeroImg = require('../../../assets/images/education_hero.webp');

function HeroIllustration() {
  return (
    <View style={styles.heroWrap}>
      <Image source={educationHeroImg} style={{width: 140, height: 140}} resizeMode="contain" />
    </View>
  );
}

//  ── SVG HeroIllustration (commented out — uncomment to use instead of PNG) ──
function HeroIllustrationSVG() {
  return (
    <View style={styles.heroWrap}>
      <Svg width={150} height={138} viewBox="0 0 240 220" fill="none">
        <Defs>
          <LinearGradient id="blueBook" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#60A5FA" />
            <Stop offset="0.45" stopColor="#2563EB" />
            <Stop offset="1" stopColor="#1D4ED8" />
          </LinearGradient>
          <LinearGradient id="whiteBook" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.6" stopColor="#F1F5F9" />
            <Stop offset="1" stopColor="#CBD5E1" />
          </LinearGradient>
          <LinearGradient id="orangeBook" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FDBA74" />
            <Stop offset="0.4" stopColor="#F97316" />
            <Stop offset="1" stopColor="#C2410C" />
          </LinearGradient>
          <LinearGradient id="pages" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#E2E8F0" />
          </LinearGradient>
          <LinearGradient id="cap" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#475569" />
            <Stop offset="0.4" stopColor="#1E293B" />
            <Stop offset="1" stopColor="#020617" />
          </LinearGradient>
          <LinearGradient id="capBoard" x1="0" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor="#475569" />
            <Stop offset="0.5" stopColor="#1E293B" />
            <Stop offset="1" stopColor="#0F172A" />
          </LinearGradient>
          <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FEF3C7" />
            <Stop offset="0.35" stopColor="#FBBF24" />
            <Stop offset="0.7" stopColor="#D97706" />
            <Stop offset="1" stopColor="#FDE68A" />
          </LinearGradient>
        </Defs>

        {/* {/ * Ground shadow * /} */}
        <Ellipse cx="120" cy="207" rx="102" ry="9" fill="#0F172A" opacity={0.13} />

        {/* {/ * BLUE BOOK * /} */}
        <Path d="M188 160 L207 149 L207 188 L188 202 Z" fill="#1E40AF" />
        <Path d="M188 165 L207 154 L207 185 L188 197 Z" fill="url(#pages)" />
        <Path d="M190 172 L205 163 M190 178 L205 169 M190 184 L205 175 M190 190 L205 181" stroke="#CBD5E1" strokeWidth={1} />
        <Path d="M34 162 Q34 155 43 153 L183 148 Q190 148 192 155 L192 190 Q192 197 183 199 L43 204 Q34 204 34 196 Z" fill="url(#blueBook)" />
        <Path d="M40 161 Q42 156 51 156 L180 152" stroke="#93C5FD" strokeWidth={2} opacity={0.55} />
        <Path d="M51 161 L51 199 M57 160 L57 198" stroke="url(#gold)" strokeWidth={2.2} />
        <Path d="M155 197 L158 211 L165 204 L172 210 L168 195" fill="#2563EB" />

        {/* {/ * WHITE BOOK * /} */}
        <Path d="M187 128 L204 118 L204 157 L187 170 Z" fill="#94A3B8" />
        <Path d="M187 133 L204 123 L204 154 L187 166 Z" fill="url(#pages)" />
        <Path d="M190 140 L202 132 M190 146 L202 138 M190 152 L202 144 M190 158 L202 150" stroke="#CBD5E1" strokeWidth={1} />
        <Path d="M27 132 Q27 125 36 124 L181 120 Q189 120 191 127 L191 157 Q191 165 182 167 L37 173 Q27 173 27 164 Z" fill="url(#whiteBook)" />
        <Path d="M35 130 Q40 126 52 127 L178 123" stroke="#FFFFFF" strokeWidth={2} opacity={0.9} />
        <Path d="M36 166 L181 160" stroke="#94A3B8" strokeWidth={1} opacity={0.3} />
        <Path d="M143 165 L145 180 L152 174 L158 179 L155 163" fill="#E2E8F0" />

        {/* {/ * ORANGE BOOK * /} */}
        <Path d="M187 99 L204 89 L204 123 L187 136 Z" fill="#C2410C" />
        <Path d="M187 105 L204 95 L204 120 L187 132 Z" fill="url(#pages)" />
        <Path d="M190 110 L202 103 M190 116 L202 109 M190 122 L202 115 M190 128 L202 121" stroke="#CBD5E1" strokeWidth={1} />
        <Path d="M38 104 Q38 97 48 96 L181 92 Q190 92 192 99 L192 124 Q192 132 183 134 L48 140 Q38 140 38 131 Z" fill="url(#orangeBook)" />
        <Path d="M45 103 Q49 98 58 99 L179 95" stroke="#FED7AA" strokeWidth={2} opacity={0.65} />
        <Path d="M50 101 L50 136 M56 100 L56 135" stroke="#FDBA74" strokeWidth={2} opacity={0.7} />
        <Path d="M151 132 L154 147 L161 140 L167 146 L164 130" fill="#EA580C" />

        {/* {/ * GRADUATION CAP * /} */}
        <Ellipse cx="120" cy="101" rx="58" ry="9" fill="#020617" opacity={0.3} />
        <Path d="M65 75 Q66 66 79 63 L159 63 Q173 67 175 77 L170 101 Q167 111 120 112 Q73 110 68 101 Z" fill="#020617" />
        <Path d="M68 76 Q71 64 88 61 L151 61 Q168 64 173 76 L169 97 Q165 108 120 109 Q75 108 71 97 Z" fill="url(#cap)" />
        <Path d="M76 75 Q82 65 101 65 L145 65" stroke="#64748B" strokeWidth={2} opacity={0.5} />
        <Path d="M69 91 Q119 109 171 91 L169 100 Q119 119 70 100 Z" fill="url(#gold)" />
        <Path d="M75 97 Q120 112 165 97" stroke="#FEF3C7" strokeWidth={1.3} opacity={0.7} />

        {/* {/ * Mortarboard * /} */}
        <Path d="M34 58 L120 79 L207 57 L207 64 L120 87 L34 65 Z" fill="#020617" opacity={0.9} />
        <Path d="M120 23 L216 57 L120 86 L24 57 Z" fill="url(#capBoard)" />
        <Path d="M120 23 L216 57 L120 48 L24 57 Z" fill="#64748B" opacity={0.25} />
        <Path d="M24 57 L120 86 L216 57" stroke="#64748B" strokeWidth={1.5} opacity={0.6} />

        {/* {/ * Button * /} */}
        <Ellipse cx="120" cy="35" rx="7" ry="3.5" fill="#020617" />
        <Circle cx={120} cy={33} r={5} fill="url(#gold)" />
        <Ellipse cx="118.5" cy="31.5" rx="1.7" ry="1" fill="#FFF7ED" opacity={0.8} />

        {/* {/ * TASSEL * /} */}
        <Path d="M120 36 Q129 43 148 48 Q163 52 163 68" stroke="url(#gold)" strokeWidth={3} fill="none" strokeLinecap="round" />
        <Ellipse cx="163" cy="71" rx="5" ry="6" fill="url(#gold)" />
        <Path d="M160 75 Q157 85 155 99 M162 76 Q160 88 160 102 M164 76 Q164 88 165 101 M166 75 Q169 87 171 98" stroke="url(#gold)" strokeWidth={2.2} strokeLinecap="round" />
        <Path d="M155 99 Q163 104 171 98 L170 104 Q163 110 156 104 Z" fill="#D97706" />
        <Path d="M159 79 L157 96 M164 79 L164 98" stroke="#FEF3C7" strokeWidth={1} opacity={0.7} />

        {/* {/ * SPARKLES * /} */}
        <Path d="M42 31 L45 23 L48 31 L56 34 L48 37 L45 45 L42 37 L34 34 Z" fill="#FBBF24" />
        <Path d="M196 36 L198 30 L200 36 L206 38 L200 40 L198 46 L196 40 L190 38 Z" fill="#FBBF24" opacity={0.85} />
        <Circle cx={62} cy={52} r={2} fill="#FCD34D" />
        <Circle cx={185} cy={24} r={2} fill="#FCD34D" />
      </Svg>
    </View>
  );
}
// ── end commented SVG ──

/* ── Screen ───────────────────────────────────────── */

export function RoleSelectScreen({navigation}: AuthScreenProps<'RoleSelect'>): React.JSX.Element {
  const themeCtx = useTheme();
  const theme = lightTheme;
  const insets = useSafeAreaInsets();
  const {t} = useLanguage();

  const onSelect = (role: UserRole) => {
    if (role === 'admin') {
      navigation.navigate(ScreenNames.Login, {role});
    } else {
      navigation.navigate(ScreenNames.SelectSchool, {role});
    }
  };

  return (
    <ThemeContext.Provider value={{...themeCtx, theme: lightTheme}}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Top bar: brand + language */}
        <View style={[styles.topBar, {paddingTop: insets.top + theme.spacing.sm}]}>
          <Row gap={8} align="center">
            <View style={[styles.brandLogoBg, {backgroundColor: theme.colors.primary}]}>
              <Image
                source={require('../../../assets/images/logo_icons.png')}
                style={styles.brandLogo}
                resizeMode="contain"
              />
            </View>
            <View>
              <AppText variant="bodyBold" style={{fontSize: 16, color: theme.colors.text}}>
                {'Nought'}
                <AppText variant="bodyBold" style={{fontSize: 16, color: theme.colors.primary}}>
                  {'One'}
                </AppText>
              </AppText>
              <AppText variant="caption" color="textSecondary" style={{fontSize: 10, letterSpacing: 1, fontWeight: '600'}}>
                Learn · Track · Grow
              </AppText>
            </View>
          </Row>
          <LanguageSwitcher showLabel />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            {paddingTop: 16, paddingBottom: insets.bottom + 48},
          ]}
          showsVerticalScrollIndicator={false}>

          <View style={styles.heroRow}>
            <View style={styles.heroTextBlock}>
              <AppText variant="h1" style={styles.heading}>{t('continueAs')}</AppText>
              <Spacer size={4} />
              <AppText variant="body" color="textSecondary">
                Please select your role to continue
              </AppText>
            </View>
            <HeroIllustration />
            {/* <HeroIllustrationSVG /> */}
          </View>
          <Spacer size={16} />

          {Constants.ROLES.map(item => {
            const c = ROLE_STYLE[item.role as keyof typeof ROLE_STYLE];
            const RoleIcon = ROLE_ICON[item.role];
            return (
              <Pressable
                key={item.role}
                onPress={() => onSelect(item.role)}
                style={({pressed}) => [styles.card, pressed && styles.cardPressed]}>
                <View style={[styles.iconBox, {backgroundColor: c.iconBg}]}>
                  {RoleIcon ? <RoleIcon /> : null}
                </View>
                <View style={styles.textBlock}>
                  <AppText variant="bodyBold">{t(item.titleKey)}</AppText>
                  <Spacer size={2} />
                  <AppText variant="label" color="textSecondary">{t(item.descKey)}</AppText>
                </View>
                <View style={[styles.arrowBtn, {backgroundColor: c.arrowBg}]}>
                  <ArrowRightIcon color={c.arrow} />
                </View>
                <View style={styles.wave}>
                  <CardWave color={c.wave} />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Background decorative wave */}
        <View style={styles.bgWave} pointerEvents="none">
          <Svg width="100%" height={140} viewBox="0 0 400 140" preserveAspectRatio="none">
            <Path d="M0,70 C60,30 140,90 220,55 C300,20 360,75 400,50 L400,140 L0,140Z" fill={theme.colors.primary} opacity={0.06} />
            <Path d="M0,95 C80,60 180,110 260,80 C340,50 390,85 400,70 L400,140 L0,140Z" fill={theme.colors.primary} opacity={0.04} />
          </Svg>
        </View>

        <View style={[styles.dotsPos, {bottom: insets.bottom + 24, left: 20}]}>
          {/* <DotGrid color={theme.colors.primary} /> */}
        </View>
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#EEF2FF', marginTop:15},
  flex: {flex: 1},
  content: {paddingHorizontal: 24},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
    zIndex: 10,
  },
  brandLogoBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 26,
    height: 26,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  heroTextBlock: {
    flex: 1,
    paddingRight: 8,
  },
  heroWrap: {marginBottom: 0},
  heading: {
    fontSize: 32,
    fontWeight: '800',
    marginTop:50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 6
  },
  cardPressed: {opacity: 0.92, transform: [{scale: 0.98}]},
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {flex: 1, marginLeft: 10},
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {position: 'absolute', bottom: 0, left: 0, right: 0, height: 44},
  bgWave: {position: 'absolute', bottom: 0, left: 0, right: 0},
  dotsPos: {position: 'absolute', zIndex: 1},
});
