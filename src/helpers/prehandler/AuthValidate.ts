import { User } from "@domain/model/BaseClass/User"
import { UserClaimsResponse } from "@domain/model/response/UserResponse"
import { FastifyRequest } from "fastify"
import { verifyJWT } from "@helpers/jwt/jwt"
import Joi from "joi"
import { UnauthorizedError } from "@domain/model/Error/Error"
import DotenvFlow from "dotenv-flow"
import path from "path"

DotenvFlow.config({ path: path.resolve(__dirname, `../../../`) })

declare module "fastify" {
    interface FastifyRequest {
        user: User
    }
}

type AuthorizeParams = {
    rules: number
    user_level: number
    user_authority: number[]
}
const superadmin_level = parseInt(process.env.SUPER_ADMIN_LEVEL || "0")
if (!superadmin_level) throw new Error("Please set Super Admin Level")

const schema = Joi.object({
    rules: Joi.number().required(),
    user_level: Joi.number().required(),
    user_authority: Joi.array().items(Joi.number()).required(),
})

function authorize(data: AuthorizeParams): number {
    try {
        const { error } = schema.validate(data)
        if (error || (data.user_authority.length < 1 && superadmin_level !== data.user_level)) return 0
        return superadmin_level === data.user_level || data.user_authority.includes(data.rules) ? 1 : 0
    } catch (x_x) {
        console.log(x_x)
        return 0
    }
}

const checkClaims = Joi.object({
    id: Joi.number().required(),
    level: Joi.number().required(),
    authority: Joi.array().items(Joi.number()).required(),
}).unknown(true)

export async function AuthValidate(request: FastifyRequest) {
    if (!request.headers?.authorization) throw new UnauthorizedError("PLEASE_LOGIN_FIRST")

    const user_claims = await verifyJWT<UserClaimsResponse>(request.headers.authorization, process.env.JWT_SECRET)
    await checkClaims.validateAsync(user_claims)

    request.user = new User().set(user_claims)
}

export function CheckAuthAdmin({ rules }: { rules: number }) {
    return async function (request: FastifyRequest) {
        const { user } = request
        if (user.id < 1 || (rules && !authorize({ rules, user_level: user.level, user_authority: user.authority }))) {
            throw new UnauthorizedError(user.id < 1 ? "PLEASE_LOGIN_FIRST" : "NOT_ENOUGH_RIGHTS")
        }
    }
}
