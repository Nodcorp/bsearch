import fetch from 'node-fetch';

export default async function handler(req, res) {
  let { q } = req.query;

  // Base Wayback Machine snapshot of Blekko
  const baseHome = 'https://web.archive.org/web/20151201000000/http://blekko.com';
  let targetUrl = baseHome;

  if (q) {
    // Slashtag handling: python/tech -> python+site:tech
    const [queryPart, slashtag] = q.split('/');
    const finalQuery = slashtag ? `${queryPart}+site:${slashtag}` : queryPart;
    targetUrl = `${baseHome}/ws/?q=${encodeURIComponent(finalQuery)}`;
  }

  try {
    const response = await fetch(targetUrl);
    let html = await response.text();

    // Rewrite relative asset URLs
    html = html.replace(/(href|src)="\/(.*?)"/g, `$1="${baseHome}/$2"`);

    // Rewrite forms to submit through our proxy
    html = html.replace(/<form([^>]+)action="\/ws\/?"([^>]*)>/g, `<form$1action="/api/proxy"$2>`);

    // Remove Wayback banner
    html = html.replace(/<div id="wm-ipp".*?<\/div>/gs, '');

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching Blekko page');
  }
}
