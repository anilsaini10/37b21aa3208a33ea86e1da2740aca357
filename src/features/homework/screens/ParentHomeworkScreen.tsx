/** Parent homework — list of the child's assignments with status badges. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  Badge,
  ListRow,
  EmptyState,
  Loader,
  Spacer,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useHomework} from '../homework.service';
import type {ParentStackParamList} from '../../../navigation/types';
import type {Homework} from '../../../shared/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

function statusTone(status: Homework['status']): BadgeTone {
  return status === 'graded' ? 'success' : status === 'submitted' ? 'info' : 'warning';
}

export function ParentHomeworkScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const {data, isLoading} = useHomework();

  const statusLabel = (status: Homework['status']) =>
    status === 'graded'
      ? t('homework_graded')
      : status === 'submitted'
        ? t('homework_submitted')
        : t('homework_pending');

  if (isLoading || !data) {
    return <Loader message={t('parentHomework_loadingHomework')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader title={t('parentHomework_title')} onBack={() => navigation.goBack()} />
      {data.length === 0 ? (
        <EmptyState
          title={t('parentHomework_noHomework')}
          message={t('parentHomework_noAssignments')}
          icon="homework"
        />
      ) : (
        <ScrollView
          contentContainerStyle={{padding: theme.spacing.lg}}
          showsVerticalScrollIndicator={false}>
          <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
            {data.map(hw => (
              <ListRow
                key={hw.id}
                icon="homework"
                title={hw.title}
                subtitle={t('parentHomework_itemSubtitle', {
                  subjectName: hw.subjectName,
                  dueDate: formatDate(hw.dueDate),
                })}
                right={<Badge label={statusLabel(hw.status)} tone={statusTone(hw.status)} />}
              />
            ))}
          </CustomCard>
          <Spacer size={24} />
        </ScrollView>
      )}
    </Screen>
  );
}
