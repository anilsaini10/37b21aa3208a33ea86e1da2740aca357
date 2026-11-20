import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {useAuthStore} from '../../features/auth/authStore';
import {useImagePicker, type ImageSource, type PickedImage} from '../utils/useImagePicker';
import {AppText} from './AppText';
import {CustomButton} from './CustomButton';
import {ImagePickerSheet} from './ImagePickerSheet';
import {Icon} from './Icon';
import {Row} from './layout';

export interface ProfileImageModalProps {
  visible: boolean;
  onClose: () => void;
  currentImageUri?: string;
}

type ModalState = 'view' | 'preview';

export function ProfileImageModal({
  visible,
  onClose,
  currentImageUri,
}: ProfileImageModalProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const {width: screenWidth} = useWindowDimensions();
  const updateProfilePhoto = useAuthStore(s => s.updateProfilePhoto);
  const {pick} = useImagePicker();

  const [state, setState] = useState<ModalState>('view');
  const [selectedImage, setSelectedImage] = useState<PickedImage | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const autoOpenedPicker = useRef(false);

  useEffect(() => {
    if (visible && !currentImageUri && !autoOpenedPicker.current) {
      autoOpenedPicker.current = true;
      setPickerVisible(true);
    }
    if (!visible) {
      autoOpenedPicker.current = false;
    }
  }, [visible, currentImageUri]);

  const showModal = visible && (!!currentImageUri || state === 'preview' || picking);

  const imageSize = screenWidth * 0.75;

  const styles = useThemedStyles(t2 => ({
    backdrop: {
      flex: 1,
      backgroundColor: t2.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      width: '90%',
      backgroundColor: t2.colors.surface,
      borderRadius: t2.radius.lg,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.md,
    },
    imageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: t2.spacing.lg,
      paddingBottom: t2.spacing.lg,
      minHeight: 120,
    },
    image: {
      width: imageSize,
      height: imageSize,
      borderRadius: t2.radius.lg,
    },
    actions: {
      padding: t2.spacing.lg,
      rowGap: t2.spacing.sm,
    },
  }));

  const reset = useCallback(() => {
    setState('view');
    setSelectedImage(null);
    setPickerVisible(false);
    setPicking(false);
    setUploading(false);
    setUploadError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const openPicker = useCallback(() => {
    setPickerVisible(true);
  }, []);

  const handlePickerClose = useCallback(() => {
    setPickerVisible(false);
    if (!currentImageUri && !selectedImage) {
      handleClose();
    }
  }, [currentImageUri, selectedImage, handleClose]);

  const handleImageSelect = useCallback(async (source: ImageSource) => {
    setPicking(true);
    try {
      const img = await pick(source);
      if (!img) {
        setPicking(false);
        if (!currentImageUri && !selectedImage) handleClose();
        return;
      }
      setSelectedImage(img);
      setState('preview');
      setPicking(false);
    } catch (e: any) {
      setPicking(false);
      if (e?.code !== 'CANCELLED') console.warn(e);
      else if (!currentImageUri && !selectedImage) handleClose();
    }
  }, [pick, currentImageUri, selectedImage, handleClose]);

  const handleSave = useCallback(async () => {
    if (!selectedImage || uploading) return;
    try {
      setUploading(true);
      setUploadError(null);
      await updateProfilePhoto(selectedImage.uri, selectedImage.type, selectedImage.name);
      handleClose();
    } catch (e: any) {
      setUploadError(t('profileImage_uploadFailed'));
    } finally {
      setUploading(false);
    }
  }, [selectedImage, uploading, updateProfilePhoto, handleClose, t]);

  const handleReUpload = useCallback(() => {
    setSelectedImage(null);
    setUploadError(null);
    setPickerVisible(true);
  }, []);

  const displayUri = state === 'preview' && selectedImage ? selectedImage.uri : currentImageUri;

  return (
    <>
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={handleClose}>
        <Pressable onPress={handleClose} style={styles.backdrop}>
          <Pressable onPress={e => e.stopPropagation()} style={styles.container}>
            <View style={styles.header}>
              <AppText variant="h3">{t('profileImage_title')}</AppText>
              <Pressable onPress={handleClose} hitSlop={8}>
                <Icon name="close" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.imageContainer}>
              {picking ? (
                <View style={{alignItems: 'center', justifyContent: 'center', height: imageSize}}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <AppText variant="caption" color="textSecondary" style={{marginTop: theme.spacing.sm}}>
                    {t('common_loading')}
                  </AppText>
                </View>
              ) : displayUri ? (
                <Image
                  source={{uri: displayUri}}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : null}
            </View>

            {!picking && (
              <View style={styles.actions}>
                {uploadError ? (
                  <AppText variant="caption" color="error" style={{textAlign: 'center', marginBottom: theme.spacing.xs}}>
                    {uploadError}
                  </AppText>
                ) : null}
                {state === 'view' ? (
                  <CustomButton
                    title={t('common_update')}
                    onPress={openPicker}
                    iconLeft="camera"
                  />
                ) : (
                  <>
                    <CustomButton
                      title={t('common_save')}
                      onPress={handleSave}
                      loading={uploading}
                    />
                    <Row gap={theme.spacing.sm}>
                      <View style={{flex: 1}}>
                        <CustomButton
                          title={t('common_cancel')}
                          variant="outline"
                          onPress={handleClose}
                          disabled={uploading}
                        />
                      </View>
                      <View style={{flex: 1}}>
                        <CustomButton
                          title={t('common_reUpload')}
                          variant="secondary"
                          onPress={handleReUpload}
                          iconLeft="camera"
                          disabled={uploading}
                        />
                      </View>
                    </Row>
                  </>
                )}
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <ImagePickerSheet
        visible={pickerVisible}
        onClose={handlePickerClose}
        onSelect={handleImageSelect}
      />
    </>
  );
}
