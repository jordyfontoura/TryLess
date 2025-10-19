import {ok, err, errReject} from 'tryless'

const apiURL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/btc.json';
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });


async function getBitcoinPrice() {
  const responseResult = await fetch(apiURL).then(ok, errReject('bitcoin:fetch-error'));

  if (!responseResult.success) {
    return responseResult;
  }

  const response = responseResult.data

  if (!response.ok) {
    return err('bitcoin:http-error', `Request error with status: ${response.status}`);
  }

  if (response.status === 204) {
    return err('bitcoin:no-content');
  }

  const contentType = response.headers.get("content-type");

  if (!contentType) return err('bitcoin:no-content-type');

  if (!contentType.includes("application/json")) {
    return err('bitcoin:invalid-content-type', `Invalid content type. Expecting application/json but got: ${contentType}`);
  }

  const jsonResult = await response.json().then(ok, errReject('bitcoin:invalid-json'));

  if (!jsonResult.success) {
    return jsonResult;
  }

  const json = jsonResult.data

  if (!json) {
    return err('bitcoin:empty-json');
  }

  const price = json?.btc?.usd;

  if (typeof price !== 'number' || !isFinite(price)) {
    return err('bitcoin:invalid-json-structure', `Invalid JSON structure. Expecting finite number but got: ${typeof price} ${price}`);
  }

  return ok(price);
}

async function main() {
  const bitcoinResult = await getBitcoinPrice();

  if (!bitcoinResult.success) {
    console.error(bitcoinResult.error);
    return bitcoinResult;
  }

  const price = bitcoinResult.data;

  console.log(`Bitcoin price: ${currencyFormatter.format(price)}`);

  return ok(price);
}

main();
