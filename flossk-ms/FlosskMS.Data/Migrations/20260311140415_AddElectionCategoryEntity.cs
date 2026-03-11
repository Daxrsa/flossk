using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddElectionCategoryEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ElectionCategories_AspNetUsers_CreatedByUserId",
                table: "ElectionCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_ElectionCategories_Elections_ElectionId",
                table: "ElectionCategories");

            migrationBuilder.DropIndex(
                name: "IX_ElectionCategories_ElectionId",
                table: "ElectionCategories");

            migrationBuilder.DropColumn(
                name: "ElectionId",
                table: "ElectionCategories");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "ElectionCategories");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "ElectionCategories",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedByUserId",
                table: "ElectionCategories",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "ElectionCategories",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VotingRule",
                table: "ElectionCategories",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ElectionCategories_CreatedAt",
                table: "ElectionCategories",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ElectionCategories_Title",
                table: "ElectionCategories",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_ElectionCategories_VotingRule",
                table: "ElectionCategories",
                column: "VotingRule");

            migrationBuilder.AddForeignKey(
                name: "FK_ElectionCategories_AspNetUsers_CreatedByUserId",
                table: "ElectionCategories",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ElectionCategories_AspNetUsers_CreatedByUserId",
                table: "ElectionCategories");

            migrationBuilder.DropIndex(
                name: "IX_ElectionCategories_CreatedAt",
                table: "ElectionCategories");

            migrationBuilder.DropIndex(
                name: "IX_ElectionCategories_Title",
                table: "ElectionCategories");

            migrationBuilder.DropIndex(
                name: "IX_ElectionCategories_VotingRule",
                table: "ElectionCategories");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "ElectionCategories");

            migrationBuilder.DropColumn(
                name: "VotingRule",
                table: "ElectionCategories");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "ElectionCategories",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedByUserId",
                table: "ElectionCategories",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "ElectionId",
                table: "ElectionCategories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "ElectionCategories",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ElectionCategories_ElectionId",
                table: "ElectionCategories",
                column: "ElectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ElectionCategories_AspNetUsers_CreatedByUserId",
                table: "ElectionCategories",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ElectionCategories_Elections_ElectionId",
                table: "ElectionCategories",
                column: "ElectionId",
                principalTable: "Elections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
