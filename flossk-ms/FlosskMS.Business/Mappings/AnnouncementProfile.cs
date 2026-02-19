using AutoMapper;
using FlosskMS.Business.DTOs;
using FlosskMS.Data.Entities;

namespace FlosskMS.Business.Mappings;

public class AnnouncementProfile : Profile
{
    public AnnouncementProfile()
    {
        CreateMap<Announcement, AnnouncementDto>()
            .ForMember(dest => dest.Importance, opt => opt.MapFrom(src => src.Importance.ToString()))
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()))
            .ForMember(dest => dest.CreatedByFirstName, opt => opt.MapFrom(src => src.CreatedByUser.FirstName))
            .ForMember(dest => dest.CreatedByLastName, opt => opt.MapFrom(src => src.CreatedByUser.LastName))
            .ForMember(dest => dest.CreatedByProfilePicture, opt => opt.MapFrom(src => 
                src.CreatedByUser != null && src.CreatedByUser.UploadedFiles != null
                    ? src.CreatedByUser.UploadedFiles
                        .Where(f => f.FileType == FileType.ProfilePicture)
                        .Select(f => "/uploads/" + f.FileName)
                        .FirstOrDefault()
                    : null))
            .ForMember(dest => dest.Reactions, opt => opt.Ignore());

        CreateMap<CreateAnnouncementDto, Announcement>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ViewCount, opt => opt.Ignore())
            .ForMember(dest => dest.IsEdited, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.Reactions, opt => opt.Ignore())
            .ForMember(dest => dest.Importance, opt => opt.MapFrom(src => Enum.Parse<AnnouncementImportance>(src.Importance, true)))
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => Enum.Parse<AnnouncementCategory>(src.Category, true)));

        CreateMap<UpdateAnnouncementDto, Announcement>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ViewCount, opt => opt.Ignore())
            .ForMember(dest => dest.IsEdited, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.Reactions, opt => opt.Ignore())
            .ForMember(dest => dest.Importance, opt => opt.MapFrom(src => Enum.Parse<AnnouncementImportance>(src.Importance, true)))
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => Enum.Parse<AnnouncementCategory>(src.Category, true)));
    }
}
