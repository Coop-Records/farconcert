// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { isNil } from "lodash";
import { baseServerClient } from "@/utils/client";

type Data = {
  uuid?: string;
  status?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { ticket } = req.query;
  const { custody, message, signature } = req.body;
  const supabaseUrl = process.env.SUPABASE_URL as string;
  const supabaseKey = process.env.SUPABASE_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseKey);


  if (isNil(ticket) || isNil(custody) || isNil(message) || isNil(signature)) {
    return res
      .status(401)
      .json({ error: "No ticket, message, signature, custody provided" });
  }

  const valid = await baseServerClient.verifyMessage({
    address: custody,
    message,
    signature,
  });

  if (!valid) {
    return res.status(401).json({ error: "Invalid message" });
  }

  const newUUID = uuidv4();

  const { data, error } = await supabase
    .from("tickets")
    .upsert([{ id: newUUID, nft_id: ticket }]);


  res.status(200).json({ uuid: newUUID, status: "Redeemed" });
}
