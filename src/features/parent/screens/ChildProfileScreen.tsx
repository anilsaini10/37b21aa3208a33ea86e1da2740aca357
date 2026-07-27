/** Child profile — photo hero identity, personal + academic details of the parent's ward(s). Switch between children when there's more than one. */
import React, {useState} from 'react';
import {Pressable, View, ScrollView, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  ProfileHero,
  SectionTitle,
  Row,
  Spacer,
  Divider,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {capitalize} from '../../../shared/helpers';
import {useParentProfile} from '../parentStudents.service';
import type {ParentStackParamList} from '../../../navigation/types';
import type {ParentChild} from '../../../shared/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

const detailRowStyles = StyleSheet.create({
  row: {
    paddingVertical: 6,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  valueText: {
    textAlign: 'right',
  },
});

function DetailRow({label, value}: {label: string; value: string}): React.JSX.Element {
  return (
    <Row justify="space-between" align="flex-start" style={detailRowStyles.row}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <View style={detailRowStyles.valueContainer}>
        <AppText variant="bodyBold" style={detailRowStyles.valueText}>
          {value}
        </AppText>
      </View>
    </Row>
  );
}

export function ChildProfileScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {data, isLoading, isError, error, refetch} = useParentProfile();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const styles = useThemedStyles(t2 => ({
    content: {
      padding: t2.spacing.lg,
    },
    switcherWrap: {
      marginBottom: t2.spacing.md,
    },
    switcherContent: {
      columnGap: t2.spacing.sm,
    },
    childPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
  }));

  if (isLoading || !data) {
    if (isError) {
      return (
        <Screen padded={false}>
          <CustomHeader title={t('childProfile_childProfile')} onBack={() => navigation.goBack()} />
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        </Screen>
      );
    }
    return (
      <Screen padded={false}>
        <CustomHeader title={t('childProfile_childProfile')} onBack={() => navigation.goBack()} />
        <Loader message={t('childProfile_loading')} />
      </Screen>
    );
  }

  const {children} = data;

  if (children.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('childProfile_childProfile')} onBack={() => navigation.goBack()} />
        <EmptyState
          icon="student"
          title={t('childProfile_noChildrenTitle')}
          message={t('childProfile_noChildrenMessage')}
        />
      </Screen>
    );
  }

  const child: ParentChild = children.find(c => c.id === activeChildId) ?? children[0];

  return (
    <Screen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHero
          name={child.name}
          lines={[child.admissionNo]}
          badgeLabel={capitalize(child.status)}
          onBack={() => navigation.goBack()}
          title={t('childProfile_childProfile')}
        />

        <View style={styles.content}>
          {children.length > 1 ? (
            <View style={styles.switcherWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherContent}>
                {children.map(c => {
                  const active = c.id === child.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setActiveChildId(c.id)}
                      style={[
                        styles.childPill,
                        {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant},
                      ]}>
                      <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                        {c.name}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <SectionTitle title={t('childProfile_personalDetails')} />
          <CustomCard>
            <DetailRow label={t('childProfile_gender')} value={capitalize(child.gender)} />
            <Divider />
            <DetailRow label={t('childProfile_dateOfBirth')} value={formatDate(child.dateOfBirth)} />
            {child.bloodGroup ? (
              <>
                <Divider />
                <DetailRow label={t('childProfile_bloodGroup')} value={child.bloodGroup} />
              </>
            ) : null}
            {child.address ? (
              <>
                <Divider />
                <DetailRow label={t('common_address')} value={child.address} />
              </>
            ) : null}
          </CustomCard>

          <SectionTitle title={t('childProfile_academicDetails')} />
          <CustomCard>
            <DetailRow label={t('childProfile_class')} value={child.className} />
            <Divider />
            <DetailRow label={t('childProfile_section')} value={child.sectionName} />
            <Divider />
            <DetailRow label={t('childProfile_rollNo')} value={String(child.rollNo)} />
            <Divider />
            <DetailRow label={t('childProfile_attendance')} value={`${child.attendancePercentage}%`} />
          </CustomCard>
          <Spacer size={24} />
        </View>
      </ScrollView>
    </Screen>
  );
}
