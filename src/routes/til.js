// Packages
const axios = require('axios');

const {GH_USERNAME, GH_TOKEN} = process.env;
let auth = false;

if (GH_USERNAME && GH_TOKEN) {
  auth = true;
}

// Move this to helper
const request = async url => {
  const req = {
    method: 'GET',
    url,
    responseType: 'json'
  };

  if (auth) {
    req.auth = {
      username: GH_USERNAME,
      password: GH_TOKEN
    };
  }

  const {data} = await axios(req);

  return data;
};

const dirUrls = data => {
  const urls = data.filter(content => {
    if (content.type === 'dir') {
      return true;
    }

    return false;
  }).map(dir => {
    return dir.git_url;
  });

  return urls;
};

const dirFileCount = async urls => {
  const data = [];
  let count = 0;

  for (const url of urls) {
    data.push(request(url));
  }

  await Promise.all(data).then(values => {
    values.forEach(dir => {
      count += dir.tree.length;
    });
  });

  return count;
};

const topics = async (req, res) => {
  const url = `https://api.github.com/repos/rishipuri/til/contents`;
  const data = await request(url);
  const urls = dirUrls(data);
  const count = await dirFileCount(urls);
  const badgeUrl = `https://img.shields.io/badge/topics-${count}-green.svg?maxAge=0`;
  const svg = await request(badgeUrl, false);

  res.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Expires: 0,
    Pragma: 'no-cache'
  });
  res.end(svg);
}

module.exports.topics = topics;
