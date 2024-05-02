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
const testAlchemyKey = process.env.NEXT_PUBLIC_TEST_BASE_ALCHEMY_KEY as string;
const testServerBaseAlchemyKey = process.env.BASE_TEST_ALCHEMY_KEY as string;
const deployerPrivateKey = process.env.DEPLOYER_ACCOUNT_PRIVATE_KEY;
const hostPoint = process.env.NEXT_PUBLIC_HOST_POINT as string;
const hostPointServer = process.env.HOST_POINT as string;

export const DeployerAccount = !isNil(deployerPrivateKey)
  ? privateKeyToAccount(`0x${deployerPrivateKey}` as `0x${string}`)
  : undefined;

export const baseClient = createPublicClient({
  chain: hostPoint === "localhost" ? baseSepolia : base,
  transport: http(
    `https://base-${
      hostPoint === "localhost" ? "sepolia" : "mainnet"
    }.g.alchemy.com/v2/${
      hostPoint === "localhost" ? testAlchemyKey : BASEAlchemyKey
    }`
  ),
});

export const baseServerClient = createPublicClient({
  chain: hostPointServer === "localhost" ? baseSepolia : base,
  transport: http(
    `https://base-${
      hostPointServer === "localhost" ? "sepolia" : "mainnet"
    }.g.alchemy.com/v2/${
      hostPointServer === "localhost"
        ? testServerBaseAlchemyKey
        : serverBaseAlchemyKey
    }`
  ),
});

export const baseWriteServerClient = createWalletClient({
  chain: hostPointServer === "localhost" ? baseSepolia : base,
  transport: http(
    `https://base-${
      hostPointServer === "localhost" ? "sepolia" : "mainnet"
    }.g.alchemy.com/v2/${
      hostPointServer === "localhost"
        ? testServerBaseAlchemyKey
        : serverBaseAlchemyKey
    }`
  ),
  account: DeployerAccount, 
}).extend(publicActions);
