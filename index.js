require('dotenv').config();

const axios = require('axios');

module.exports = async(req, res) => {
  const url = `https://api.github.com/repos/rishipuri/til/contents`;
  const data = await request(url, true);
  const urls = dirUrls(data);
  const count = await dirFileCount(urls);
  const badgeUrl = `https://img.shields.io/badge/topics-${count}-green.svg?maxAge=0`;
  const svg = await request(badgeUrl, false);

  res.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Expires': 0,
    'Pragma': 'no-cache'
  });
  res.end(svg);
}

const request = async(url, gh_auth) => {
  let req = {
    method: 'GET',
    url: url,
    responseType: 'json'
  };

  if (gh_auth) {
    req['auth'] = {
      username: process.env.gh_username,
      password: process.env.gh_token
    };
  }

  const { status, data } = await axios(req);

  return data;
}

const dirUrls = (data) => {
  let urls = data.filter((content) => {
    if (content.type === 'dir') {
      return true;
    }

    return false;
  }).map((dir) => {
    return dir.git_url;
  });

  return urls;
}

const dirFileCount = async(urls) => {
  let count = 0;

  for (let url of urls) {
    const data = await request(url, true);
    count += data.tree.length;
  }

  return count;
}
