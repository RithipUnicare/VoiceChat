// API Response Types
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface UserResponse {
    id: number;
    name: string;
    mobileNumber: string;
    email: string;
    role: string;
}

export interface VoiceNoteResponse {
    id: number;
    title: string;
    audioUrl: string;
    durationInSeconds: number;
    language: string;
    transcriptText: string;
    createdAt: string;
}

export interface VoiceNoteSummaryResponse {
    id: number;
    title: string;
    audioUrl: string;
    durationInSeconds: number;
    language: string;
    createdAt: string;
}

// API Request Types
export interface LoginRequest {
    mobileNumber: string;
    password: string;
}

export interface SignupRequest {
    name: string;
    mobileNumber: string;
    email: string;
    password: string;
}

export interface UserUpdateRequest {
    name: string;
    email: string;
}

export interface VoiceNoteRenameRequest {
    title: string;
}

export interface VoiceNoteUploadRequest {
    title: string;
    transcriptText: string;
    durationInSeconds: number;
    language: string;
}


export interface RoleUpdateRequest {
    mobileNumber: string;
    roles: string;
}

// Navigation Types
export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token: string };
    MainTabs: undefined;
    Home: undefined;
    Profile: undefined;
    VoiceNoteDetail: { id: number };
    CreateVoiceNote: undefined;
};
