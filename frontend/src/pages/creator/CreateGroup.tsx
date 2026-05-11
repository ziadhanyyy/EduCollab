import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import GroupForm from '@/components/groups/GroupForm';
import { extractErrorMessage } from '@/utils/helpers';
import api from '@/lib/api';
import type { CreateGroupRequest, UpdateGroupRequest, Group } from '@/types';

export default function CreateGroup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(payload: CreateGroupRequest | UpdateGroupRequest) {
    setLoading(true);
    try {
      await api.post<Group>('/groups', payload as CreateGroupRequest);
      toast.success('Group created! Awaiting admin approval.');
      navigate('/creator/groups');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to create group.'));
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold">Create a Study Group</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your group will be visible to students after admin approval.
        </p>
      </div>

      <GroupForm onSubmit={handleSubmit} submitLabel="Create Group" loading={loading} />
    </div>
  );
}

