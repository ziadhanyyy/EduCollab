using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Enums
{
    public enum NotificationType
    {
        MeetingReminder,
        JoinRequestAccepted,
        JoinRequestRejected,
        NewMaterial,
        NewMessage,
        GroupApproved,
        GroupRejected,
        NewGroupPendingReview,  // 7 — sent to admins when a new group is created
        NewJoinRequest          // 8 — sent to creator when a student requests to join
    }

}
