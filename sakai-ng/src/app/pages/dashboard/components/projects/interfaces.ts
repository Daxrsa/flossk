export interface Member {
    name: string;
    avatar: string;
    role: string;
}

export interface Resource {
    id: string;
    title: string;
    url: string;
    description: string;
    type: 'documentation' | 'tutorial' | 'tool' | 'reference' | 'other';
}

export interface Objective {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'completed';
    assignedTo: Member;
    progress: number;
    members?: Member[];
    resources?: Resource[];
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'upcoming' | 'in-progress' | 'completed';
    startDate: string;
    endDate: string;
    progress: number;
    objectiveCount: number;
    teamMemberCount: number;
    createdBy: Member;
    participants: Member[];
    objectives: Objective[];
    resources?: Resource[];
    githubRepo?: string;
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