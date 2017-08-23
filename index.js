require('dotenv').config();

const axios = require('axios');

const request = async (url, githubAuth) => {
  const req = {
    method: 'GET',
    url,
    responseType: 'json'
  };

  if (githubAuth) {
    req.auth = {
      username: process.env.gh_username,
      password: process.env.gh_token
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
    data.push(request(url, true));
  }

  await Promise.all(data).then(values => {
    values.forEach(dir => {
      count += dir.tree.length;
    });
  });

  return count;
};

module.exports = async (req, res) => {
  const url = `https://api.github.com/repos/rishipuri/til/contents`;
  const data = await request(url, true);
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
};
