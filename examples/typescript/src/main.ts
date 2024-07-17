import {fail, Future, success} from 'tryless';


const apiURL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/btc.json';
const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});


async function getBitcoinPrice(): Future<number, string> {
  const [response, error, isError] = await fetch(apiURL).asResult();

  if (isError) {
    return fail(`Failed to fetch data: ${error}`);
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

  const [json, parseError, isParseError] = await response.json().asResult();

  if (isParseError) {
    return fail(`Failed to parse JSON: ${parseError}`);
  }

  if (!json) {
    return fail('Empty JSON');
  }

  const price = json?.btc?.usd;

  if (!price) {
    return fail('Invalid JSON structure');
  }

  return success(price);
}

async function main() {
  const [price, error, isError] = await getBitcoinPrice();

  if (isError) {
    console.error(error);
    return;
  }

  console.log(`Bitcoin price: ${currencyFormatter.format(price)}`);
}

main();
