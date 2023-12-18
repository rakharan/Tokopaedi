import { ShippingAddressRepository } from "@adapters/outbound/repository/ShippingAddressRepository"
import { PaginationParamsDto, ShippingAddressParamsDto } from "@domain/model/params"

export default class ShippingAddressDomainService {
    static async CreateShippingAddressDomain(params: ShippingAddressParamsDto.CreateShippingAddressParams) {
        const shippingAddress = await ShippingAddressRepository.DBCreateShippingAddress(params)
        if (shippingAddress.affectedRows < 1) {
            throw new Error("Create Shipping Address Failed!")
        }
    }

    static async GetShippingAddressDetailDomain(id: number) {
        const shippingAddress = await ShippingAddressRepository.DBGetShippingAddressDetail(id)
        if (shippingAddress.length < 1) {
            throw new Error("Shipping Address Not Found!")
        }
        return shippingAddress[0]
    }

    static async GetShippingAddressListDomain(user_id: number, paginationParams: PaginationParamsDto.RepoPaginationParams) {
        const shippingAddress = await ShippingAddressRepository.DBGetShippingAddressList(user_id, paginationParams)
        if (shippingAddress.length < 1) {
            throw new Error("Shipping Address Not Found!")
        }
        return shippingAddress
    }

    static async DeleteShippingAddressDomain(id: number) {
        const shippingAddress = await ShippingAddressRepository.DBDeleteShippingAddress(id)
        if (shippingAddress.affectedRows < 1) {
            throw new Error("Failed to Delete Shipping Address")
        }
    }


    static async UpdateShippingAddressDomain(params: ShippingAddressParamsDto.UpdateShippingAddressParams) {
        const shippingAddress = await ShippingAddressRepository.DBUpdateShippingAddress(params)
        if (shippingAddress.affectedRows < 1) {
            throw new Error("Failed to Update Shipping Address")
        }
    }

    static async GetUserShippingAddressByIdDomain(user_id: number){
        const result = await ShippingAddressRepository.DBGetUserShippingAddressById(user_id)
        if (result.length < 1){
            throw new Error("Shipping address not found")
        }
        return result
    }
}