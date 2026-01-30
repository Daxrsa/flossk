using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class RefactorRfidCardForRegistrationFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRfidCards_AspNetUsers_UserId",
                table: "UserRfidCards");

            migrationBuilder.RenameColumn(
                name: "IssuedAt",
                table: "UserRfidCards",
                newName: "RegisteredAt");

            migrationBuilder.RenameColumn(
                name: "ExpiresAt",
                table: "UserRfidCards",
                newName: "AssignedAt");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "UserRfidCards",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "AssignedByUserId",
                table: "UserRfidCards",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegisteredByUserId",
                table: "UserRfidCards",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_UserRfidCards_AssignedByUserId",
                table: "UserRfidCards",
                column: "AssignedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRfidCards_RegisteredByUserId",
                table: "UserRfidCards",
                column: "RegisteredByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRfidCards_AspNetUsers_AssignedByUserId",
                table: "UserRfidCards",
                column: "AssignedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRfidCards_AspNetUsers_RegisteredByUserId",
                table: "UserRfidCards",
                column: "RegisteredByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRfidCards_AspNetUsers_UserId",
                table: "UserRfidCards",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRfidCards_AspNetUsers_AssignedByUserId",
                table: "UserRfidCards");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRfidCards_AspNetUsers_RegisteredByUserId",
                table: "UserRfidCards");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRfidCards_AspNetUsers_UserId",
                table: "UserRfidCards");

            migrationBuilder.DropIndex(
                name: "IX_UserRfidCards_AssignedByUserId",
                table: "UserRfidCards");

            migrationBuilder.DropIndex(
                name: "IX_UserRfidCards_RegisteredByUserId",
                table: "UserRfidCards");

            migrationBuilder.DropColumn(
                name: "AssignedByUserId",
                table: "UserRfidCards");

            migrationBuilder.DropColumn(
                name: "RegisteredByUserId",
                table: "UserRfidCards");

            migrationBuilder.RenameColumn(
                name: "RegisteredAt",
                table: "UserRfidCards",
                newName: "IssuedAt");

            migrationBuilder.RenameColumn(
                name: "AssignedAt",
                table: "UserRfidCards",
                newName: "ExpiresAt");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "UserRfidCards",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRfidCards_AspNetUsers_UserId",
                table: "UserRfidCards",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
