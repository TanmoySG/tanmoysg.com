export type ExperienceItem = {
    title: string;
    company: string;
    duration: string;
    description: string;
};

export type EducationItem = {
    degree: string;
    specialization?: string;
    institution: string;
    duration: string;
};

export type Project = {
    title: string;
    text: string;
    stack: string;
    links: { label: string; url: string }[];
};

export type AboutData = {
    experience?: ExperienceItem[];
    projects?: Project[];
    skills?: string[];
    education?: EducationItem[];
};
