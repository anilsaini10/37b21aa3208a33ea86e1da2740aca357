/** Child profile — personal + academic details of the parent's ward. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  Avatar,
  Badge,
  SectionTitle,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {statusTone, capitalize} from '../../../shared/helpers';
import {db} from '../../../core/mock/db';
import type {ParentStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

function DetailRow({label, value}: {label: string; value: string}): React.JSX.Element {
  return (
    <Row justify="space-between" align="flex-start" style={{paddingVertical: 6}}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <View style={{flex: 1, alignItems: 'flex-end', marginLeft: 12}}>
        <AppText variant="bodyBold" style={{textAlign: 'right'}}>
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
  const child = db.students[0];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('childProfile_childProfile')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={child.name} size={72} />
            <View style={{flex: 1}}>
              <AppText variant="h2">{child.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {child.admissionNo}
              </AppText>
              <Spacer size={6} />
              <Badge label={capitalize(child.status)} tone={statusTone(child.status)} />
            </View>
          </Row>
        </CustomCard>

        <SectionTitle title={t('childProfile_personalDetails')} />
        <CustomCard>
          <DetailRow label={t('childProfile_gender')} value={capitalize(child.gender)} />
          <Divider />
          <DetailRow label={t('childProfile_dateOfBirth')} value={formatDate(child.dateOfBirth)} />
          <Divider />
          <DetailRow label={t('childProfile_bloodGroup')} value={child.bloodGroup ?? '—'} />
          <Divider />
          <DetailRow label={t('common_address')} value={child.address ?? '—'} />
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
      </ScrollView>
    </Screen>
  );
}
