import { AssignRuleRequest, RevokeRuleRequest, UpdateRuleRequest } from "../request/AdminRequest";

export type UpdateProfileUserParams = {
    id: number;
    userid: number
    email: string;
    name: string;
}

export type UpdateProfileParams = {
    id: number;
    email: string;
    name: string;
}

export type DeleteUserParams = {
    id: number;
    email: string;
}

export type GetUserDetailProfileParams = {
    id: number;
    email: string;
}

export type UpdateRuleParams = UpdateRuleRequest

export type AssignRuleParams = AssignRuleRequest

export type RevokeRuleParams = RevokeRuleRequest

export type ChangeUserPassParams = {
    userid: number;
    password: string;
    confirmPassword: string;
}

export type ChangePasswordParams = {
    id: number;
    oldPassword: string;
    newPassword: string;
}

export type GetUserTransactionListByIdParams = {
    userid: number;
}