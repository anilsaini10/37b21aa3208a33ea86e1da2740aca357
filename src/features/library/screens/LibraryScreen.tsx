/** Library — catalogue of books and currently issued books. */
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
  SectionTitle,
  Badge,
  ListRow,
  Loader,
  EmptyState,
  Divider,
} from '../../../shared/components';
import {formatDate, formatCurrency} from '../../../core/utils/format';
import {capitalize} from '../../../shared/helpers';
import {useBooks, useBookIssues} from '../../operations/operations.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {BookIssue} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function LibraryScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {data: books, isLoading: booksLoading} = useBooks();
  const {data: issues, isLoading: issuesLoading} = useBookIssues();

  if (booksLoading || issuesLoading || !books || !issues) {
    return <Loader message={t('library_loading')} />;
  }

  const issueTone = (status: BookIssue['status']) =>
    status === 'returned' ? 'success' : status === 'overdue' ? 'error' : 'warning';

  const issueSubtitle = (issue: BookIssue) => {
    if (issue.fine > 0) {
      return t('library_issueSubtitleWithFine', {
        member: issue.memberName,
        date: formatDate(issue.dueDate),
        fine: formatCurrency(issue.fine),
      });
    }
    return t('library_issueSubtitle', {member: issue.memberName, date: formatDate(issue.dueDate)});
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('library_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <SectionTitle title={t('library_books')} />
        {books.length === 0 ? (
          <EmptyState icon="book" title={t('library_noBooks')} message={t('library_noBooksMessage')} />
        ) : (
          <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
            {books.map((book, i) => (
              <React.Fragment key={book.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  icon="book"
                  title={book.title}
                  subtitle={t('library_bookSubtitle', {
                    author: book.author,
                    available: book.availableCopies,
                    total: book.totalCopies,
                  })}
                  right={<Badge label={book.category} tone="neutral" />}
                />
              </React.Fragment>
            ))}
          </CustomCard>
        )}

        <SectionTitle title={t('library_issuedBooks')} />
        {issues.length === 0 ? (
          <EmptyState icon="book" title={t('library_noIssuedBooks')} message={t('library_noIssuedBooksMessage')} />
        ) : (
          <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
            {issues.map((issue, i) => (
              <React.Fragment key={issue.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  icon="book"
                  title={issue.bookTitle}
                  subtitle={issueSubtitle(issue)}
                  right={<Badge label={capitalize(issue.status)} tone={issueTone(issue.status)} />}
                />
              </React.Fragment>
            ))}
          </CustomCard>
        )}
      </ScrollView>
    </Screen>
  );
}
