import { HelperParamsDto } from "@domain/model/params"
import { ShippingCostsDetails } from "@domain/model/params/HelperParams"
import { RajaOngkirApi } from "@helpers/ApiConfig/axios"

export function CalculateShippingPrice(params: HelperParamsDto.CalculateShippingPrice) {
    const { shipping_type = "CTC", shipping_cost_details } = params

    const chosenService = shipping_cost_details.find((s) => s.service === shipping_type)

    return chosenService.cost[0]
}

export function CalculateTotalPrice(params: HelperParamsDto.CalculateTotalPrice) {
    return (parseInt(params.items_price) + params.shipping_price).toFixed(2)
}

export async function findDestinationId(province: string, city: string) {

    type ProvinceList = {
        province_id: string;
        province: string;
    }

    type CityList = {
        city_id: string;
        province_id: string;
        province: string;
        type: string;
        city_name: string;
        postal_code: string;
    }

    const provinceRequest = await RajaOngkirApi.get("/province")
    const cityRequest = await RajaOngkirApi.get("/city")

    const provinceList: ProvinceList[] = provinceRequest.data.rajaongkir.results
    const matchedProvince = provinceList.find((p) => p.province == province)

    const cityList: CityList[] = cityRequest.data.rajaongkir.results
    const matchedList = cityList.find((c) => c.city_name == city && c.province_id === matchedProvince.province_id)

    return matchedList.city_id
}

export async function checkShippingServicePrice({ courier, destId, orgId, weight }: { destId: string; orgId: string; weight: number; courier: string; }) {
    const shippingCosts = await RajaOngkirApi.post("/cost", {
        origin: orgId,
        destination: destId,
        weight,
        courier: courier.toLowerCase()
    })

    const results = shippingCosts.data.rajaongkir.results

    return results[0].costs as ShippingCostsDetails[]
}