import { ArrowLeft, Users } from 'lucide-react';
import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import ChatPanel from '@/components/group-space/ChatPanel';
import GroupSpaceSidebar from '@/components/group-space/GroupSpaceSidebar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useGroupHub } from '@/hooks/useGroupHub';
import { useGroup } from '@/hooks/useGroups';
import { useMaterials } from '@/hooks/useMaterials';
import { useMeetings } from '@/hooks/useMeetings';
import { useMessages } from '@/hooks/useMessages';
import type { Message } from '@/types';

export default function GroupSpace() {
  const { id } = useParams<{ id: string }>();
  const { user, isGroupCreator } = useAuth();
  const { group, loading: groupLoading } = useGroup(id ?? '');

  const {
    messages,
    loading: messagesLoading,
    hasMore,
    loadingMore,
    loadMore,
    send,
    appendMessage,
  } = useMessages(id ?? '');

  const {
    materials,
    loading: materialsLoading,
    upload,
    remove: removeMaterial,
    refetch: refetchMaterials,
    searchByTag,
  } = useMaterials(id ?? '');

  const { meetings, loading: meetingsLoading, create: createMeeting, update: updateMeeting, remove: removeMeeting } = useMeetings(id ?? '');

  const handleNewMessage = useCallback((msg: Message) => appendMessage(msg), [appendMessage]);
  const handleMaterialUploaded = useCallback(() => refetchMaterials(), [refetchMaterials]);

  useGroupHub({
    groupId: id ?? '',
    onMessage: handleNewMessage,
    onMaterialUploaded: handleMaterialUploaded,
  });

  const isCreator = isGroupCreator && user?.id === group?.creatorId;
  const backHref = isCreator ? '/creator/groups' : '/student/groups';

  if (groupLoading) {
    return (
      <div className="-mx-6 -my-6 flex overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <div className="flex-1 flex flex-col border-r">
          <div className="border-b px-4 py-3 flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
        <div className="w-80 border-l" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Group not found.</p>
      </div>
    );
  }

  return (
    <div
      className="-mx-6 -my-6 flex overflow-hidden bg-background"
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b px-4 py-3 flex items-center gap-3 bg-white shrink-0">
          <Link
            to={backHref}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base truncate">{group.name}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>{group.subject}</span>
              <span>·</span>
              <Users className="h-3 w-3" />
              <span>{group.memberCount} members</span>
            </p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {group.meetingType === 0 ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <ChatPanel
          messages={messages}
          loading={messagesLoading}
          hasMore={hasMore}
          loadingMore={loadingMore}
          loadMore={loadMore}
          send={send}
          userId={user?.id}
        />
      </div>
      <GroupSpaceSidebar
        groupId={id ?? ''}
        meetingType={group.meetingType}
        isCreator={isCreator}
        userId={user?.id}
        materials={materials}
        materialsLoading={materialsLoading}
        upload={upload}
        removeMaterial={removeMaterial}
        searchByTag={searchByTag}
        meetings={meetings}
        meetingsLoading={meetingsLoading}
        createMeeting={createMeeting}
        updateMeeting={updateMeeting}
        removeMeeting={removeMeeting}
      />
    </div>
  );
}
