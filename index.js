const express = require('express');
const httpProxy = require('http-proxy');
const { urls } = require('./constant');
const { logger, morganMiddleware } = require('./service/logger.services');
const app = express();
const proxy = httpProxy.createProxyServer();


app.use(morganMiddleware);
app.use('/api/users', (req, res) => {
  logger.info(`Incoming request to /api/users:--> ${req.method} ${req.url}`)

  // console.log("url :: ", req);
  const redirectionUrl = urls.auth_service + req.baseUrl
  logger.debug(` request will be redirected to :   ${redirectionUrl}`)

  proxy.web(req, res, { target: urls.auth_service + req.baseUrl }, (err) => {
    logger.error(`Error forwarding request to service A: ${err.message} `)

    res.status(500).send('Internal Server Error');
  });
});

app.use('/api/tasks', (req, res) => {

  logger.info(`Incoming request to /api/info: ${req.method} ${req.url} `)
  const redirectionUrl = urls.task_service + req.baseUrl
  logger.debug(` request will be redirected to :   ${redirectionUrl}`)
  proxy.web(req, res, { target: urls.task_service + req.baseUrl }, (err) => {
    logger.error(`Error forwarding request to service B: ${err.message} `)
    res.status(500).send('Internal Server Error');
  });
});

// Add this middleware to log the request received by the proxy 
proxy.on('proxyReq', function (proxyReq, req, res, options) {
  logger.info(`Received request to ${options.target.href}: ${req.method} ${req.url}`)

});

const port = 8000;
app.listen(port, () => {
  logger.info(`API Gateway listening on port ${port}`)
});