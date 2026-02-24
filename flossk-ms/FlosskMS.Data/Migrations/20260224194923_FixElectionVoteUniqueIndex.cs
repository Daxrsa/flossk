using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlosskMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixElectionVoteUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ElectionVotes_ElectionId_VoterUserId",
                table: "ElectionVotes");

            migrationBuilder.CreateIndex(
                name: "IX_ElectionVotes_ElectionId_VoterUserId_CandidateUserId",
                table: "ElectionVotes",
                columns: new[] { "ElectionId", "VoterUserId", "CandidateUserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ElectionVotes_ElectionId_VoterUserId_CandidateUserId",
                table: "ElectionVotes");

            migrationBuilder.CreateIndex(
                name: "IX_ElectionVotes_ElectionId_VoterUserId",
                table: "ElectionVotes",
                columns: new[] { "ElectionId", "VoterUserId" },
                unique: true);
        }
    }
}
