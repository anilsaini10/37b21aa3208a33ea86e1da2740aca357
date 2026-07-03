/** Chat — thread list + conversation view (shared, teacher & parent). */
import React, {useState} from 'react';
import {FlatList, View, TextInput, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  ListRow,
  Badge,
  Icon,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {timeAgo, formatDateTime} from '../../../core/utils/format';
import {capitalize} from '../../../shared/helpers';
import {useChatThreads, useChatMessages, useSendMessage} from '../communication.service';

export function ChatScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const {data: threads, isLoading} = useChatThreads();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const {data: messages} = useChatMessages(activeThread ?? '');
  const sendMessage = useSendMessage(activeThread ?? '');
  const styles = useThemedStyles(t2 => ({
    listContent: {
      padding: t2.spacing.lg,
      flexGrow: 1,
    },
    composer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: t2.spacing.md,
      columnGap: t2.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: t2.colors.divider,
      backgroundColor: t2.colors.surface,
    },
    input: {
      flex: 1,
      color: t2.colors.text,
      backgroundColor: t2.colors.inputBackground,
      borderRadius: t2.radius.pill,
      paddingHorizontal: t2.spacing.md,
      height: 44,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t2.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    threadMeta: {
      alignItems: 'flex-end',
      rowGap: 2,
    },
    bubbleBase: {
      borderRadius: t2.radius.lg,
      paddingHorizontal: t2.spacing.md,
      paddingVertical: t2.spacing.sm,
      marginBottom: t2.spacing.sm,
      maxWidth: '80%',
    },
    timestampSpacing: {
      marginTop: 2,
    },
  }));

  if (isLoading || !threads) {
    return <Loader message={t('chat_loadingChats')} />;
  }

  const active = threads.find(thread => thread.id === activeThread);

  const send = () => {
    if (draft.trim()) {
      sendMessage.mutate(draft.trim());
      setDraft('');
    }
  };

  // ---- Conversation view --------------------------------------------------
  if (active) {
    return (
      <Screen padded={false}>
        <CustomHeader title={active.participantName} subtitle={capitalize(active.participantRole)} onBack={() => setActiveThread(null)} />
        <FlatList
          data={messages ?? []}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => {
            const mine = item.senderId === 'me';
            return (
              <View
                style={[
                  styles.bubbleBase,
                  {
                    alignSelf: mine ? 'flex-end' : 'flex-start',
                    backgroundColor: mine ? theme.colors.primary : theme.colors.surfaceVariant,
                  },
                ]}>
                <AppText style={{color: mine ? theme.colors.onPrimary : theme.colors.text}}>
                  {item.text}
                </AppText>
                <AppText
                  variant="label"
                  style={[
                    styles.timestampSpacing,
                    {color: mine ? theme.colors.onPrimary : theme.colors.textMuted},
                  ]}>
                  {formatDateTime(item.sentAt)}
                </AppText>
              </View>
            );
          }}
        />
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('chat_typeMessage')}
            placeholderTextColor={theme.colors.placeholder}
            style={styles.input}
          />
          <Pressable onPress={send} style={styles.sendButton}>
            <Icon name="forward" size={22} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      </Screen>
    );
  }

  // ---- Thread list --------------------------------------------------------
  return (
    <Screen padded={false}>
      <CustomHeader title={t('chat_title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={threads}
        keyExtractor={thread => thread.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState title={t('chat_noConversations')} icon="chat" />}
        renderItem={({item}) => (
          <ListRow
            avatarName={item.participantName}
            title={item.participantName}
            subtitle={item.lastMessage}
            onPress={() => setActiveThread(item.id)}
            right={
              <View style={styles.threadMeta}>
                <AppText variant="label" color="textMuted">
                  {timeAgo(item.lastMessageAt)}
                </AppText>
                {item.unreadCount > 0 ? <Badge label={String(item.unreadCount)} tone="primary" /> : null}
              </View>
            }
          />
        )}
      />
    </Screen>
  );
}
