import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { SignInButton, useProfile } from "@farcaster/auth-kit";
import FarConcert from "@/abi/FarConcert.json";
import { baseClient } from "@/utils/client";
import { useEffect, useState } from "react";
import { isEmpty, isNil } from "lodash";

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
  const [tickets, setTickets] = useState<number[]>([]);

  useEffect(() => {
    if (isAuthenticated && custody) {
      // TODO: CHange this to "verifications"
      getTickets(["0x9266F125fb2EcB730D9953b46dE9C32e2Fa83E4a"]);
    }
  }, [custody, isAuthenticated]);

  const getTickets = async (addresses: `0x${string}`[] | undefined) => {
    const ids = [];
    console.log(addresses, farconContractAddress);
    if (isNil(addresses)) return;
    for (const address of addresses) {
      console.log(address, farconContractAddress, baseClient);
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
    console.log(ids);
    setTickets(ids);
  };

  const showModal = (ticket: number) => {};

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
          Click the "Sign in with Farcaster" button above, then scan the QR code
          to sign in.
        </p>
      )}
    </>
  );
}
