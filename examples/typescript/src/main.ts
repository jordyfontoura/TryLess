import { err, ok, resultfy } from 'tryless'
import { z } from 'zod'
import { writeFileSync } from 'fs';

const apiURL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/btc.json';
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });


const bitcoinSchema = z.object({
  btc: z.object({
    usd: z.number()
  })
}).transform((data) => data.btc.usd);

const safeFetch = resultfy(fetch);
const safeWriteFile = resultfy(writeFileSync);

async function getBitcoinPrice() {
  const responseResult = await safeFetch(apiURL);

  if (!responseResult.success) {
    return err('bitcoin:fetch-error', responseResult.reason);
  }

  const response = responseResult.data

  if (!response.ok) {
    return err('bitcoin:http-error', `Request error with status: ${response.status}`);
  }

  if (response.status === 204) {
    return err('bitcoin:no-content');
  }

  const contentType = response.headers.get("content-type");

  if (!contentType) {
    return err('bitcoin:no-content-type');
  }

  if (!contentType.includes("application/json")) {
    return err('bitcoin:invalid-content-type', `Invalid content type. Expecting application/json but got: ${contentType}`);
  }

  const jsonResult = await resultfy(response.json());

  if (!jsonResult.success) {
    return err('bitcoin:invalid-json', jsonResult.reason);
  }

  const json = jsonResult.data

  if (!json) {
    return err('bitcoin:empty-json');
  }

  const bitcoinParseResult = bitcoinSchema.safeParse(json);

  if (!bitcoinParseResult.success) {
    return err('bitcoin:invalid-json-structure', bitcoinParseResult.error);
  }

  const price = bitcoinParseResult.data;

  const writeFileResult = safeWriteFile('price.txt', price.toString());

  if (!writeFileResult.success) {
    return err('bitcoin:write-file-error', writeFileResult.reason);
  }

  return ok(price);
}

async function main() {
  const bitcoinResult = await getBitcoinPrice();
  if (!bitcoinResult.success) {
    console.error(bitcoinResult.error);
    return;
  }

  const price = bitcoinResult.data

  console.log(`Bitcoin price: ${currencyFormatter.format(price)}`);
}

main();
