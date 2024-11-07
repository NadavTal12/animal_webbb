import OpenAI from 'openai';
import got from 'got';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import { createInterface } from 'readline';

const consumer_key = 'consumer_key_secret';  
const consumer_secret = 'consumer_secret_secret';  
const openai_api_key = 'openai_api_key_secret'
const openai = new OpenAI({
  apiKey: openai_api_key,
});

const oauth = OAuth({
  consumer: { key: consumer_key, secret: consumer_secret },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64'),
});

// Sleep for a specified duration
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a tweet with GPT
async function generateTweetContent() {
  const prompt = "Write a fun and engaging tweet about a pet product sale for a pet shop. please look in the history of our chat and make it different each tweet.";
 
// Limit retry attempts for rate-limited requests 
  let retries = 5;
  while (retries > 0) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      if (error.response && error.response.status === 429) { 
        const waitTime = 1000 * (6 - retries); 
        console.log(`Rate limit hit, waiting for ${waitTime / 1000} seconds...`);
        await sleep(waitTime);
        retries--;
      } else {
        throw error; 
      }
    }
  }
  throw new Error("Exceeded retry attempts for generating tweet content.");
}

// Post the tweet
async function postTweet(content) {
  const endpointURL = `https://api.twitter.com/2/tweets`;
  const data = { text: content };

  const authHeader = oauth.toHeader(
    oauth.authorize({ url: endpointURL, method: 'POST' }, { key: "twiter_key", secret: "twiter_secret" })
  );

  try {
    const response = await got.post(endpointURL, {
      json: data,
      responseType: 'json',
      headers: {
        Authorization: authHeader["Authorization"],
        'content-type': "application/json",
      },
    });
    console.log("Tweet posted successfully:", response.body);
  } catch (error) {
    console.error("Error posting tweet:", error.response.body);
  }
}

// Create and post daily tweet
async function postDailyTweet() {
  try {
    const tweetContent = await generateTweetContent();
    await postTweet(tweetContent);
    await sleep(2000); // Wait for 2 seconds
  } catch (error) {
    console.error("Error generating or posting tweet:", error);
  }
}

postDailyTweet();
