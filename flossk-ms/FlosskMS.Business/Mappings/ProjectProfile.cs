using AutoMapper;
using FlosskMS.Business.DTOs;
using FlosskMS.Data.Entities;

namespace FlosskMS.Business.Mappings;

public class ProjectProfile : Profile
{
    public ProjectProfile()
    {
        // Project mappings
        CreateMap<Project, ProjectDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CreatedByFirstName, opt => opt.MapFrom(src => src.CreatedByUser.FirstName))
            .ForMember(dest => dest.CreatedByLastName, opt => opt.MapFrom(src => src.CreatedByUser.LastName))
            .ForMember(dest => dest.TeamMembers, opt => opt.MapFrom(src => src.TeamMembers))
            .ForMember(dest => dest.Objectives, opt => opt.MapFrom(src => src.Objectives))
            .ForMember(dest => dest.Resources, opt => opt.MapFrom(src => src.Resources))
            .ForMember(dest => dest.ProgressPercentage, opt => opt.MapFrom(src => 
                src.Objectives.Count == 0 ? 0 : src.Objectives.Average(o => o.ProgressPercentage)));

        CreateMap<Project, ProjectListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CreatedByFirstName, opt => opt.MapFrom(src => src.CreatedByUser.FirstName))
            .ForMember(dest => dest.CreatedByLastName, opt => opt.MapFrom(src => src.CreatedByUser.LastName))
            .ForMember(dest => dest.TeamMemberCount, opt => opt.MapFrom(src => src.TeamMembers.Count))
            .ForMember(dest => dest.ObjectiveCount, opt => opt.MapFrom(src => src.Objectives.Count))
            .ForMember(dest => dest.TeamMembers, opt => opt.MapFrom(src => src.TeamMembers))
            .ForMember(dest => dest.Objectives, opt => opt.MapFrom(src => src.Objectives))
            .ForMember(dest => dest.Resources, opt => opt.MapFrom(src => src.Resources))
            .ForMember(dest => dest.ProgressPercentage, opt => opt.MapFrom(src => 
                src.Objectives.Count == 0 ? 0 : src.Objectives.Average(o => o.ProgressPercentage)));

        CreateMap<CreateProjectDto, Project>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.TeamMembers, opt => opt.Ignore())
            .ForMember(dest => dest.Objectives, opt => opt.Ignore())
            .ForMember(dest => dest.Resources, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Enum.Parse<ProjectStatus>(src.Status, true)));

        CreateMap<UpdateProjectDto, Project>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.TeamMembers, opt => opt.Ignore())
            .ForMember(dest => dest.Objectives, opt => opt.Ignore())
            .ForMember(dest => dest.Resources, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Enum.Parse<ProjectStatus>(src.Status, true)));

        // Objective mappings
        CreateMap<Objective, ObjectiveDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CreatedByFirstName, opt => opt.MapFrom(src => src.CreatedByUser.FirstName))
            .ForMember(dest => dest.CreatedByLastName, opt => opt.MapFrom(src => src.CreatedByUser.LastName))
            .ForMember(dest => dest.TeamMembers, opt => opt.MapFrom(src => src.TeamMembers))
            .ForMember(dest => dest.Resources, opt => opt.MapFrom(src => src.Resources));

        CreateMap<CreateObjectiveDto, Objective>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.Project, opt => opt.Ignore())
            .ForMember(dest => dest.TeamMembers, opt => opt.Ignore())
            .ForMember(dest => dest.Resources, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Enum.Parse<ObjectiveStatus>(src.Status, true)));

        CreateMap<UpdateObjectiveDto, Objective>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ProjectId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.Project, opt => opt.Ignore())
            .ForMember(dest => dest.TeamMembers, opt => opt.Ignore())
            .ForMember(dest => dest.Resources, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Enum.Parse<ObjectiveStatus>(src.Status, true)));

        // Resource mappings
        CreateMap<Resource, ResourceDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));

        CreateMap<CreateResourceDto, Resource>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Project, opt => opt.Ignore())
            .ForMember(dest => dest.Objective, opt => opt.Ignore())
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<ResourceType>(src.Type, true)));

        CreateMap<UpdateResourceDto, Resource>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ProjectId, opt => opt.Ignore())
            .ForMember(dest => dest.ObjectiveId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Project, opt => opt.Ignore())
            .ForMember(dest => dest.Objective, opt => opt.Ignore())
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<ResourceType>(src.Type, true)));

        // Team member mappings (ProjectTeamMember)
        CreateMap<ProjectTeamMember, TeamMemberDto>()
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
            .ForMember(dest => dest.JoinedAt, opt => opt.MapFrom(src => src.JoinedAt));

        // Team member mappings (ObjectiveTeamMember)
        CreateMap<ObjectiveTeamMember, TeamMemberDto>()
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
            .ForMember(dest => dest.Role, opt => opt.Ignore())
            .ForMember(dest => dest.JoinedAt, opt => opt.MapFrom(src => src.AssignedAt));
    }
}
