import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useLanguage} from '../../../core/i18n';
import {Screen, EmptyState} from '../../../shared/components';

export function NoAccessScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const {t} = useLanguage();

  return (
    <Screen>
      <EmptyState
        icon="lock"
        title={t('permissions_noAccessTitle')}
        message={t('permissions_noAccessMessage')}
        actionLabel={t('permissions_goBack')}
        onAction={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
      />
    </Screen>
  );
}
