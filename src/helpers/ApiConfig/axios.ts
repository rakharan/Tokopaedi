import axios from "axios";
import DotenvFlow from "dotenv-flow";
import path from "path";

DotenvFlow.config({
    path: path.resolve(__dirname, `../../../`)
})

export const RajaOngkirApi = axios.create({
    baseURL: process.env.RAJA_ONGKIR_URL,
    headers: {
        key: process.env.RAJA_ONGKIR_API_KEY
    }
})