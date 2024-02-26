import { LogParamsDto, UserParamsDto } from "@domain/model/params"
import UserDomainService from "@domain/service/UserDomainService"
import * as UserSchema from "@helpers/JoiSchema/User"
import { checkPassword, hashPassword } from "@helpers/Password/Password"
import LogDomainService from "@domain/service/LogDomainService"
import { AppDataSource } from "@infrastructure/mysql/connection"
import { Profanity } from "indonesian-profanity"
import { BadInputError } from "@domain/model/Error/Error"
export default class UserAppService {
    static async GetUserProfileService(id: number) {
        await UserSchema.GetUserProfile.validateAsync(id)

        const user = await UserDomainService.GetUserDataByIdDomain(id)

        return user
    }

    static async UpdateUserProfileService(params: UserParamsDto.UpdateUserParams, logData: LogParamsDto.CreateLogParams) {
        await UserSchema.UpdateUserProfile.validateAsync(params)

        //Additional name checking
        const banned = ["SuperAdmin", "Product Management Staff", "User Management Staff", "Shipping and Transaction Management Staff"]

        if (banned.includes(params.name) || Profanity.flag(params.name.toLowerCase())) {
            throw new BadInputError("YOUR_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_NAME")
        }

        const user = await UserDomainService.GetUserDataByIdDomain(params.id)

        if (user.email != params.email) {
            const userEmailExist = await UserDomainService.GetUserEmailExistDomainService(params.email)
            if (userEmailExist.length > 0) {
                throw new BadInputError("EMAIL_IS_NOT_AVAILABLE_TO_USE")
            }
        }

        const updateProfileObject: UserParamsDto.UpdateUserEditProfileParams = {
            id: user.id,
            email: params.email,
            name: params.name,
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await UserDomainService.UpdateUserEditProfileDomainService(updateProfileObject, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return updateProfileObject
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async ChangePasswordService(params: UserParamsDto.ChangePasswordParams, logData: LogParamsDto.CreateLogParams) {
        await UserSchema.ChangePassword.validateAsync(params)

        const passEncrypt = await hashPassword(params.newPassword)

        const getUserById = await UserDomainService.GetUserPasswordByIdDomain(params.id)

        const sama = await checkPassword(params.oldPassword, getUserById.password)
        if (!sama) {
            throw new BadInputError("INVALID_OLD_PASSWORD")
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const result = await UserDomainService.UpdatePasswordDomain(passEncrypt, params.id, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return result
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }
}
