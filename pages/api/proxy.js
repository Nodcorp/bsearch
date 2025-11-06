import fetch from 'node-fetch';

export default async function handler(req, res) {
  let { q } = req.query;

  const baseHome = 'https://web.archive.org/web/2011020700000/http://blekko.com';

  let targetUrl = baseHome;
  if (q) {
    const [queryPart, slashtag] = q.split('/', 2);
    const finalQuery = slashtag ? `${queryPart}+site:${slashtag}` : queryPart;
    targetUrl = `${baseHome}/ws/?q=${encodeURIComponent(finalQuery)}`;
  }

  try {
    const response = await fetch(targetUrl);
    let html = await response.text();

    html = html.replace(/(href|src)="\/(?!ws\/)(.*?)"/g, `$1="${baseHome}/$2"`);

    html = html.replace(/(href|action)="\/ws\/([^"]*)"/g, `$1="/api/proxy?q=$2"`);

    html = html.replace(/<div id="wm-ipp".*?<\/div>/gs, '');

    html = html.replace(/https:\/\/web\.archive\.org\/web\/\d+\/http:\/\/blekko\.com/g, '');

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching Blekko page');
  }
}
