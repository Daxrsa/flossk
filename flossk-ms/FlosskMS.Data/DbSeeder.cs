using FlosskMS.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FlosskMS.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext dbContext)
    {
        await SeedRolesAsync(roleManager);
        await SeedAdminUserAsync(userManager, dbContext);
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        string[] roles = ["Admin", "User", "Full Member", "Leader"];

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }

    private static async Task SeedAdminUserAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext dbContext)
    {
        const string adminEmail = "daorsahyseni@gmail.com";
        const string adminPassword = "P@ssword123";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser != null) return;

        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FirstName = "Daorsa",
            LastName = "Hyseni",
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(adminUser, adminPassword);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");

            if (!await dbContext.ApprovedEmails.AnyAsync(e => e.Email.ToLower() == adminEmail.ToLower()))
            {
                dbContext.ApprovedEmails.Add(new ApprovedEmail { Email = adminEmail });
                await dbContext.SaveChangesAsync();
            }
        }
    }
}
