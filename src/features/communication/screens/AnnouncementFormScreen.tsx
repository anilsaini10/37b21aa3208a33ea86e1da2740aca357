/** Create an announcement (admin). */
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomHeader, DynamicForm} from '../../../shared/components';
import type {FormField} from '../../../shared/components';
import {communicationApi} from '../communication.service';
import type {Announcement} from '../../../shared/types';

function useAnnouncementFormFields(): FormField[] {
  const {t} = useLanguage();
  return [
    {
      name: 'title',
      label: t('common_title'),
      type: 'text',
      required: true,
      placeholder: t('announcementForm_titlePlaceholder'),
    },
    {
      name: 'body',
      label: t('announcementForm_message'),
      type: 'textarea',
      required: true,
      placeholder: t('announcementForm_bodyPlaceholder'),
    },
    {
      name: 'category',
      label: t('announcementForm_category'),
      type: 'select',
      required: true,
      options: [
        {label: t('announcementForm_categoryNotice'), value: 'notice'},
        {label: t('announcementForm_categoryCircular'), value: 'circular'},
        {label: t('announcementForm_categoryEvent'), value: 'event'},
        {label: t('announcementForm_categoryUrgent'), value: 'urgent'},
      ],
    },
    {
      name: 'audience',
      label: t('announcementForm_audience'),
      type: 'select',
      required: true,
      options: [
        {label: t('announcementForm_audienceEveryone'), value: 'all'},
        {label: t('announcementForm_audienceParents'), value: 'parent'},
        {label: t('announcementForm_audienceTeachers'), value: 'teacher'},
      ],
    },
  ];
}

interface FormValues {
  title: string;
  body: string;
  category: Announcement['category'];
  audience: 'all' | 'parent' | 'teacher';
}

export function AnnouncementFormScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const qc = useQueryClient();
  const {t} = useLanguage();
  const fields = useAnnouncementFormFields();

  const onSubmit = async (values: FormValues) => {
    await communicationApi.createAnnouncement({
      title: values.title,
      body: values.body,
      category: values.category,
      audience: values.audience === 'all' ? 'all' : [values.audience],
    });
    qc.invalidateQueries({queryKey: ['announcements']});
    navigation.goBack();
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('announcementForm_newAnnouncement')} onBack={() => navigation.goBack()} />
      <Screen scroll>
        <DynamicForm<FormValues> fields={fields} submitLabel={t('announcementForm_publish')} onSubmit={onSubmit} />
      </Screen>
    </Screen>
  );
}
