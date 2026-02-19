using AutoMapper;
using FlosskMS.Business.DTOs;
using FlosskMS.Data.Entities;

namespace FlosskMS.Business.Mappings;

public class InventoryProfile : Profile
{
    public InventoryProfile()
    {
        // InventoryItem mappings
        CreateMap<InventoryItem, InventoryItemDto>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CurrentUserEmail, opt => opt.MapFrom(src => src.CurrentUser != null ? src.CurrentUser.Email : null))
            .ForMember(dest => dest.CurrentUserFirstName, opt => opt.MapFrom(src => src.CurrentUser != null ? src.CurrentUser.FirstName : null))
            .ForMember(dest => dest.CurrentUserLastName, opt => opt.MapFrom(src => src.CurrentUser != null ? src.CurrentUser.LastName : null))
            .ForMember(dest => dest.CurrentUserFullName, opt => opt.MapFrom(src => 
                src.CurrentUser != null 
                    ? $"{src.CurrentUser.FirstName} {src.CurrentUser.LastName}".Trim() 
                    : null))
            .ForMember(dest => dest.CurrentUserProfilePictureUrl, opt => opt.MapFrom(src => 
                src.CurrentUser != null && src.CurrentUser.UploadedFiles != null
                    ? src.CurrentUser.UploadedFiles
                        .Where(f => f.FileType == FileType.ProfilePicture)
                        .Select(f => "/uploads/" + f.FileName)
                        .FirstOrDefault()
                    : null))
            .ForMember(dest => dest.CreatedByUserEmail, opt => opt.MapFrom(src => src.CreatedByUser.Email))
            .ForMember(dest => dest.CreatedByUserFirstName, opt => opt.MapFrom(src => src.CreatedByUser.FirstName))
            .ForMember(dest => dest.CreatedByUserLastName, opt => opt.MapFrom(src => src.CreatedByUser.LastName))
            .ForMember(dest => dest.CreatedByUserFullName, opt => opt.MapFrom(src => 
                $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}".Trim()))
            .ForMember(dest => dest.CreatedByUserProfilePictureUrl, opt => opt.MapFrom(src => 
                src.CreatedByUser != null && src.CreatedByUser.UploadedFiles != null
                    ? src.CreatedByUser.UploadedFiles
                        .Where(f => f.FileType == FileType.ProfilePicture)
                        .Select(f => "/uploads/" + f.FileName)
                        .FirstOrDefault()
                    : null))
            .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images));

        CreateMap<InventoryItem, InventoryItemListDto>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CurrentUserEmail, opt => opt.MapFrom(src => src.CurrentUser != null ? src.CurrentUser.Email : null))
            .ForMember(dest => dest.CurrentUserFirstName, opt => opt.MapFrom(src => src.CurrentUser != null ? src.CurrentUser.FirstName : null))
            .ForMember(dest => dest.CurrentUserLastName, opt => opt.MapFrom(src => src.CurrentUser != null ? src.CurrentUser.LastName : null))
            .ForMember(dest => dest.CurrentUserFullName, opt => opt.MapFrom(src => 
                src.CurrentUser != null 
                    ? $"{src.CurrentUser.FirstName} {src.CurrentUser.LastName}".Trim() 
                    : null))
            .ForMember(dest => dest.CurrentUserProfilePictureUrl, opt => opt.MapFrom(src => 
                src.CurrentUser != null && src.CurrentUser.UploadedFiles != null
                    ? src.CurrentUser.UploadedFiles
                        .Where(f => f.FileType == FileType.ProfilePicture)
                        .Select(f => "/uploads/" + f.FileName)
                        .FirstOrDefault()
                    : null))
            .ForMember(dest => dest.ThumbnailPath, opt => opt.MapFrom(src => 
                src.Images.FirstOrDefault() != null 
                    ? "/uploads/" + src.Images.FirstOrDefault()!.UploadedFile.FileName 
                    : null))
            .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images));

        CreateMap<InventoryItemImage, InventoryItemImageDto>()
            .ForMember(dest => dest.FileId, opt => opt.MapFrom(src => src.UploadedFileId))
            .ForMember(dest => dest.FileName, opt => opt.MapFrom(src => src.UploadedFile.FileName))
            .ForMember(dest => dest.FilePath, opt => opt.MapFrom(src => "/uploads/" + src.UploadedFile.FileName));

        CreateMap<CreateInventoryItemDto, InventoryItem>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentUser, opt => opt.Ignore())
            .ForMember(dest => dest.CheckedOutAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.Images, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => Enum.Parse<InventoryCategory>(src.Category, true)));
    }
}
