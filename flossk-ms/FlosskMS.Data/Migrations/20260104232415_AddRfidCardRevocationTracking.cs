using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRfidCardRevocationTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RevocationReason",
                table: "UserRfidCards",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RevokedByUserId",
                table: "UserRfidCards",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRfidCards_RevokedByUserId",
                table: "UserRfidCards",
                column: "RevokedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRfidCards_AspNetUsers_RevokedByUserId",
                table: "UserRfidCards",
                column: "RevokedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRfidCards_AspNetUsers_RevokedByUserId",
                table: "UserRfidCards");

            migrationBuilder.DropIndex(
                name: "IX_UserRfidCards_RevokedByUserId",
                table: "UserRfidCards");

            migrationBuilder.DropColumn(
                name: "RevocationReason",
                table: "UserRfidCards");

            migrationBuilder.DropColumn(
                name: "RevokedByUserId",
                table: "UserRfidCards");
        }
    }
}
