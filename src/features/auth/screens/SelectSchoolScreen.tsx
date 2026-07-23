/** Teacher/parent entry point — pick your school before logging in. */
import React, {useState} from 'react';
import {FlatList, View} from 'react-native';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  SearchBar,
  ListRow,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {useSchools} from '../schoolApi';
import type {AuthScreenProps} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {SchoolSummary} from '../../../shared/types';

export function SelectSchoolScreen({route, navigation}: AuthScreenProps<'SelectSchool'>): React.JSX.Element {
  const {t} = useLanguage();
  const {role} = route.params;
  const [search, setSearch] = useState('');
  const {data: schools, isLoading} = useSchools(search);
  const styles = useThemedStyles(theme => ({
    searchBarWrap: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    listContent: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      flexGrow: 1,
    },
  }));

  const onSelect = (school: SchoolSummary): void => {
    navigation.navigate(ScreenNames.Login, {role, schoolId: school.id, schoolName: school.name});
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('selectSchool_headerTitle')} onBack={() => navigation.goBack()} />
      <View style={styles.searchBarWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('selectSchool_searchPlaceholder')}
        />
      </View>
      {isLoading ? (
        <Loader message={t('selectSchool_loading')} />
      ) : (
        <FlatList
          data={schools ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <ListRow
              icon="class"
              title={item.name}
              subtitle={item.city}
              onPress={() => onSelect(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="class"
              title={t('selectSchool_emptyTitle')}
              message={t('selectSchool_emptyMessage')}
            />
          }
        />
      )}
    </Screen>
  );
}
