import { useState } from 'react';
import type { CreateMeetingRequest, Meeting, MeetingType, StudyMaterial, UpdateMeetingRequest } from '@/types';
import MaterialsTab from './MaterialsTab';
import MeetingsTab from './MeetingsTab';

interface Props {
  groupId: string;
  meetingType: MeetingType;
  isCreator: boolean;
  userId: string | undefined;
  materials: StudyMaterial[];
  materialsLoading: boolean;
  upload: (groupId: string, file: File, tags: string[]) => Promise<StudyMaterial>;
  removeMaterial: (id: string) => Promise<void>;
  searchByTag: (tag: string) => Promise<void>;
  meetings: Meeting[];
  meetingsLoading: boolean;
  createMeeting: (payload: CreateMeetingRequest) => Promise<Meeting>;
  updateMeeting: (id: string, payload: UpdateMeetingRequest) => Promise<Meeting>;
  removeMeeting: (id: string) => Promise<void>;
}

export default function GroupSpaceSidebar(props: Props) {
  const [activeTab, setActiveTab] = useState<'materials' | 'meetings'>('materials');

  return (
    <div className="w-80 border-l flex flex-col shrink-0 bg-white">
      <div className="border-b flex shrink-0">
        {('materials,meetings'.split(',') as ('materials' | 'meetings')[]).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'materials' && (
        <MaterialsTab
          groupId={props.groupId}
          materials={props.materials}
          loading={props.materialsLoading}
          upload={props.upload}
          removeMaterial={props.removeMaterial}
          searchByTag={props.searchByTag}
          userId={props.userId}
        />
      )}

      {activeTab === 'meetings' && (
        <MeetingsTab
          groupId={props.groupId}
          meetings={props.meetings}
          loading={props.meetingsLoading}
          meetingType={props.meetingType}
          isCreator={props.isCreator}
          createMeeting={props.createMeeting}
          updateMeeting={props.updateMeeting}
          removeMeeting={props.removeMeeting}
        />
      )}
    </div>
  );
}
