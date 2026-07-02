/** Chat — thread list + conversation view (shared, teacher & parent). */
import React, {useState} from 'react';
import {FlatList, View, TextInput, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../../core/theme';
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
  const navigation = useNavigation();
  const {data: threads, isLoading} = useChatThreads();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const {data: messages} = useChatMessages(activeThread ?? '');
  const sendMessage = useSendMessage(activeThread ?? '');

  if (isLoading || !threads) {
    return <Loader message="Loading chats…" />;
  }

  const active = threads.find(t => t.id === activeThread);

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
          contentContainerStyle={{padding: theme.spacing.lg, flexGrow: 1}}
          renderItem={({item}) => {
            const mine = item.senderId === 'me';
            return (
              <View
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  backgroundColor: mine ? theme.colors.primary : theme.colors.surfaceVariant,
                  borderRadius: theme.radius.lg,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  marginBottom: theme.spacing.sm,
                  maxWidth: '80%',
                }}>
                <AppText style={{color: mine ? theme.colors.onPrimary : theme.colors.text}}>
                  {item.text}
                </AppText>
                <AppText variant="label" style={{color: mine ? theme.colors.onPrimary : theme.colors.textMuted, marginTop: 2}}>
                  {formatDateTime(item.sentAt)}
                </AppText>
              </View>
            );
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.md,
            columnGap: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
            backgroundColor: theme.colors.surface,
          }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message…"
            placeholderTextColor={theme.colors.placeholder}
            style={{
              flex: 1,
              color: theme.colors.text,
              backgroundColor: theme.colors.inputBackground,
              borderRadius: theme.radius.pill,
              paddingHorizontal: theme.spacing.md,
              height: 44,
            }}
          />
          <Pressable
            onPress={send}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="forward" size={22} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      </Screen>
    );
  }

  // ---- Thread list --------------------------------------------------------
  return (
    <Screen padded={false}>
      <CustomHeader title="Messages" onBack={() => navigation.goBack()} />
      <FlatList
        data={threads}
        keyExtractor={t => t.id}
        contentContainerStyle={{padding: theme.spacing.lg, flexGrow: 1}}
        ListEmptyComponent={<EmptyState title="No conversations" icon="chat" />}
        renderItem={({item}) => (
          <ListRow
            avatarName={item.participantName}
            title={item.participantName}
            subtitle={item.lastMessage}
            onPress={() => setActiveThread(item.id)}
            right={
              <View style={{alignItems: 'flex-end', rowGap: 2}}>
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
