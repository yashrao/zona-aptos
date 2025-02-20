import { get } from "../../../common/api/index";

export function getLondonIndexData(sheetID, range) {
  return get(`/api/v1/index-data?sheetID=${sheetID}&range=${range}`);
}
