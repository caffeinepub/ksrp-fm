import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    id: bigint;
    title: string;
    thumbnailUrl: string;
    createdAt: Time;
    description: string;
    isPremiumOnly: boolean;
    genre: Genre;
    durationSeconds: bigint;
    videoUrl: string;
}
export type Time = bigint;
export interface WatchProgress {
    lastWatchedAt: Time;
    completed: boolean;
    watchedSeconds: bigint;
    videoId: bigint;
}
export interface User {
    isPremium: boolean;
    mobileNumber: string;
    premiumExpiresAt?: Time;
    passwordHash: Hash;
    lastName: string;
    firstName: string;
}
export interface PremiumRequest {
    id: bigint;
    status: PremiumRequestStatus;
    userId: Principal;
    plan: PremiumPlan;
    submittedAt: Time;
    reviewedAt?: Time;
    utrId: string;
}
export type Hash = string;
export interface UserProfile {
    isPremium: boolean;
    mobileNumber: string;
    premiumExpiresAt?: Time;
    lastName: string;
    firstName: string;
}
export interface PaymentSettings {
    upiId: string;
    qrCodeUrl: string;
}
export enum Genre {
    Action = "Action",
    Romance = "Romance",
    Thriller = "Thriller"
}
export enum PremiumPlan {
    Monthly = "Monthly",
    Yearly = "Yearly"
}
export enum PremiumRequestStatus {
    Approved = "Approved",
    Rejected = "Rejected",
    Pending = "Pending"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContinueWatching(): Promise<Array<WatchProgress>>;
    getPendingPremiumRequests(): Promise<Array<PremiumRequest>>;
    getPremiumRequests(): Promise<Array<PremiumRequest>>;
    getUser(mobileNumber: string): Promise<User | null>;
    getUserPremiumStatus(): Promise<[boolean, Time | null]>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideoById(id: bigint): Promise<Video | null>;
    getWatchProgress(videoId: bigint): Promise<WatchProgress | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listAllVideos(): Promise<Array<Video>>;
    listVideosByGenre(genre: Genre): Promise<Array<Video>>;
    login(mobileNumber: string, passwordHash: Hash): Promise<boolean>;
    recordProgress(videoId: bigint, watchedSeconds: bigint): Promise<boolean>;
    register(firstName: string, lastName: string, mobileNumber: string, passwordHash: Hash): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitPremiumRequest(plan: PremiumPlan, utrId: string): Promise<bigint>;
    verifyPremiumRequest(requestId: bigint, approve: boolean): Promise<boolean>;
    getPaymentSettings(): Promise<PaymentSettings>;
    updatePaymentSettings(upiId: string, qrCodeUrl: string): Promise<boolean>;
}
