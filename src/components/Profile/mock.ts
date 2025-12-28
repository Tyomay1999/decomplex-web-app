import type {ApplicationMock, ProfileMock} from "./ProfilePage";

export const mockProfile: ProfileMock = {
    firstName: "John",
    lastName: "Doe",
    email: "user@example.com",
    userType: "candidate",
    memberSince: "2024-01-15T00:00:00.000Z",
};

export const mockApplications: ApplicationMock[] = [
    {
        id: "app-1",
        vacancyTitle: "Senior Frontend Developer",
        companyName: "TechCorp Inc.",
        appliedDate: "2025-12-01T12:00:00.000Z",
        status: "pending",
    },
];
