/** Parent homework — list of the child's assignments with status badges. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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
import {capitalize} from '../../../shared/helpers';
import {useHomework} from '../homework.service';
import type {ParentStackParamList} from '../../../navigation/types';
import type {Homework} from '../../../shared/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

function statusTone(status: Homework['status']): BadgeTone {
  return status === 'graded' ? 'success' : status === 'submitted' ? 'info' : 'warning';
}

export function ParentHomeworkScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {data, isLoading} = useHomework();

  if (isLoading || !data) {
    return <Loader message="Loading homework…" />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader title="Homework" onBack={() => navigation.goBack()} />
      {data.length === 0 ? (
        <EmptyState
          title="No homework"
          message="There are no assignments right now."
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
                subtitle={`${hw.subjectName} · Due ${formatDate(hw.dueDate)}`}
                right={<Badge label={capitalize(hw.status)} tone={statusTone(hw.status)} />}
              />
            ))}
          </CustomCard>
          <Spacer size={24} />
        </ScrollView>
      )}
    </Screen>
  );
}
