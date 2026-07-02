/** Create an announcement (admin). */
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {Screen, CustomHeader, DynamicForm} from '../../../shared/components';
import type {FormField} from '../../../shared/components';
import {communicationApi} from '../communication.service';
import type {Announcement} from '../../../shared/types';

const FIELDS: FormField[] = [
  {name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Announcement title'},
  {name: 'body', label: 'Message', type: 'textarea', required: true, placeholder: 'Write the details…'},
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      {label: 'Notice', value: 'notice'},
      {label: 'Circular', value: 'circular'},
      {label: 'Event', value: 'event'},
      {label: 'Urgent', value: 'urgent'},
    ],
  },
  {
    name: 'audience',
    label: 'Audience',
    type: 'select',
    required: true,
    options: [
      {label: 'Everyone', value: 'all'},
      {label: 'Parents', value: 'parent'},
      {label: 'Teachers', value: 'teacher'},
    ],
  },
];

interface FormValues {
  title: string;
  body: string;
  category: Announcement['category'];
  audience: 'all' | 'parent' | 'teacher';
}

export function AnnouncementFormScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const qc = useQueryClient();

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
      <CustomHeader title="New Announcement" onBack={() => navigation.goBack()} />
      <Screen scroll>
        <DynamicForm<FormValues> fields={FIELDS} submitLabel="Publish" onSubmit={onSubmit} />
      </Screen>
    </Screen>
  );
}
