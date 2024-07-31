import {fail, ok} from 'tryless'

async function getHttpImage(code) {
  if (typeof code !== 'number') {
    return fail('Invalid code');
  }

  if (code < 100 || code > 599) {
    return fail('Invalid code');
  }

  const url = `https://http.cat/${code}`;
  const [response, isError] = await fetch(url).asSafe().unwrap(false);
  
  if (isError) {
    return fail(response);
  }

  if (!response.ok) {
    return fail(`HTTP CODE ${code} error! status: ${response.status}`);
  }
  
  return ok(url);
}

async function main() {
  const code = Math.floor(Math.random() * 600);
  const [value, isOk] = await getHttpImage(code).unwrap();
 
  if (!isOk) {
    console.log("Failed to fetch image");
    console.error(value);
    return;
  }

  console.log(value);

  return process.exit(0);
}

main();