import { getValidCityIdentifiers, markets } from "@/components/utils/mappings";
import { AptosClient, HexString, Types } from "aptos";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const aptosChainId = 0; // TODO

//const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
//const NODE_URL = "127.0.0.1:8070";
//const client = new AptosClient(NODE_URL);
const aptosConfig = new AptosConfig({ network: Network.DEVNET });
export const aptos = new Aptos(aptosConfig);

interface MvpContracts {
  master: `0x${string}`;
  oracle: `0x${string}`;
}

// WITH DEBUG MODE
export const aptosContracts: MvpContracts = {
  master: "0xd157a46accb1dd16122980064f2bfb90046ea134a26354ab5d1d7729a26b5855",
  oracle: "0xd157a46accb1dd16122980064f2bfb90046ea134a26354ab5d1d7729a26b5855",
};

export function getContracts(
  chainId: number | undefined,
): MvpContracts | undefined {
  return aptosContracts;
}

export async function fetchOracleValue(
  oracleAddress: string,
  categoryId: number,
  cityName: string,
): Promise<number> {
  try {
    // Convert the city name to a byte array (Uint8Array)
    const cityNameBytes = new TextEncoder().encode(cityName);

    const result = await aptos.view({
      payload: {
        function: `${aptosContracts.oracle}::oracle::get_value`,
        typeArguments: [],
        functionArguments: [
          oracleAddress, // oracle_addr
          categoryId, // category_id
          Array.from(cityNameBytes), // city_name as a vector<u8>
        ],
      },
    });

    const oracleValue = parseInt(result[0] as string, 10);

    return oracleValue;
  } catch (error) {
    console.error("Error fetching oracle value:", error);
    throw error;
  }
}

export async function getPlayerInfo(playerAddress: string) {
  const masterResourceType = `${aptosContracts.master}::master::Master`;

  const master = await aptos.getAccountResource({
    accountAddress: aptosContracts.master,
    resourceType: masterResourceType as `${string}::${string}::${string}`,
  });

  const playersTableHandle = master.players.handle;

  const player = await aptos.getTableItem({
    handle: playersTableHandle,
    key: playerAddress, // Using address as table key
    keyType: "address", // Key type based on your table definition
    valueType: `${aptosContracts.master}::master::Player`, // Player struct type
  });

  return player;
}

export async function fetchPositionEvents (masterAddress: address) {
  const EVENT_HANDLE = `${masterAddress}::master::Master`;
  const FIELD_NAME = "PositionCreatedEvents";

  const response = await axios.get(
    `https://fullnode.devnet.aptoslabs.com/v1/accounts/${MASTER_ADDRESS}/events/${EVENT_HANDLE}/${FIELD_NAME}`
  );

  return response.data;
};

export async function fetchPlayerPositions(
  masterAddress: string,
  playerAddress: string,
  cityName: string,
  categoryId: number,
): Promise<string> {
  try {
    // Convert the city name to a byte array (Uint8Array)
    const cityNameBytes = new TextEncoder().encode(cityName);

    const result = await aptos.view({
      payload: {
        function: `${aptosContracts.master}::master::get_player_positions`,
        typeArguments: [],
        functionArguments: [
          masterAddress,
          playerAddress,
          Array.from(cityNameBytes), // city_name as a vector<u8>
          categoryId, // category_id
        ],
      },
    });

    console.log(result);
    //const playerPositions = parseInt(result[0] as string, 10);

    //return playerPositions;
    return "";
  } catch (error) {
    console.error("Error fetching oracle value:", error);
    throw error;
  }
}

export async function createPosition(
  masterAddress: string,
  cityName: string,
  categoryId: number,
  timeframe: number,
  long: boolean,
): Promise<string> {
  try {
    // Convert the city name to a byte array (Uint8Array)
    const cityNameBytes = new TextEncoder().encode(cityName);

    const result = await aptos.view({
      payload: {
        function: `${aptosContracts.master}::master::get_player_positions`,
        typeArguments: [],
        functionArguments: [
          masterAddress,
          categoryId, // category_id
          Array.from(cityNameBytes), // city_name as a vector<u8>
          timeframe,
          long,
        ],
      },
    });

    console.log(result);
    //const playerPositions = parseInt(result[0] as string, 10);

    //return playerPositions;
    return "";
  } catch (error) {
    console.error("Error creating position:", error);
    throw error;
  }
}

export async function getActivePlayers(masterAddress: string): Promise<string> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${aptosContracts.master}::master::get_active_players`,
        typeArguments: [],
        functionArguments: [masterAddress],
      },
    });

    console.log(result);
    //const playerPositions = parseInt(result[0] as string, 10);

    //return playerPositions;
    return "";
  } catch (error) {
    console.error("Error fetching active players:", error);
    throw error;
  }
}
