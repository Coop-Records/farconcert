import { useEffect, useState } from "react";
import { Session, createClient } from "@supabase/supabase-js";
import { GetServerSideProps } from "next";
import { isNil } from "lodash";
import { useRouter } from "next/router";

interface RedeemProps {
  uuid: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<Session | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter(); // Use the useRouter hook to access the route parameters
  const { uuid } = router.query; // Destructure the uuid from the query

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Signing in...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (!isNil(error)) {
      setMessage(`Error signing in: ${error}`);
    } else {
      setMessage("");
    }
  };

  const handleSignout = async () => {
    setMessage("Signing out...");
    try {
      await supabase.auth.signOut();
      setMessage("");
    } catch (error) {
      console.error("Error signing out:", error);
      setMessage("Something went wrong trying to sign out");
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const session = await supabase.auth.getSession();
      const access_token = session.data.session?.access_token;

      if (session) {
        setUser(session.data.session);
        if (uuid && access_token) {
          // Make sure uuid is not undefined
          try {
            // Ensure UUID is a string if using TypeScript, you might need to do a type assertion or check
            await fetchApiWithUuid(uuid.toString(), access_token);
          } catch (error) {
            console.error("Error fetching API:", error);
          }
        }
      }
    };

    checkSession();
  }, [uuid]); // Add uuid as a dependency to re-run this effect if uuid changes

  useEffect(() => {
    handleSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchApiWithUuid = async (uuid: string, access_token: string) => {
    const response = await fetch(`/api/redeem/${uuid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass the token in the Authorization header
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        // Your request body here, if needed
      }),
    });

    const data = await response.json();
    console.log(data);
  };

  const handleSession = async () => {
    const session = await supabase.auth.getSession();
    setUser(session.data.session);
  };

  return (
    <>
      {isNil(user) ? (
        <form onSubmit={handleSubmit}>
          <label>
            Email:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Password:
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit">Sign In</button>
        </form>
      ) : (
        <button onClick={() => handleSignout()}>Sign Out</button>
      )}
      <div>{message}</div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<RedeemProps> = async ({
  params,
}) => {
  if (!params || typeof params.uuid !== "string") {
    return {
      notFound: true,
    };
  }
  const session = await supabase.auth.getSession();

  if (!isNil(session.data.session)) {
    const accessToken = session.data.session?.access_token;
    const response = await (
      await fetch("http://localhost:3000/api/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          /* your request body if needed */
        }),
      })
    ).json();
  }

  const { uuid } = params;

  // TODO: Implemenet call to back end for redeeming

  return {
    props: {
      uuid,
    },
  };
};
