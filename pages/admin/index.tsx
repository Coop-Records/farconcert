import {
  SignInButton,
  useProfile,
  useSignInMessage,
} from "@farcaster/auth-kit";
import { isNil } from "lodash";
import { useEffect, useState } from "react";
import { Session, createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<Session | null>(null);
  const [message, setMessage] = useState("");

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
      setMessage(" ");
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
