import { ShippingAddressRepository } from "@adapters/outbound/repository/ShippingAddressRepository"
import { ApiError, ResultNotFoundError } from "@domain/model/Error/Error"
import { ShippingAddressParamsDto } from "@domain/model/params"
import { RepoPaginationParams } from "key-pagination-sql"
import { QueryRunner } from "typeorm"

export default class ShippingAddressDomainService {
    static async CreateShippingAddressDomain(params: ShippingAddressParamsDto.CreateShippingAddressParams, query_runner?: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const shippingAddress = await ShippingAddressRepository.DBCreateShippingAddress(params, query_runner)
        if (shippingAddress.affectedRows < 1) {
            throw new ApiError("FAILED_TO_CREATE_SHIPPING_ADDRESS")
        }
    }

    static async GetShippingAddressDetailDomain(id: number) {
        const shippingAddress = await ShippingAddressRepository.DBGetShippingAddressDetail(id)
        if (shippingAddress.length < 1) {
            throw new ResultNotFoundError("SHIPPING_ADDRESS_NOT_FOUND")
        }
        return shippingAddress[0]
    }

    static async GetShippingAddressListDomain(user_id: number, paginationParams: RepoPaginationParams) {
        const shippingAddress = await ShippingAddressRepository.DBGetShippingAddressList(user_id, paginationParams)
        if (shippingAddress.length < 1) {
            throw new ResultNotFoundError("EMPTY_SHIPPING_ADDRESS")
        }
        return shippingAddress
    }

    static async SoftDeleteShippingAddressDomain(id: number, query_runner?: QueryRunner) {
        const shippingAddress = await ShippingAddressRepository.DBSoftDeleteShippingAddress(id, query_runner)
        if (shippingAddress.affectedRows < 1) {
            throw new ApiError("FAILED_TO_DELETE_SHIPPING_ADDRESS")
        }
    }

    static async UpdateShippingAddressDomain(params: ShippingAddressParamsDto.UpdateShippingAddressParams, query_runner?: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const shippingAddress = await ShippingAddressRepository.DBUpdateShippingAddress(params, query_runner)
        if (shippingAddress.affectedRows < 1) {
            throw new ApiError("FAILED_TO_UPDATE_SHIPPING_ADDRESS")
        }
    }

    static async GetUserShippingAddressByIdDomain(user_id: number, paginationParams: RepoPaginationParams) {
        const result = await ShippingAddressRepository.DBGetUserShippingAddressById(user_id, paginationParams)
        if (result.length < 1) {
            throw new ResultNotFoundError("SHIPPING_ADDRESS_NOT_FOUND")
        }
        return result
    }

    static async CheckIsShippingAddressAliveDomain(id: number) {
        const isAlive = await ShippingAddressRepository.DBCheckIsAddressAlive(Number(id))
        if (isAlive.length < 1) {
            throw new ApiError("SHIPPING_ADDRESS_IS_DELETED")
        }
        return true
    }

    static async HardDeleteShippingAddressDomain(id: number) {
        const deleteAddress = await ShippingAddressRepository.DBHardDeleteShippingAddress(id)
        if (deleteAddress.affectedRows < 1) {
            throw new ApiError("FAILED_TO_DELETE_SHIPPING_ADDRESS")
        }
    }
}
