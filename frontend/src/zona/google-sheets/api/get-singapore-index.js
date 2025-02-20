import { get } from "../../../common/api/index";

export function getSingaporeIndexData(sheetID, range) {
  return get(`/api/v1/index-data?sheetID=${sheetID}&range=${range}`);
}
