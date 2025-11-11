import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";

const RPC_URL = "https://rpc.testnet.carv.io/rpc";
const connection = new Connection(RPC_URL, "confirmed");

// ⚠️ کلید تستی (در محیط واقعی نذار کلید اصلی!)
const secretKey = Uint8Array.from([
  12,34,56,78,90, /* اینو بعداً با کلید تستی خودت عوض می‌کنی */
]);
const fromWallet = Keypair.fromSecretKey(secretKey);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { to, amount } = req.body;
    if (!to || !amount)
      return res.status(400).json({ error: "Missing to or amount" });

    const toPubkey = new PublicKey(to);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, tx, [fromWallet]);
    res.status(200).json({ success: true, txHash: signature });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
}
