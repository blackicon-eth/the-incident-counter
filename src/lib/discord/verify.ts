import nacl from "tweetnacl";

export interface VerifySignatureInput {
  publicKey: string;
  signature: string;
  timestamp: string;
  body: string;
}

/**
 * Verifies a Discord interaction request using Ed25519.
 * See: https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization
 */
export function verifyDiscordSignature(input: VerifySignatureInput): boolean {
  try {
    return nacl.sign.detached.verify(
      Buffer.from(input.timestamp + input.body),
      Buffer.from(input.signature, "hex"),
      Buffer.from(input.publicKey, "hex"),
    );
  } catch {
    return false;
  }
}
