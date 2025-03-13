import { createInstance as createFhevmInstance } from "fhevmjs";
import { FhevmInstance } from "fhevmjs/node";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ACL_ADDRESS, GATEWAY_URL, KMSVERIFIER_ADDRESS } from "../test/constants";

const kmsAdd = KMSVERIFIER_ADDRESS;
const aclAdd = ACL_ADDRESS;

export const createInstance = async (hre: HardhatRuntimeEnvironment): Promise<FhevmInstance> => {
  const instance = await createFhevmInstance({
    kmsContractAddress: kmsAdd,
    aclContractAddress: aclAdd,
    networkUrl: hre.network.config.url,
    gatewayUrl: GATEWAY_URL,
  });
  return instance;
};
