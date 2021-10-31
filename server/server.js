import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';
import _ from 'lodash';

const app = express();

/**
 * 
 * @param {Array} arr 
 */
function randomChoice(...arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

function getPosts({subreddit, listing, period}={}) {
  subreddit = subreddit || randomChoice('memes','dankmemes', 'programmerhumor');
  listing = listing || randomChoice('new', 'rising', 'controversial');
  period = period || 'month';

  return fetch(`https://reddit.com/r/${subreddit}/${listing}.json?t=${period}`, {
    headers:{
      'User-Agent':'MemeBot'
    }
  });
}

function getPost(permalink) {
  return fetch(`https://reddit.com${permalink}.json`, {
    headers:{
      'User-Agent':'MemeBot'
    }
  });
}

function getPostScore(post) {
  const upvoteRatio = post.data.upvote_ratio;
  const awards = post.data.all_awardings;
  const score = post.data.score;

  const awardsPrice = awards.reduce((acc, curr) => acc + curr.coin_price, 0);

  return (score + awardsPrice) * (1 + upvoteRatio / 2) + 5;
}

app.use(cors({
  origin: '*'
}));

app.get('/api/posts/random', async (req, res) => {
  const data = await getPosts(req.query).then(res => res.json());

  const imagePost = _.sample(data.data.children.filter(c => c.data.url.endsWith('.jpg') && !c.data.stickied));

  const postTransform = p => ({
    permalink: p.data.permalink,
    imgUrl: p.data.url,
    title: p.data.title,
    createdAt: p.data.created_utc * 1000,
    subreddit: p.data.subreddit,
    buyPrice: Math.ceil(getPostScore(p) * 1.1),
    price: Math.round(getPostScore(p), 2)
  });

  res.status(200);
  res.json(postTransform(imagePost));
});

app.get('/api/posts', async (req, res) => {
  if (req.query['permalink']) {
    const post = (await getPost(req.query.permalink).then(res => res.json()))[0]['data']['children'][0];
    res.json({
      price: Math.round(getPostScore(post))
    });
  }

  res.status(404).end();
});

app.use(express.static('../client/dist'));

app.all('*', (req, res) => {
  res.status(404);
  res.end();
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, () => console.log(`Listening on Port ${port}...`));