using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class ChangeIdCardFileToIdCardNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MembershipRequests_UploadedFiles_IdCardFileId",
                table: "MembershipRequests");

            migrationBuilder.DropIndex(
                name: "IX_MembershipRequests_IdCardFileId",
                table: "MembershipRequests");

            migrationBuilder.DropColumn(
                name: "IdCardFileId",
                table: "MembershipRequests");

            migrationBuilder.AddColumn<string>(
                name: "IdCardNumber",
                table: "MembershipRequests",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdCardNumber",
                table: "MembershipRequests");

            migrationBuilder.AddColumn<Guid>(
                name: "IdCardFileId",
                table: "MembershipRequests",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_MembershipRequests_IdCardFileId",
                table: "MembershipRequests",
                column: "IdCardFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_MembershipRequests_UploadedFiles_IdCardFileId",
                table: "MembershipRequests",
                column: "IdCardFileId",
                principalTable: "UploadedFiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
