import React, {useState} from 'react';
import {View} from 'react-native';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomInput,
  CustomButton,
  CustomHeader,
  Spacer,
  ResultModal,
} from '../../../shared/components';
import {authApi} from '../authApi';
import {isValidEmail, isValidIndianMobile} from '../../../shared/utils/validators';
import {extractErrorMessage} from '../../../core/api/apiError';
import type {AuthScreenProps} from '../../../navigation/types';

interface FieldErrors {
  name?: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  phone3?: string;
  contact?: string;
}

function stripPhonePrefix(raw: string): string {
  return raw.replace(/[\s+\-]/g, '').replace(/^(91|0)/, '');
}

export function RequestAdminScreen({navigation}: AuthScreenProps<'RequestAdmin'>): React.JSX.Element {
  const {t} = useLanguage();
  const styles = useThemedStyles(theme => ({
    container: {flex: 1, padding: theme.spacing.lg},
  }));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field] || fieldErrors.contact) {
      setFieldErrors(prev => ({...prev, [field]: undefined, contact: undefined}));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!name.trim()) {
      errors.name = t('requestAdmin_nameRequired');
    }

    const trimEmail = email.trim();
    const trimP1 = stripPhonePrefix(phone1);
    const trimP2 = stripPhonePrefix(phone2);
    const trimP3 = stripPhonePrefix(phone3);

    if (trimEmail && !isValidEmail(trimEmail)) {
      errors.email = t('requestAdmin_emailInvalid');
    }
    if (trimP1 && !isValidIndianMobile(trimP1)) {
      errors.phone1 = t('requestAdmin_mobileInvalid');
    }
    if (trimP2 && !isValidIndianMobile(trimP2)) {
      errors.phone2 = t('requestAdmin_mobileInvalid');
    }
    if (trimP3 && !isValidIndianMobile(trimP3)) {
      errors.phone3 = t('requestAdmin_mobileInvalid');
    }

    if (!trimEmail && !trimP1 && !trimP2 && !trimP3) {
      errors.contact = t('requestAdmin_contactRequired');
    }

    return errors;
  };

  const onSubmit = async () => {
    setApiError('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await authApi.requestAdmin({
        name: name.trim(),
        email: email.trim(),
        phone1: stripPhonePrefix(phone1),
        phone2: stripPhonePrefix(phone2),
        phone3: stripPhonePrefix(phone3),
      });
      setShowSuccess(true);
    } catch (e) {
      const msg = extractErrorMessage(e, t('requestAdmin_genericError'));
      const prefixMatch = msg.match(/^(phone[123]|email|name):\s*/i);
      if (prefixMatch) {
        const field = prefixMatch[1].toLowerCase() as keyof FieldErrors;
        const fieldMsg = msg.slice(prefixMatch[0].length);
        setFieldErrors(prev => ({...prev, [field]: fieldMsg}));
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false} scroll>
      <CustomHeader title={t('requestAdmin_title')} onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <AppText variant="caption" color="textSecondary">
          {t('requestAdmin_helperText')}
        </AppText>
        <Spacer size={20} />

        <CustomInput
          label={t('requestAdmin_nameLabel')}
          placeholder={t('requestAdmin_namePlaceholder')}
          iconLeft="student"
          value={name}
          onChangeText={val => { setName(val); clearFieldError('name'); }}
          error={fieldErrors.name}
          maxLength={100}
          autoCapitalize="words"
          required
        />

        <CustomInput
          label={t('requestAdmin_emailLabel')}
          placeholder={t('requestAdmin_emailPlaceholder')}
          iconLeft="email"
          value={email}
          onChangeText={val => { setEmail(val); clearFieldError('email'); }}
          error={fieldErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Spacer size={4} />
        <AppText variant="caption" color="textSecondary">
          {t('requestAdmin_mobileHint')}
        </AppText>
        <Spacer size={12} />

        <CustomInput
          label={t('requestAdmin_mobile1Label')}
          placeholder={t('requestAdmin_mobilePlaceholder')}
          prefix="+91"
          value={phone1}
          onChangeText={val => { setPhone1(val.replace(/\D/g, '')); clearFieldError('phone1'); }}
          error={fieldErrors.phone1}
          keyboardType="number-pad"
          maxLength={10}
        />
        <CustomInput
          label={t('requestAdmin_mobile2Label')}
          placeholder={t('requestAdmin_mobilePlaceholder')}
          prefix="+91"
          value={phone2}
          onChangeText={val => { setPhone2(val.replace(/\D/g, '')); clearFieldError('phone2'); }}
          error={fieldErrors.phone2}
          keyboardType="number-pad"
          maxLength={10}
        />
        <CustomInput
          label={t('requestAdmin_mobile3Label')}
          placeholder={t('requestAdmin_mobilePlaceholder')}
          prefix="+91"
          value={phone3}
          onChangeText={val => { setPhone3(val.replace(/\D/g, '')); clearFieldError('phone3'); }}
          error={fieldErrors.phone3}
          keyboardType="number-pad"
          maxLength={10}
        />

        {fieldErrors.contact ? (
          <AppText variant="caption" color="error">
            {fieldErrors.contact}
          </AppText>
        ) : null}

        {apiError ? (
          <AppText variant="caption" color="error">
            {apiError}
          </AppText>
        ) : null}

        <Spacer size={16} />
        <CustomButton
          title={t('requestAdmin_sendRequest')}
          onPress={onSubmit}
          loading={loading}
        />
      </View>

      <ResultModal
        visible={showSuccess}
        variant="success"
        title={t('requestAdmin_successTitle')}
        message={t('requestAdmin_successMessage')}
        actionLabel={t('requestAdmin_backToLogin')}
        onClose={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}
