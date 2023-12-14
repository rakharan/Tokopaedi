import { UserParamsDto } from "@domain/model/params";
import UserDomainService from "@domain/service/UserDomainService";
import * as UserSchema from "helpers/JoiSchema/User";
import { checkPassword, hashPassword } from "helpers/Password/Password"

const prohibitedWords = require("indonesian-badwords")

export default class UserAppService {
    static async GetUserProfileService({id}) {
        await UserSchema.GetUserProfile.validateAsync({id})

        const user = await UserDomainService.GetUserDataByIdDomain(id)

        return user
    }

    static async UpdateUserProfileService(params: UserParamsDto.UpdateUserParams){
        await UserSchema.UpdateUserProfile.validateAsync(params)

        if (params.id < 1){
            throw new Error ("User not found")
        }

        const user = await UserDomainService.GetUserDataByIdDomain(params.id)

        if (user.id < 1){
            throw new Error ("User not found")
        }

        if (user.email != params.email){
            let userEmailExist = await UserDomainService.GetUserEmailExistDomainService(params.email)
            if (userEmailExist.length > 0) {
                throw new Error ("Email is not available")
            }
        }

        let banned = [
            "SuperAdmin",
            "Product Management Staff",
            "User Management Staff",
            "Shipping and Transaction Management Staff",
        ]

        if (banned.includes(params.name) || prohibitedWords.flag(params.name)){
            throw new Error("Banned words name")
        }

        const obj: UserParamsDto.UpdateUserEditProfileParams = {
            id: user.id,
            email: params.email,
            name: params.name
        }

        await UserDomainService.UpdateUserEditProfileDomainService(obj)

        return obj
    }

    static async ChangePasswordService(params: UserParamsDto.ChangePasswordParams){
        await UserSchema.ChangePassword.validateAsync(params)

        if (params.id < 1){
            throw new Error ("User not found")
        }

        const passEncrypt = await hashPassword(params.newPassword)

        const getUserById = await UserDomainService.GetUserPasswordByIdDomain(params.id)

        if (getUserById.id > 1){
            const sama = await checkPassword(params.oldPassword, getUserById.password)
            if (!sama){
                throw new Error ("Invalid old password")
            }

            const result = await UserDomainService.UpdatePasswordDomain(passEncrypt, params.id)
            return result
        }
    }
}