import {err, IFuture, ok} from 'tryless';


const apiURL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/btc.json';
const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});


async function getBitcoinPrice(): IFuture<number, string> {
  const [response, isOk] = await fetch(apiURL).asResult().unwrap();

  if (!isOk) {
    return err(`Failed to fetch data: ${response}`);
  }

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

  const [json, isParseOk] = await response.json().asResult().unwrap();

  if (!isParseOk) {
    return err(`Failed to parse JSON: ${json}`);
  }

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
  const [price, isOk] = await getBitcoinPrice().unwrap();

  if (!isOk) {
    console.error(price);
    return;
  }

  console.log(`Bitcoin price: ${currencyFormatter.format(price)}`);
}

main();
