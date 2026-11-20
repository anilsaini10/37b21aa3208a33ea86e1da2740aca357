/** Digital Admit Card — school name, exam details, student info, profile photo; share as PDF. */
import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Image, ScrollView, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomButton,
  AppText,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
  Divider,
} from '../../../shared/components';
import {useParentProfile} from '../../parent/parentStudents.service';
import {useParentExamDetail} from '../../parent/parentExams.service';
import {useAuthStore} from '../../auth/authStore';
import {formatPaperDate} from '../examSchedule.utils';
import {shareHtmlAsPdf} from '../../../core/sharing/shareService';
import {useCachedImage} from '../../../core/utils/useCachedImage';
import {initials} from '../../../core/utils/format';
import {buildAdmitCardHtml} from '../admitCardTemplate';

export function AdmitCardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const {examId, studentId} = (route.params ?? {}) as {examId: string; studentId: string};
  const {t} = useLanguage();

  const user = useAuthStore(s => s.user);
  const schoolName = user?.schoolName ?? '';

  const {data: profile, isLoading: profileLoading} = useParentProfile();
  const {data: exam, isLoading: examLoading} = useParentExamDetail(examId, studentId);

  const child = profile?.children.find(c => c.id === studentId);
  const profilePhotoUrl = child ? undefined : undefined;
  const cachedPhoto = useCachedImage(user?.profilePhoto);

  const [sharing, setSharing] = useState(false);

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg, flexGrow: 1},
    cardOuter: {overflow: 'hidden' as const},
    headerBand: {
      backgroundColor: theme.colors.primary,
      paddingVertical: t2.spacing.lg,
      paddingHorizontal: t2.spacing.lg,
      alignItems: 'center' as const,
    },
    admitCardLabel: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.pill,
      marginTop: t2.spacing.sm,
    },
    photoSection: {
      alignItems: 'center' as const,
      marginVertical: t2.spacing.lg,
    },
    photoFrame: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: theme.colors.primary,
      overflow: 'hidden' as const,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    photo: {width: 100, height: 100},
    initialsCircle: {
      backgroundColor: theme.colors.primary + '22',
      width: 94,
      height: 94,
      borderRadius: 47,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    detailsSection: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.lg},
    detailRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: t2.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '40',
    },
    detailRowLast: {borderBottomWidth: 0},
    validityBand: {
      backgroundColor: theme.colors.primary + '10',
      paddingVertical: t2.spacing.md,
      paddingHorizontal: t2.spacing.lg,
      alignItems: 'center' as const,
    },
    footer: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.md,
      alignItems: 'center' as const,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '40',
    },
    buttonRow: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.lg},
  }));

  const handleShare = useCallback(async () => {
    if (!child || !exam) {return;}
    setSharing(true);
    try {
      const validFrom = exam.startDate ? formatPaperDate(exam.startDate) : '';
      const validTo = exam.endDate ? formatPaperDate(exam.endDate) : '';
      const html = buildAdmitCardHtml({
        schoolName,
        examTitle: exam.title,
        examDescription: exam.description ?? undefined,
        studentName: child.name,
        rollNo: child.rollNo,
        className: `${child.className} - ${child.sectionName}`,
        validFrom,
        validTo,
        profilePhotoUrl: user?.profilePhoto,
      });
      await shareHtmlAsPdf({
        html,
        fileName: `AdmitCard_${child.name.replace(/\s+/g, '_')}_${exam.title.replace(/\s+/g, '_')}`,
        title: t('admitCard_title'),
      });
    } finally {
      setSharing(false);
    }
  }, [child, exam, schoolName, user?.profilePhoto, t]);

  if (profileLoading || examLoading) {
    return <Loader message={t('admitCard_loading')} />;
  }

  if (!child || !exam) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('admitCard_title')} onBack={() => navigation.goBack()} />
        <EmptyState icon="warning" title={t('common_somethingWentWrong')} />
      </Screen>
    );
  }

  const validFrom = exam.startDate ? formatPaperDate(exam.startDate) : t('parentExams_datesTba');
  const validTo = exam.endDate ? formatPaperDate(exam.endDate) : t('parentExams_datesTba');

  const DetailRow = ({label, value, last}: {label: string; value: string; last?: boolean}) => (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <AppText variant="caption" color="textSecondary">{label}</AppText>
      <AppText variant="bodyBold">{value}</AppText>
    </View>
  );

  return (
    <Screen padded={false}>
      <CustomHeader title={t('admitCard_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CustomCard style={styles.cardOuter}>
          {/* School header band */}
          <View style={styles.headerBand}>
            <Icon name="class" size={32} color={theme.colors.onPrimary} />
            <Spacer size={4} />
            <AppText variant="h3" style={{color: theme.colors.onPrimary, textAlign: 'center'}}>
              {schoolName}
            </AppText>
            <View style={styles.admitCardLabel}>
              <AppText variant="label" color="primary">
                {t('admitCard_title').toUpperCase()}
              </AppText>
            </View>
          </View>

          {/* Student photo */}
          <View style={styles.photoSection}>
            <View style={styles.photoFrame}>
              {cachedPhoto ? (
                <Image source={{uri: cachedPhoto}} style={styles.photo} />
              ) : (
                <View style={styles.initialsCircle}>
                  <AppText style={{color: theme.colors.primary, fontWeight: '700', fontSize: 36}}>
                    {initials(child.name)}
                  </AppText>
                </View>
              )}
            </View>
            <Spacer size={8} />
            <AppText variant="h3">{child.name}</AppText>
          </View>

          <Divider />

          {/* Details */}
          <View style={styles.detailsSection}>
            <DetailRow label={t('admitCard_exam')} value={exam.title} />
            {exam.description ? (
              <DetailRow label={t('admitCard_description')} value={exam.description} />
            ) : null}
            <DetailRow label={t('admitCard_rollNo')} value={String(child.rollNo)} />
            <DetailRow label={t('admitCard_class')} value={`${child.className} - ${child.sectionName}`} />
            <DetailRow label={t('admitCard_admissionNo')} value={child.admissionNo} last />
          </View>

          {/* Validity band */}
          <View style={styles.validityBand}>
            <Row gap={6} align="center">
              <Icon name="calendar" size={16} color={theme.colors.primary} />
              <AppText variant="label" color="primary">
                {t('admitCard_validity')}
              </AppText>
            </Row>
            <Spacer size={2} />
            <AppText variant="bodyBold">
              {validFrom} — {validTo}
            </AppText>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <AppText variant="caption" color="textMuted">
              {t('admitCard_footerNote')}
            </AppText>
          </View>
        </CustomCard>

        {/* Share / Download button */}
        <View style={styles.buttonRow}>
          <CustomButton
            title={sharing ? t('admitCard_generating') : t('admitCard_sharePdf')}
            iconLeft={sharing ? undefined : 'download'}
            onPress={handleShare}
            disabled={sharing}
          />
          {sharing ? (
            <View style={{alignItems: 'center', marginTop: 12}}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null}
        </View>

        <Spacer size={32} />
      </ScrollView>
    </Screen>
  );
}
