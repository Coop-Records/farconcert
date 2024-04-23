import "@/styles/globals.css";
import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider } from "@farcaster/auth-kit";
import type { AppProps } from "next/app";

const config = {
  rpcUrl: "https://mainnet.optimism.io",
  domain: "example.com",
  siweUri: "https://example.com/login",
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthKitProvider config={config}>
      <Component {...pageProps} />
    </AuthKitProvider>
  );
}
