import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DirectMessage {
    id: bigint;
    content: string;
    toPrincipal: Principal;
    fromPrincipal: Principal;
    timestamp: bigint;
    fromUsername: string;
    imageId?: string;
}
export interface CommunityMessage {
    id: bigint;
    authorUsername: string;
    content: string;
    timestamp: bigint;
    imageId?: string;
    channel: CommunityChannel;
    authorPrincipal: Principal;
}
export interface CashflowEntry {
    id: bigint;
    entryType: EntryType;
    userId: Principal;
    date: bigint;
    entryLabel: string;
    amount: number;
}
export interface Task {
    id: bigint;
    title: string;
    userId: Principal;
    createdAt: bigint;
    completed: boolean;
}
export interface Habit {
    id: bigint;
    completions: Array<bigint>;
    userId: Principal;
    name: string;
    createdAt: bigint;
}
export interface UserProfile {
    username: string;
    displayName: string;
    avatarId?: string;
}
export enum CommunityChannel {
    general = "general",
    announcements = "announcements"
}
export enum EntryType {
    expense = "expense",
    investment = "investment",
    income = "income"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCashflowEntry(entryType: EntryType, entryLabel: string, amount: number, date: bigint): Promise<bigint>;
    addHabit(name: string): Promise<bigint>;
    addTask(title: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeTask(taskId: bigint): Promise<boolean>;
    deleteCashflowEntry(entryId: bigint): Promise<boolean>;
    deleteHabit(habitId: bigint): Promise<boolean>;
    deleteTask(taskId: bigint): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCashflowEntries(): Promise<Array<CashflowEntry>>;
    getCashflowSummary(): Promise<{
        totalIncome: number;
        totalInvestments: number;
        totalExpenses: number;
        savings: number;
    }>;
    getChannelMessages(channel: CommunityChannel): Promise<Array<CommunityMessage>>;
    getConversationList(): Promise<Array<{
        otherUsername: string;
        lastMessage: string;
        timestamp: bigint;
        otherPrincipal: Principal;
    }>>;
    getDirectMessages(otherPrincipal: Principal): Promise<Array<DirectMessage>>;
    getHabits(): Promise<Array<Habit>>;
    getTasks(): Promise<Array<Task>>;
    getUserList(): Promise<Array<{
        principal: Principal;
        username: string;
        displayName: string;
        avatarId?: string;
    }>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWealthGoal(): Promise<number | null>;
    getWealthProgress(): Promise<{
        goal: number;
        currentSavings: number;
        percentage: number;
    }>;
    isCallerAdmin(): Promise<boolean>;
    isFounder(): Promise<boolean>;
    markHabitComplete(habitId: bigint, dayTimestamp: bigint): Promise<boolean>;
    postToChannel(channel: CommunityChannel, content: string, imageId: string | null): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendDirectMessage(toPrincipal: Principal, content: string, imageId: string | null): Promise<bigint>;
    setWealthGoal(amount: number): Promise<boolean>;
}
