import fetch from 'node-fetch';

export default async function handler(req, res) {
  let { q } = req.query;

  const originalDomain = 'http://blekko.com';
  const wildcardUrl = `https://web.archive.org/web/20110*/${originalDomain}`;  // “20110*” means any date in 2011

  try {
    const headResp = await fetch(wildcardUrl, { method: 'HEAD', redirect: 'manual' });
    const location = headResp.headers.get('location');  // e.g. “/web/20110207174200/http://blekko.com”
    if (!location) {
      throw new Error('No archive snapshot found for 2011');
    }
    const match = location.match(/\/web\/(\d+)\/http:\/\/blekko\.com/);
    if (!match) {
      throw new Error('Couldn’t parse timestamp from Wayback redirect');
    }
    const timestamp = match[1];

    const baseHome = `https://web.archive.org/web/${timestamp}/http://blekko.com`;

    let targetUrl = baseHome;
    if (q) {
      const [queryPart, slashtag] = q.split('/', 2);
      const finalQuery = slashtag ? `${queryPart}+site:${slashtag}` : queryPart;
      targetUrl = `${baseHome}/ws/?q=${encodeURIComponent(finalQuery)}`;
    }

    const resp = await fetch(targetUrl);
    let html = await resp.text();

    html = html.replace(/(href|src)="\/(?!ws\/)(.*?)"/g, `$1="${baseHome}/$2"`);
    html = html.replace(/(href|action)="\/ws\/([^"]*)"/g, `$1="/api/proxy?q=$2"`);
    html = html.replace(/<div id="wm-ipp".*?<\/div>/gs, '');

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching Blekko archive');
  }
}
