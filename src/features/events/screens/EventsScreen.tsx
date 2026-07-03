/** Events — school calendar of upcoming and past events. */
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
  ListRow,
  Loader,
  EmptyState,
  Divider,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {capitalize} from '../../../shared/helpers';
import {useEvents} from '../../communication/communication.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {SchoolEvent} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function EventsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {data, isLoading} = useEvents();

  if (isLoading || !data) {
    return <Loader message={t('events_loading')} />;
  }

  if (data.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('events_title')} onBack={() => navigation.goBack()} />
        <EmptyState
          icon="event"
          title={t('events_noEvents')}
          message={t('events_noEventsMessage')}
        />
      </Screen>
    );
  }

  const subtitleFor = (event: SchoolEvent) => {
    const range = event.endDate ? ` – ${formatDate(event.endDate)}` : '';
    return `${formatDate(event.date)}${range} · ${capitalize(event.type)}`;
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('events_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {data.map((event, i) => (
            <React.Fragment key={event.id}>
              {i > 0 ? <Divider /> : null}
              <ListRow
                icon="event"
                title={event.title}
                subtitle={subtitleFor(event)}
                right={
                  event.description ? (
                    <View style={{maxWidth: 120}}>
                      <AppText variant="label" color="textMuted" numberOfLines={2}>
                        {event.description}
                      </AppText>
                    </View>
                  ) : undefined
                }
              />
            </React.Fragment>
          ))}
        </CustomCard>
      </ScrollView>
    </Screen>
  );
}
