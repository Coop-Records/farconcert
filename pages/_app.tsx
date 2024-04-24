import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider } from "@farcaster/auth-kit";
import type { AppProps } from "next/app";
import { ModalProvider } from "@/hooks/useModal";
import Modal from "@/components/Modal/modals/Modal";

const config = {
  rpcUrl: "https://mainnet.optimism.io",
  domain: "example.com",
  siweUri: "https://example.com/login",
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <AuthKitProvider config={config}>
        <ModalProvider>
          <Component {...pageProps} />
          <Modal />
        </ModalProvider>
      </AuthKitProvider>
    </SessionProvider>
  );
}
