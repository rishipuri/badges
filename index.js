require('dotenv').config();

const axios = require('axios');

module.exports = async(req, res) => {
  const url = `https://api.github.com/repos/rishipuri/til/contents`;
  const data = await request(url);
  const urls = dirUrls(data);
  const count = await dirFileCount(urls);
  const badgeUrl = `https://img.shields.io/badge/topics-${count}-green.svg?maxAge=0`;

  res.writeHead(302, {
    'Location': badgeUrl,
    'Cache-Control': 'no-cache'
  });
  res.end();
}

const request = async(url) => {
  const { status, data } = await axios({
    method: 'GET',
    url: url,
    responseType: 'json',
    auth: {
      username: process.env.gh_username,
      password: process.env.gh_token
    },
  });

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
    const data = await request(url);
    count += data.tree.length;
  }

  return count;
}
