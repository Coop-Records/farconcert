import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import {
  SignInButton,
  useProfile,
  useSignInMessage,
} from "@farcaster/auth-kit";
import FarConcert from "@/abi/FarConcert.json";
import { baseClient } from "@/utils/client";
import { useEffect, useState } from "react";
import { isEmpty, isNil } from "lodash";
import { useModal } from "@/hooks/useModal";
import QRCode from "qrcode.react";
import { Hex } from "viem";

const inter = Inter({ subsets: ["latin"] });
const farconContractAddress = "0xB791556273B26389BcB4865DB028898f125E4319";

export default function Home() {
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
          <SignInButton />
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
        <>
          <QRCode
            value={`${window.location.protocol}//${window.location.host}/admin/${data.uuid}`}
          />
        </>,
        `FarConcert Ticket #${ticket}`
      );
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <div className={styles.grid}>
          {tickets.map((ticket) => (
            <div
              key={ticket}
              className={styles.ticketItem}
              onClick={() => showModal(ticket)}
            >
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
