import sha256 from "sha256-wasm";

let hash;

export async function init() {
  await sha256.ready();  
  hash = sha256();
}

export async function update(data: Uint8Array) {
  hash.update(data);
}

export async function digest(encoding: string) {
  return hash.digest(encoding);
}
