using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddElectionFinalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FinalizedAt",
                table: "Elections",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FinalizedByUserId",
                table: "Elections",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFinalized",
                table: "Elections",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Elections_FinalizedByUserId",
                table: "Elections",
                column: "FinalizedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Elections_IsFinalized",
                table: "Elections",
                column: "IsFinalized");

            migrationBuilder.AddForeignKey(
                name: "FK_Elections_AspNetUsers_FinalizedByUserId",
                table: "Elections",
                column: "FinalizedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Elections_AspNetUsers_FinalizedByUserId",
                table: "Elections");

            migrationBuilder.DropIndex(
                name: "IX_Elections_FinalizedByUserId",
                table: "Elections");

            migrationBuilder.DropIndex(
                name: "IX_Elections_IsFinalized",
                table: "Elections");

            migrationBuilder.DropColumn(
                name: "FinalizedAt",
                table: "Elections");

            migrationBuilder.DropColumn(
                name: "FinalizedByUserId",
                table: "Elections");

            migrationBuilder.DropColumn(
                name: "IsFinalized",
                table: "Elections");
        }
    }
}
