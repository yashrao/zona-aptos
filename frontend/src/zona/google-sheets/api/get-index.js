import { get } from "../../../common/api/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function getIndexData(city, type) {
  return get(`${API_BASE_URL}/api/v1/index-data?city=${city}&index=${type}`);
}
