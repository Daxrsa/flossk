// API response interface for team members
export interface TeamMember {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    joinedAt: string;
}

// Local/UI interface for member display (used in local mock data)
export interface Member {
    name: string;
    avatar: string;
    role: string;
}

export interface Resource {
    id: string;
    title: string;
    url: string;
    description?: string;
    type: string;
    projectId?: string;
    objectiveId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface Objective {
    id: string;
    title: string;
    description: string;
    status: string;
    progressPercentage: number;
    projectId: string;
    createdAt: string;
    updatedAt?: string;
    createdByUserId: string;
    createdByFirstName: string;
    createdByLastName: string;
    teamMembers: TeamMember[];
    resources: Resource[];
}

export interface Project {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    progressPercentage: number;
    teamMemberCount: number;
    objectiveCount: number;
    createdAt: string;
    createdByUserId: string;
    createdByFirstName: string;
    createdByLastName: string;
    teamMembers: TeamMember[];
    objectives: Objective[];
    resources: Resource[];
}

export interface GitHubCommit {
    sha: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
    };
    html_url: string;
    author?: {
        login: string;
        avatar_url: string;
    };
}

export interface GitHubRepo {
    name: string;
    full_name: string;
    html_url: string;
    updated_at: string;
}