using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduCollab.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMeetingReminderSent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ReminderSent",
                table: "Meetings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "Tag",
                table: "MaterialTags",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReminderSent",
                table: "Meetings");

            migrationBuilder.AlterColumn<string>(
                name: "Tag",
                table: "MaterialTags",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }
    }
}
