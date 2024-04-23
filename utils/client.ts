import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const BASEAlchemyKey = process.env.NEXT_PUBLIC_BASE_ALCHEMY_KEY as string;
const deployerPrivateKey = process.env.DEPLOYER_ACCOUNT_PRIVATE_KEY;

// export const DeployerAccount = privateKeyToAccount(`0x${deployerPrivateKey}`);

export const baseClient = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${BASEAlchemyKey}`),
});
