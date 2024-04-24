// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import FarConcert from "@/abi/FarConcert.json";
import { DeployerAccount, baseWriteServerClient } from "@/utils/client";
import { serverFarconContractAddress } from "@/utils/constants";

type Data = {
  ticket_id?: number;
  status?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { uuid } = req.query;
  const supabaseUrl = process.env.SUPABASE_URL as string;
  const supabaseKey = process.env.SUPABASE_KEY as string;
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

  const { data: ticketData, error: ticketError } = await supabase
    .from("tickets")
    .select("id, nft_id")
    .eq("id", uuid)
    .single();

  const { request, result } = await baseWriteServerClient.simulateContract({
    address: serverFarconContractAddress,
    abi: FarConcert,
    functionName: "redeem",
    args: [ticketData?.nft_id],
    account: DeployerAccount,
  });

  const hash = await baseWriteServerClient.writeContract(request);

  const { data: ticketWrite, error: ticketErrorWrite } = await supabase
    .from("tickets")
    .upsert([{ nft_id: ticketData?.nft_id, redeemed: true }]);

  res.status(200).json({ status: "Redeemed", ticket_id: ticketData?.nft_id });
}
