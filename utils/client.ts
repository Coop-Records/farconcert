import {
  createPublicClient,
  createWalletClient,
  http,
  publicActions,
} from "viem";
import { base, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { isNil } from "lodash";

const BASEAlchemyKey = process.env.NEXT_PUBLIC_BASE_ALCHEMY_KEY as string;
const serverBaseAlchemyKey = process.env.BASE_ALCHEMY_KEY as string;
const deployerPrivateKey = process.env.DEPLOYER_ACCOUNT_PRIVATE_KEY;
const hostPoint = process.env.HOST_POINT as string;

export const DeployerAccount = !isNil(deployerPrivateKey)
  ? privateKeyToAccount(`0x${deployerPrivateKey}` as `0x${string}`)
  : undefined;

export const baseClient = createPublicClient({
  chain: hostPoint === "localhost" ? baseSepolia : base,
  transport: http(
    `https://base-${
      hostPoint === "localhost" ? "sepolia" : "mainnet"
    }.g.alchemy.com/v2/${BASEAlchemyKey}`
  ),
});

export const baseServerClient = createPublicClient({
  chain: hostPoint === "localhost" ? baseSepolia : base,
  transport: http(
    `https://base-${
      hostPoint === "localhost" ? "sepolia" : "mainnet"
    }.g.alchemy.com/v2/${serverBaseAlchemyKey}`
  ),
});

export const baseWriteServerClient = createWalletClient({
  chain: hostPoint === "localhost" ? baseSepolia : base,
  transport: http(
    `https://base-${
      hostPoint === "localhost" ? "sepolia" : "mainnet"
    }.g.alchemy.com/v2/${serverBaseAlchemyKey}`
  ),
  account: DeployerAccount,
}).extend(publicActions);
