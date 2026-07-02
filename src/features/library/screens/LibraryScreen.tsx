/** Library — catalogue of books and currently issued books. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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
  const {data: books, isLoading: booksLoading} = useBooks();
  const {data: issues, isLoading: issuesLoading} = useBookIssues();

  if (booksLoading || issuesLoading || !books || !issues) {
    return <Loader message="Loading library…" />;
  }

  const issueTone = (status: BookIssue['status']) =>
    status === 'returned' ? 'success' : status === 'overdue' ? 'error' : 'warning';

  const issueSubtitle = (issue: BookIssue) => {
    const base = `${issue.memberName} · Due ${formatDate(issue.dueDate)}`;
    return issue.fine > 0 ? `${base} · Fine ${formatCurrency(issue.fine)}` : base;
  };

  return (
    <Screen padded={false}>
      <CustomHeader title="Library" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <SectionTitle title="Books" />
        {books.length === 0 ? (
          <EmptyState icon="book" title="No books" message="The catalogue is empty." />
        ) : (
          <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
            {books.map((book, i) => (
              <React.Fragment key={book.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  icon="book"
                  title={book.title}
                  subtitle={`${book.author} · ${book.availableCopies}/${book.totalCopies} available`}
                  right={<Badge label={book.category} tone="neutral" />}
                />
              </React.Fragment>
            ))}
          </CustomCard>
        )}

        <SectionTitle title="Issued Books" />
        {issues.length === 0 ? (
          <EmptyState icon="book" title="No issued books" message="Nothing is currently issued." />
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
