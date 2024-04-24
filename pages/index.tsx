import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import {
  SignInButton,
  StatusAPIResponse,
  useProfile,
  useSignInMessage,
} from "@farcaster/auth-kit";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import FarConcert from "@/abi/FarConcert.json";
import { baseClient } from "@/utils/client";
import { useCallback, useEffect, useState } from "react";
import { isNil } from "lodash";
import { useModal } from "@/hooks/useModal";
import QRCode from "qrcode.react";
import { farconContractAddress } from "@/utils/constants";
import TicketModal from "@/components/Modal/modals/TicketModal";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [error, setError] = useState(false);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSuccess = useCallback((res: StatusAPIResponse) => {
    console.log(res);
    signIn("credentials", {
      message: res.message,
      signature: res.signature,
      name: res.username,
      pfp: res.pfpUrl,
      redirect: false,
    });
  }, []);

  return (
    <>
      <Head>
        <title>FarConcert</title>
        <meta name="description" content="FarConcert" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/farcon.scv" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div>
          <SignInButton
            nonce={getNonce}
            onSuccess={handleSuccess}
            onError={() => setError(true)}
            onSignOut={() => signOut()}
          />
        </div>
        <Profile />
      </main>
    </>
  );
}

function Profile() {
  const profile = useProfile();
  const {
    isAuthenticated,
    profile: { fid, displayName, custody, verifications },
  } = profile;

  const { message, signature } = useSignInMessage();
  const [tickets, setTickets] = useState<number[]>([]);

  useEffect(() => {
    if (isAuthenticated && custody) {
      // TODO: CHange this to "verifications"
      getTickets(["0xb618a21F95AA6c9C4281dB442857F50D2c5D44f7"]);
    }
  }, [custody, isAuthenticated]);

  const { openModal } = useModal();

  const [loadingTicket, setLoadingTicket] = useState<number | undefined>(
    undefined
  ); // null when no ticket is loading, or the id of the loading ticket

  const getTickets = async (addresses: `0x${string}`[] | undefined) => {
    const ids = [];
    if (isNil(addresses)) return;
    for (const address of addresses) {
      const owned = (await baseClient.readContract({
        address: farconContractAddress,
        abi: FarConcert,
        functionName: "balanceOf",
        args: [address],
      })) as number;
      if (owned !== 0) {
        for (var i = 0; i < owned; i++) {
          const id = (await baseClient.readContract({
            address: farconContractAddress,
            abi: FarConcert,
            functionName: "tokenOfOwnerByIndex",
            args: [address, i],
          })) as number;
          ids.push(id);
        }
      }
    }
    setTickets(ids);
  };

  const showModal = async (ticket: number) => {
    setLoadingTicket(ticket);
    if (!isNil(custody) && !isNil(message) && !isNil(signature)) {
      const res = await fetch(`/api/present/${ticket}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ custody, message, signature }),
      });
      const data = await res.json();
      // TODO: Change to https

      console.log(
        `${window.location.protocol}//${window.location.host}/admin/${data.uuid}`
      );
      openModal(
        <TicketModal
          url={`${window.location.protocol}//${window.location.host}/admin/${data.uuid}`}
        />,
        `FarConcert Ticket #${ticket}`
      );
    }
    setLoadingTicket(undefined);
  };

  return (
    <>
      {isAuthenticated ? (
        <div className={styles.grid}>
          {tickets.map((ticket) => (
            <div
              key={ticket}
              className={styles.ticketItem}
              onClick={() => !loadingTicket && showModal(ticket)}
              style={{ position: "relative" }}
            >
              {loadingTicket === ticket && (
                <div className={styles.loadingOverlay}>
                  <div className={styles.spinner}></div>
                </div>
              )}
              <img
                src="https://arweave.net/KAUNvzcyvGlSdLWMQ8z2OyI2RdcInYpKtA853S73IzA"
                alt={`FarConcert #${ticket}`}
                className={styles.ticketImage}
              />
              <div>Click ticket for QR Code</div>
            </div>
          ))}
        </div>
      ) : (
        <p>
          Click the &quot;Sign in with Farcaster&quot; button above, then scan
          the QR code to sign in.
        </p>
      )}
    </>
  );
}
