async function getTtf(family, weight = '400') {
  const url = `https://fonts.googleapis.com/css?family=${family.replace(/ /g, '+')}:${weight}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.1.1; en-gb; Build/KLP) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30'
    }
  });
  const text = await res.text();
  const match = text.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/);
  if (match) {
    return match[1];
  }
  return null;
}

async function run() {
  const fonts = [
    { family: 'Montserrat', weight: '400', id: 'Montserrat' },
    { family: 'Montserrat', weight: '700', id: 'Montserrat-Bold' },
    { family: 'Roboto', weight: '400', id: 'Roboto' },
    { family: 'Roboto', weight: '700', id: 'Roboto-Bold' },
    { family: 'Playfair Display', weight: '400', id: 'PlayfairDisplay' },
    { family: 'Dancing Script', weight: '400', id: 'DancingScript' }
  ];
  const out = {};
  for (const f of fonts) {
    out[f.id] = await getTtf(f.family, f.weight);
  }
  console.log(JSON.stringify(out, null, 2));
}

run();
