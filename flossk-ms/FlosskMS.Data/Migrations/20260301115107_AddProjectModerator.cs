using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectModerator : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModeratorUserId",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ModeratorUserId",
                table: "Projects",
                column: "ModeratorUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_AspNetUsers_ModeratorUserId",
                table: "Projects",
                column: "ModeratorUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_AspNetUsers_ModeratorUserId",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_ModeratorUserId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ModeratorUserId",
                table: "Projects");
        }
    }
}
