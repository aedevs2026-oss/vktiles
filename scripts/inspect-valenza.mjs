import https from 'https';

const url = 'https://www.valenzaceramic.com/product_category/wall-tiles.html';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const idx = data.toLowerCase().indexOf('vz-5057');
    console.log('idx', idx);
    console.log(data.slice(Math.max(0, idx - 1600), idx + 2600));
  });
}).on('error', (err) => {
  console.error(err);
  process.exit(1);
});
