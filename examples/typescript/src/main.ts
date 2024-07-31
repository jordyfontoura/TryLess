import {fail, IFuture, ok} from 'tryless';


const apiURL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/btc.json';
const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});


async function getBitcoinPrice(): IFuture<number, string> {
  const [response, isOk] = await fetch(apiURL).asSafe().unwrap();

  if (!isOk) {
    return fail(`Failed to fetch data: ${response}`);
  }

  if (!response.ok) {
    return fail(`Request failed with status: ${response.status}`);
  }

  if (response.status === 204) {
    return fail('No content');
  }

  const contentType = response.headers.get("content-type");

  if (!contentType) {
    return fail('No content type');
  }

  if (!contentType.includes("application/json")) {
    return fail(`Invalid content type. Expecting application/json but got: ${contentType}`);
  }

  const [json, isParseOk] = await response.json().asSafe().unwrap();

  if (!isParseOk) {
    return fail(`Failed to parse JSON: ${json}`);
  }

  if (!json) {
    return fail('Empty JSON');
  }

  const price = json?.btc?.usd;

  if (typeof price !== 'number') {
    return fail('Invalid JSON structure');
  }

  return ok(price);
}

async function main() {
  const [price, isError] = await getBitcoinPrice().unwrap(false);

  if (isError) {
    console.error(price);
    return;
  }

  console.log(`Bitcoin price: ${currencyFormatter.format(price)}`);
}

main();
