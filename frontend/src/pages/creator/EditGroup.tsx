import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import GroupForm from '@/components/groups/GroupForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroup } from '@/hooks/useGroups';
import api from '@/lib/api';
import type { Group, UpdateGroupRequest } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';

export default function EditGroup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { group, loading: groupLoading } = useGroup(id ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(payload: UpdateGroupRequest) {
    setSaving(true);
    try {
      await api.put<Group>(`/groups/${id}`, payload);
      toast.success('Group updated successfully.');
      navigate('/creator/groups');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update group.'));
    } finally {
      setSaving(false);
    }
  }

  if (groupLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <p className="text-muted-foreground">Group not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <Link
          to="/creator/groups"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Groups
        </Link>
        <h1 className="text-2xl font-bold">Edit Group</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update the details for "{group.name}".
        </p>
      </div>

      <GroupForm
        initial={group}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        loading={saving}
      />
    </div>
  );
}
