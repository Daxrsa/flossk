using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMembershipRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MembershipRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    SchoolOrCompany = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Statement = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    IdCardFileId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicantSignatureFileId = table.Column<Guid>(type: "uuid", nullable: true),
                    GuardianSignatureFileId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedByUserId = table.Column<string>(type: "text", nullable: true),
                    ReviewNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    BoardMemberSignatureFileId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MembershipRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MembershipRequests_AspNetUsers_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MembershipRequests_UploadedFiles_ApplicantSignatureFileId",
                        column: x => x.ApplicantSignatureFileId,
                        principalTable: "UploadedFiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MembershipRequests_UploadedFiles_BoardMemberSignatureFileId",
                        column: x => x.BoardMemberSignatureFileId,
                        principalTable: "UploadedFiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MembershipRequests_UploadedFiles_GuardianSignatureFileId",
                        column: x => x.GuardianSignatureFileId,
                        principalTable: "UploadedFiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MembershipRequests_UploadedFiles_IdCardFileId",
                        column: x => x.IdCardFileId,
                        principalTable: "UploadedFiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MembershipRequests_ApplicantSignatureFileId",
                table: "MembershipRequests",
                column: "ApplicantSignatureFileId");

            migrationBuilder.CreateIndex(
                name: "IX_MembershipRequests_BoardMemberSignatureFileId",
                table: "MembershipRequests",
                column: "BoardMemberSignatureFileId");

            migrationBuilder.CreateIndex(
                name: "IX_MembershipRequests_CreatedAt",
                table: "MembershipRequests",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_MembershipRequests_Email",
                table: "MembershipRequests",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_MembershipRequests_GuardianSignatureFileId",
                table: "MembershipRequests",
                column: "GuardianSignatureFileId");

            migrationBuilder.CreateIndex(
                name: "IX_MembershipRequests_IdCardFileId",
                table: "MembershipRequests",
                column: "IdCardFileId");

            migrationBuilder.CreateIndex(
                name: "IX_MembershipRequests_ReviewedByUserId",
                table: "MembershipRequests",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MembershipRequests_Status",
                table: "MembershipRequests",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MembershipRequests");
        }
    }
}
