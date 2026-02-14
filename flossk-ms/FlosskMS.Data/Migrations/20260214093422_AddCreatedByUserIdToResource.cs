using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedByUserIdToResource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "Resources",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Resources_CreatedByUserId",
                table: "Resources",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Resources_AspNetUsers_CreatedByUserId",
                table: "Resources",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resources_AspNetUsers_CreatedByUserId",
                table: "Resources");

            migrationBuilder.DropIndex(
                name: "IX_Resources_CreatedByUserId",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Resources");
        }
    }
}
