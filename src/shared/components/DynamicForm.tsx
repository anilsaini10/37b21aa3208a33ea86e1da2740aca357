/**
 * DynamicForm — schema-driven form engine.
 *
 * Render any form from a declarative field schema. Uses react-hook-form for
 * state + validation and the themed inputs for rendering. The same engine
 * powers Add/Edit Student, Add Teacher, Create Homework, etc.
 */
import React from 'react';
import {View} from 'react-native';
import {useForm, Controller, type FieldValues, type DefaultValues} from 'react-hook-form';
import {useTheme} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {CustomInput} from './CustomInput';
import {Select} from './Select';
import {DatePicker} from './DatePicker';
import {TimePicker} from './TimePicker';
import {CustomButton} from './CustomButton';
import type {SelectOption} from '../types';

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'phone'
  | 'textarea'
  | 'date'
  | 'time'
  | 'select';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  /** Custom validation rule; return an error message or undefined. */
  validate?: (value: unknown) => string | undefined;
}

export interface DynamicFormProps<T extends FieldValues> {
  fields: FormField[];
  defaultValues?: DefaultValues<T>;
  submitLabel?: string;
  onSubmit: (values: T) => void;
  loading?: boolean;
}

export function DynamicForm<T extends FieldValues>({
  fields,
  defaultValues,
  submitLabel,
  onSubmit,
  loading,
}: DynamicFormProps<T>): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const {control, handleSubmit} = useForm<T>({defaultValues, mode: 'onBlur'});

  return (
    <View>
      {fields.map(field => (
        <Controller
          key={field.name}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
          name={field.name}
          rules={{
            required: field.required ? t('common_fieldRequired', {field: field.label}) : false,
            validate: field.validate ? v => field.validate!(v) ?? true : undefined,
          }}
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => {
            const err = error?.message;
            switch (field.type) {
              case 'select':
                return (
                  <Select
                    label={field.label}
                    value={value}
                    options={field.options ?? []}
                    onChange={onChange}
                    error={err}
                    required={field.required}
                  />
                );
              case 'date':
                return <DatePicker label={field.label} value={value} onChange={onChange} />;
              case 'time':
                return <TimePicker label={field.label} value={value} onChange={onChange} />;
              default:
                return (
                  <CustomInput
                    label={field.label}
                    placeholder={field.placeholder}
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={err}
                    required={field.required}
                    secure={field.type === 'password'}
                    multiline={field.type === 'textarea'}
                    keyboardType={
                      field.type === 'email'
                        ? 'email-address'
                        : field.type === 'number'
                          ? 'numeric'
                          : field.type === 'phone'
                            ? 'phone-pad'
                            : 'default'
                    }
                    autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
                  />
                );
            }
          }}
        />
      ))}
      <CustomButton
        title={submitLabel ?? t('common_submit')}
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={{marginTop: theme.spacing.sm}}
      />
    </View>
  );
}
