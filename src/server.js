import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import request from "request";

import express from "express";
const server = express();

import cors from "cors";

import {
  getTransactionsByOptions,
  getTransactionsByWallet,
  getTransactionsByWalletAndApp,
  getTransactionWithContent,
  getAppNames,
  saveTransaction
} from "./data-db.js";

import { callDeployWebhook } from "./util.js";

// TODO block-explorer-api
// `/user/:address/app-name/:app-name/following`
// `/user/:address/app-name/:app-name/followers`

server.use(express.json());

// Pipe requests intended for Arweave gateway

const apiUrl = "https://arweave.net";

server.post("/tx", cors(), async function(req, res) {
  const tx = req.body;
  const postRes = await fetch(`${apiUrl}/tx`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(tx)
  });

  if (postRes.ok) {
    try {
      await saveTransaction(tx);
      await callDeployWebhook();
      res.sendStatus(201);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
});

server.use(["/tx", "/tx_anchor", "/price", "/wallet"], cors(), function(
  req,
  res
) {
  var url = apiUrl + req.originalUrl;
  req.pipe(request({ qs: req.query, uri: url, json: true })).pipe(res);
});

server.get("/app-names", async (req, res) => {
  const appNames = await getAppNames();
  res.json(appNames);
});

server.get("/transactions", async (req, res) => {
  const appName = req.query["app-name"];
  const walletId = req.query["wallet-id"];

  const page = req.query.page;

  const transactions = await getTransactionsByOptions({
    appName,
    walletId,
    page
  });
  res.json(transactions);
});

server.get("/transaction/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const transaction = await getTransactionWithContent(transactionId);
  res.send(transaction);
});

server.get("/user/:address/transactions", async (req, res) => {
  const address = req.params.address;

  const appName = req.query["app-name"];
  const page = req.query.page;

  const transactions = await getTransactionsByWallet(address, {
    appName,
    page
  });
  res.json(transactions);
});

server.get(
  "/user/:address/app-name/:appName/transactions",
  async (req, res) => {
    const { address, appName } = req.params;
    const transactions = await getTransactionsByWalletAndApp(address, appName);
    res.json(transactions);
  }
);

//  TODO blog-app-api view
// `/user/:twitter-handle`
// `/user/:twitter-handle/:post-slug`

// /blog-api/feed?page[size]=20&page[after]=:tx_id
// /blog-api/post/:post_id
// /blog-api/user/:wallet_address?page[size]=20&page[after]=:tx_id
// /blog-api/user/:wallet_address/following
// /blog-api/user/:wallet_address/followers

const port = 4000;

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
