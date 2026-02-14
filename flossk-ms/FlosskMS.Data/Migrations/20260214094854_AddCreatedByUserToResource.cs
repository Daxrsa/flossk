using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedByUserToResource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resources_AspNetUsers_CreatedByUserId",
                table: "Resources");

            migrationBuilder.AddForeignKey(
                name: "FK_Resources_AspNetUsers_CreatedByUserId",
                table: "Resources",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resources_AspNetUsers_CreatedByUserId",
                table: "Resources");

            migrationBuilder.AddForeignKey(
                name: "FK_Resources_AspNetUsers_CreatedByUserId",
                table: "Resources",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
