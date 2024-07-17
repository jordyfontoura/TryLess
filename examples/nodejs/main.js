import {error, success} from 'tryless'

async function getHttpImage(code) {
  if (typeof code !== 'number') {
    return error('Invalid code');
  }

  if (code < 100 || code > 599) {
    return error('Invalid code');
  }

  const url = `https://http.cat/${code}`;
  const [response, reason, isError] = await fetch(url).asResult();
  
  if (isError) {
    return error(reason);
  }

  if (!response.ok) {
    return error(`HTTP CODE ${code} error! status: ${response.status}`);
  }
  
  return success(url);
}

async function main() {
  const code = Math.floor(Math.random() * 600);
  const [value, reason, isError] = await getHttpImage(code);
 
  if (isError) {
    console.log("Failed to fetch image");
    console.error(reason);
    return;
  }

  console.log(value);

  return process.exit(0);
}

main();