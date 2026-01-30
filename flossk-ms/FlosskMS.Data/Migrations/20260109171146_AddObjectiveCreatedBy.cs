using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddObjectiveCreatedBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "Objectives",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Objectives_CreatedByUserId",
                table: "Objectives",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Objectives_AspNetUsers_CreatedByUserId",
                table: "Objectives",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Objectives_AspNetUsers_CreatedByUserId",
                table: "Objectives");

            migrationBuilder.DropIndex(
                name: "IX_Objectives_CreatedByUserId",
                table: "Objectives");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Objectives");
        }
    }
}
