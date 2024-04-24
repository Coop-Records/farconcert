export const endpointLocal =
  "https://f563-2601-645-8a00-9db0-89a0-6c96-bb40-d13f.ngrok-free.app";
export const endpointProd = "https://farconcert.vercel.app/";
const clientHostPoint = process.env.NEXT_PUBLIC_HOST_POINT as string;
const hostPoint = process.env.HOST_POINT as string;

export const farconContractAddress =
  clientHostPoint === "localhost"
    ? "0x9b134B30056D319ddB38C5451571aA6E27B2Eb03"
    : "0xB791556273B26389BcB4865DB028898f125E4319";

export const serverFarconContractAddress =
  hostPoint === "localhost"
    ? "0x9b134B30056D319ddB38C5451571aA6E27B2Eb03"
    : "0xB791556273B26389BcB4865DB028898f125E4319";
