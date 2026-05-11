using EduCollab.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Infrastructure.Data
{
   public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Group> Groups => Set<Group>();
        public DbSet<GroupMember> GroupMembers => Set<GroupMember>();
        public DbSet<Message> Messages => Set<Message>();
        public DbSet<Meeting> Meetings => Set<Meeting>();
        public DbSet<MeetingAttendee> MeetingAttendees => Set<MeetingAttendee>();
        public DbSet<JoinRequest> JoinRequests => Set<JoinRequest>();
        public DbSet<StudyMaterial> StudyMaterials => Set<StudyMaterial>();
        public DbSet<MaterialTag> MaterialTags => Set<MaterialTag>();
        public DbSet<Notification> Notifications => Set<Notification>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<Group>(e =>
            {
             e.HasOne(g => g.Creator)
            .WithMany()
            .HasForeignKey(g => g.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<GroupMember>(e => {  

                e.HasIndex(gm => new { gm.GroupId, gm.UserId })
                    .IsUnique();

                e.HasOne(gm => gm.Group)
                    .WithMany(g => g.Members)
                    .HasForeignKey(gm => gm.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(gm => gm.User)
                    .WithMany(u => u.GroupMemberships)
                    .HasForeignKey(gm => gm.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            builder.Entity<Meeting>(e => {
                e.HasOne(m => m.Group)
                    .WithMany(g => g.Meetings)
                    .HasForeignKey(m => m.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(m => m.Organizer)
                    .WithMany()
                    .HasForeignKey(m => m.OrganizerId)
                    .OnDelete(DeleteBehavior.Restrict);

            });
            builder.Entity<MeetingAttendee> (e => {
                e.HasOne(ma => ma.Meeting)
                .WithMany(m => m.Attendees)
                .HasForeignKey(ma => ma.MeetingId)
                .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(ma => ma.User)
                    .WithMany(u => u.MeetingAttendees)
                    .HasForeignKey(ma => ma.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            builder.Entity<JoinRequest>(e => {
                e.HasIndex(jr => new { jr.GroupId, jr.StudentId })
                .IsUnique();

                e.HasOne(jr => jr.Group)
                .WithMany(g => g.JoinRequests)
                .HasForeignKey(jr => jr.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(jr => jr.Student)
                .WithMany(u => u.JoinRequests)
                .HasForeignKey(jr => jr.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            });
            builder.Entity<MaterialTag>(e => {
                e.HasOne(mt=>mt.StudyMaterial)
                .WithMany(t=>t.Tags)
                .HasForeignKey(f=>f.StudyMaterialId)
                .OnDelete(DeleteBehavior.Cascade);
            });
            builder.Entity<Message>(e => {
                e.HasOne(m => m.Group)
                    .WithMany(g => g.Messages)
                    .HasForeignKey(m => m.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(m => m.Sender)
                    .WithMany(u => u.Messages)
                    .HasForeignKey(m => m.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<Notification>(e => {
                e.HasOne(u=>u.User)
                .WithMany(n=>n.Notifications)
                .HasForeignKey(u => u.UserId)
                .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(n => n.Group)
                .WithMany(g => g.Notifications)
                .HasForeignKey(n => n.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
            });
            builder.Entity<StudyMaterial>(e => {
                e.HasOne(sm => sm.Group)
                    .WithMany(g => g.StudyMaterials)
                    .HasForeignKey(sm => sm.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(sm => sm.Uploader)
                    .WithMany(u => u.StudyMaterials)
                    .HasForeignKey(sm => sm.UploaderId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

        }


    }
}
