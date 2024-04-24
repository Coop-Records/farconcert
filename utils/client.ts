import {
  createPublicClient,
  createWalletClient,
  http,
  publicActions,
} from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { isNil } from "lodash";

const BASEAlchemyKey = process.env.NEXT_PUBLIC_BASE_ALCHEMY_KEY as string;
const serverBaseAlchemyKey = process.env.BASE_ALCHEMY_KEY as string;
const deployerPrivateKey = process.env.DEPLOYER_ACCOUNT_PRIVATE_KEY;

export const DeployerAccount = !isNil(deployerPrivateKey)
  ? privateKeyToAccount(`0x${deployerPrivateKey}` as `0x${string}`)
  : undefined;

export const baseClient = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${BASEAlchemyKey}`),
});

export const baseServerClient = createPublicClient({
  chain: base,
  transport: http(
    `https://base-mainnet.g.alchemy.com/v2/${serverBaseAlchemyKey}`
  ),
});

export const baseWriteServerClient = createWalletClient({
  chain: base,
  transport: http(
    `https://base-mainnet.g.alchemy.com/v2/${serverBaseAlchemyKey}`
  ),
  account: DeployerAccount,
}).extend(publicActions);
