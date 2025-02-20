import { encodePacked, keccak256 } from "viem";

export const markets = [
  //{
  //  city: "Hong Kong",
  //  identifier: "hongkong",
  //  code: "HKG",
  //  flag: "/images/logo/zona_hk_logo.svg",
  //  currency: "AQHI",
  //  type: "Air Quality",
  //  oracleKey:
  //    "0xf4c4dc4a15aa8870a6b0bbf2c0dd74d74d77c34e97e319b7aed0bca440155c44",
  //},
  //{
  //  city: "Delhi",
  //  identifier: "delhi",
  //  code: "DEL",
  //  flag: "/images/logo/zona_delhi_logo.svg",
  //  currency: "AHQI",
  //  type: "Air Quality",
  //  oracleKey:
  //    "0xf6d9a20bcd39b8c524ce14ed2d048dd237472b40559f3e846191d423257082be",
  //},
  {
    city: "Hong Kong",
    identifier: "hongkong",
    code: "HKG",
    flag: "/images/logo/zona_hk_logo.svg",
    currency: "HKD",
    type: "Real Estate",
    oracleKey:
      "0xd34101d36a6a140923c7b3d65ead7644cfe82f453928bc55e7e74c3e3d465953",
  },
  {
    city: "Singapore",
    identifier: "singapore",
    code: "SG",
    flag: "/images/logo/zona_sg_logo.svg",
    currency: "SGD",
    type: "Real Estate",
    oracleKey:
      "0x0b821965931a8338f1dee22de14f56d1f6bc6bc01ddee2f0b5ddc37c40e88699",
  },
  {
    city: "Dubai",
    identifier: "dubai",
    code: "DB",
    flag: "/images/logo/zona_db_logo.svg",
    currency: "AED",
    type: "Real Estate",
    oracleKey:
      "0x333d92e3184873bea39dc2c392195e3a4287c2e91781562a9f9588b78ec62fdb",
  },
  //{
  //  city: "Sydney",
  //  identifier: "sydney",
  //  code: "SYD",
  //  flag: "/images/logo/zona_aus_logo.svg",
  //  currency: "AUD",
  //  type: "Real Estate",
  //  oracleKey:
  //    "0x18e2cc6d9736bfeae87c4cc9c7018b04db575b19981a026e07ffa8ef06b085ef",
  //},
  //{
  //  city: "Melbourne",
  //  identifier: "melbourne",
  //  code: "MLB",
  //  flag: "/images/logo/zona_aus_logo.svg",
  //  currency: "AUD",
  //  type: "Real Estate",
  //  oracleKey:
  //    "0xda84488a223388c2ea8a3558a1e22503d99f6f2c1612dc3f934a85d251026987",
  //},
  //{
  //  city: "Brisbane",
  //  identifier: "brisbane",
  //  code: "BRB",
  //  flag: "/images/logo/zona_aus_logo.svg",
  //  currency: "AUD",
  //  type: "Real Estate",
  //  oracleKey:
  //    "0x897601ae7ab1f137f88e83361093bd700ae35972c14c236dd4cb0764d2e286c0",
  //},
  //{
  //  city: "Adelaide",
  //  identifier: "adelaide",
  //  code: "ADL",
  //  flag: "/images/logo/zona_aus_logo.svg",
  //  currency: "AUD",
  //  type: "Real Estate",
  //  oracleKey:
  //    "0x11f5aa7b8f858c649e221d9a41ecbaa6853fd80f4d7c0c0b4edbe29d0833e831",
  //},
  {
    city: "London",
    identifier: "london",
    code: "LDN",
    flag: "/images/logo/zona_uk_logo.svg",
    currency: "GBP",
    type: "Real Estate",
    oracleKey:
      "0x323183d1f0f7196b831085e1901ad8fc9c4d0ac1f19b47ed67077ad9e8c594d6",
  },
];

export function getValidCityIdentifiers(): string[] {
  const ret: string[] = [];
  markets.forEach((market) => {
    ret.push(market.identifier)
  });
  return ret;
}

export function calculateOracleKey(
  categoryId: number,
  cityName: string,
): string {
  // Use encodePacked to replicate abi.encodePacked(categoryId, cityName)
  const packedData = encodePacked(
    ["uint256", "string"], // Types of the inputs
    [BigInt(categoryId), cityName], // Values of the inputs
  );

  // Use keccak256 to hash the packed data
  return keccak256(packedData);
}

export function calculatePositionKey(
  categoryId: number,
  cityName: string,
  timeframeIndex: number,
): string {
  const packedData = encodePacked(
    ["uint256", "string", "uint256"],
    [BigInt(categoryId), cityName, BigInt(timeframeIndex)],
  );
  return keccak256(packedData);
}

export function getMarketType(categoryId: number): string {
  return categoryId === 0 ? "Real Estate" : "Air Quality";
}
