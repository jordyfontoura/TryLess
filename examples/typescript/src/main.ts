import 'tryless/register';

import {err, ok} from 'tryless'

const apiURL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/btc.json';
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });


async function getBitcoinPrice() {
  const responseResult = await fetch(apiURL).asResult();

  if (!responseResult.success) {
    return err(`Failed to fetch data: ${responseResult}`)
  }

  const response = responseResult.data

  if (!response.ok) {
    return err(`Request erred with status: ${response.status}`);
  }

  if (response.status === 204) {
    return err('No content');
  }

  const contentType = response.headers.get("content-type");

  if (!contentType) {
    return err('No content type');
  }

  if (!contentType.includes("application/json")) {
    return err(`Invalid content type. Expecting application/json but got: ${contentType}`);
  }

  const jsonResult = await response.json().asResult();

  if (!jsonResult.success) {
    return err(`Failed to parse JSON: ${jsonResult}`);
  }

  const json = jsonResult.data

  if (!json) {
    return err('Empty JSON');
  }

  const price = json?.btc?.usd;

  if (typeof price !== 'number') {
    return err('Invalid JSON structure');
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
