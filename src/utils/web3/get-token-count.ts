import { u64 } from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import { OrcaPoolParams, OrcaPoolToken } from "../../model/orca/orca-types";
import { deserializeAccount } from "./deserialize-account";

export type PoolTokenCount = {
  inputTokenCount: u64;
  outputTokenCount: u64;
};

export async function getTokenCount(
  connection: Connection,
  poolParams: OrcaPoolParams,
  inputPoolToken: OrcaPoolToken,
  outputPoolToken: OrcaPoolToken
): Promise<PoolTokenCount> {
  if (poolParams.tokens[inputPoolToken.id] == undefined) {
    throw new Error("Input token not part of pool");
  }

  if (poolParams.tokens[outputPoolToken.id] == undefined) {
    throw new Error("Output token not part of pool");
  }

  // TODO: Batch request?
  const accountInfos = await Promise.all([
    connection.getAccountInfo(inputPoolToken.addr),
    connection.getAccountInfo(outputPoolToken.addr),
  ]);

  const tokens = accountInfos.map((info) =>
    info != undefined ? deserializeAccount(info.data) : undefined
  );
  const inputTokenAccount = tokens[0],
    outputTokenAccount = tokens[1];

  if (inputTokenAccount === undefined || outputTokenAccount === undefined) {
    throw new Error("Unable to fetch accounts for specified tokens.");
  }

  return {
    inputTokenCount: new u64(inputTokenAccount.amount),
    outputTokenCount: new u64(outputTokenAccount.amount),
  };
}
