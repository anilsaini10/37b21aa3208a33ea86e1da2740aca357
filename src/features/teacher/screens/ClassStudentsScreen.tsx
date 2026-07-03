/** Class Students — roster for a specific class/section with attendance badges. */
import React from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  ListRow,
  Badge,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {useStudents} from '../../students/students.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {Student} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function ClassStudentsScreen(): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    listContent: {
      padding: theme.spacing.lg,
      flexGrow: 1,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.divider,
    },
  }));
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'ClassStudents'>>();
  const {t} = useLanguage();
  const {classId, className, sectionId, sectionName} = route.params;
  const {data, isLoading} = useStudents({classId, sectionId, pageSize: 100});

  const headerTitle = sectionName
    ? t('classStudents_headerTitleWithSection', {className, sectionName})
    : t('classStudents_headerTitleNoSection', {className});

  if (isLoading || !data) {
    return <Loader message={t('classStudents_loadingStudents')} />;
  }

  const renderItem = ({item}: {item: Student}) => (
    <ListRow
      avatarName={item.name}
      title={item.name}
      subtitle={t('studentsList_rowSubtitle', {
        className: item.className,
        sectionName: item.sectionName,
        rollNo: item.rollNo,
      })}
      onPress={() => navigation.navigate(ScreenNames.StudentDetail, {id: item.id})}
      right={
        <Badge
          label={`${item.attendancePercentage}%`}
          tone={
            item.attendancePercentage >= 85
              ? 'success'
              : item.attendancePercentage >= 75
                ? 'warning'
                : 'error'
          }
        />
      }
    />
  );

  return (
    <Screen padded={false}>
      <CustomHeader
        title={headerTitle}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <FlatList
        data={data.items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="students"
            title={t('classStudents_noStudents')}
            message={t('classStudents_noStudentsMessage')}
          />
        }
      />
    </Screen>
  );
}
