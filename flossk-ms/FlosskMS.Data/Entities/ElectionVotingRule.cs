namespace FlosskMS.Data.Entities;

public enum ElectionVotingRule
{
    /// <summary>Only users with the Admin role can vote.</summary>
    AdminOnly,

    /// <summary>Only users with the FullMember role can vote.</summary>
    FullMembersOnly,

    /// <summary>Any authenticated user can vote.</summary>
    AllUsers
}
