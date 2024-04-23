// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, createClient } from "@supabase/supabase-js";
import { createAppClient, viemConnector } from "@farcaster/auth-client";

type Data = {
  status?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { uuid } = req.query;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const token = req.headers.authorization?.split(" ")[1]; // Extract the token from the "Authorization" header

  if (!uuid) {
    return res.status(401).json({ error: "No uuid provided" });
  }
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verify the token and get the user's session or profile
  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }


  // TODO: search up uuid in supabase table
  // TODO: Make call with admin private key to redeem

  res.status(200).json({ status: "Redeemed" });
}
