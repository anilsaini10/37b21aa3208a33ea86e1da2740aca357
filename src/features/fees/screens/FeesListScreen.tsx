/** Fee management — collection summary + class-wise drill-down into student fees. */
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  StatTile,
  CustomCard,
  ListRow,
  SectionTitle,
  Divider,
  Badge,
  Row,
  Spacer,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {formatCurrencyCompact} from '../../../core/utils/format';
import {sumBy} from '../../../core/utils/misc';
import {db} from '../../../core/mock/db';
import {useFees, useFeeSummary} from '../fees.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {FeeInvoice, SchoolClass, StatCard} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

/** FeeInvoice only carries `className`, not `classId`/`sectionId` — join through the student record. */
function studentIdsFor(classId: string, sectionId?: string): Set<string> {
  return new Set(
    db.students
      .filter(s => s.classId === classId && (!sectionId || s.sectionId === sectionId))
      .map(s => s.id),
  );
}

export function FeesListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {data: summary, isLoading: summaryLoading} = useFeeSummary();
  const {data: fees, isLoading: feesLoading} = useFees({pageSize: 500});
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
      flexGrow: 1,
    },
    tileWrapper: {
      flex: 1,
    },
    card: {
      marginBottom: t2.spacing.sm,
      padding: t2.spacing.sm,
      borderWidth: 0,
      shadowOpacity: t2.dark ? 0.4 : 0.12,
      shadowRadius: 10,
      shadowOffset: {width: 0, height: 4},
      elevation: 6,
    },
  }));

  if (summaryLoading || feesLoading || !summary || !fees) {
    return <Loader message={t('feesList_loadingFees')} />;
  }

  const invoices: FeeInvoice[] = fees.items;
  const classes: SchoolClass[] = db.classes;

  const tiles: StatCard[] = [
    {
      key: 'collected',
      label: t('feesList_collected'),
      value: formatCurrencyCompact(summary.totalCollected),
      icon: 'money',
      accent: 'success',
    },
    {
      key: 'pending',
      label: t('fees_pending'),
      value: formatCurrencyCompact(summary.totalPending),
      icon: 'warning',
      accent: 'error',
    },
    {
      key: 'rate',
      label: t('feesList_collectionRate'),
      value: `${summary.collectionRate}%`,
      icon: 'reports',
      accent: 'primary',
    },
  ];

  const feeBadge = (classId: string, sectionId?: string): React.JSX.Element => {
    const ids = studentIdsFor(classId, sectionId);
    const matched = invoices.filter(inv => ids.has(inv.studentId));
    const pendingCount = matched.filter(inv => inv.status !== 'paid').length;
    const totalDue = sumBy(matched, inv => inv.dueAmount);
    return pendingCount > 0 ? (
      <Badge label={formatCurrencyCompact(totalDue)} tone="error" />
    ) : (
      <Badge label={t('fees_paid')} tone="success" />
    );
  };

  const openClass = (cls: SchoolClass): void => {
    navigation.navigate(ScreenNames.FeesStudentsList, {classId: cls.id, className: cls.name});
  };

  const openSection = (cls: SchoolClass, section: SchoolClass['sections'][number]): void => {
    navigation.navigate(ScreenNames.FeesStudentsList, {
      classId: cls.id,
      className: cls.name,
      sectionId: section.id,
      sectionName: section.name,
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('feesList_headerTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Row gap={theme.spacing.md} align="stretch">
          {tiles.map(tile => (
            <View key={tile.key} style={styles.tileWrapper}>
              <StatTile stat={tile} />
            </View>
          ))}
        </Row>
        <Spacer size={16} />
        {classes.length === 0 ? (
          <EmptyState icon="class" title={t('classList_emptyTitle')} message={t('classList_emptyMessage')} />
        ) : (
          classes.map(cls => (
            <View key={cls.id}>
              <SectionTitle title={cls.name} />
              {cls.sections.length > 0 ? (
                <CustomCard style={styles.card}>
                  {cls.sections.map((section, index) => (
                    <View key={section.id}>
                      {index > 0 ? <Divider /> : null}
                      <ListRow
                        icon="fee"
                        title={t('classList_sectionLabel', {name: section.name})}
                        subtitle={t('classList_studentCount', {count: section.studentCount})}
                        right={feeBadge(cls.id, section.id)}
                        onPress={() => openSection(cls, section)}
                      />
                    </View>
                  ))}
                </CustomCard>
              ) : (
                <CustomCard style={styles.card}>
                  <ListRow
                    icon="fee"
                    title={cls.name}
                    subtitle={t('classList_studentCount', {count: cls.totalStudents})}
                    right={feeBadge(cls.id)}
                    onPress={() => openClass(cls)}
                  />
                </CustomCard>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
