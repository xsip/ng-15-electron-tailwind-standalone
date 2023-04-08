import {Injectable} from '@angular/core';

//@ts-ignore
const express = window.require('express');
//@ts-ignore
const morgan = window.require("morgan");
//@ts-ignore
const { createProxyMiddleware } = window.require('http-proxy-middleware');
// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const HOST = "localhost";
const API_SERVICE_URL = "https://dummyjson.com/products";
export interface ProxyConfig {
  from: string;
  to: string;
}
@Injectable({
  providedIn: 'root'
})
export class ExpressService {
  app = express();
  server: any = undefined;
  running = false;
  proxies: ProxyConfig[] = [];
  constructor() {
    app.use(morgan('dev'));
    app.get('/info', (req: any, res: any, next: any) => {
      res.send('This is a test server');
    });

  }
  start() {
    this.running = true;
    this.server = app.listen(PORT, HOST, () => {
      console.log(`Starting Proxy at ${HOST}:${PORT}`);

    });
  }
  stop() {
    this.running = false;
    this.server?.close();
  }
  removeProxy(proxyConfig: ProxyConfig) {
    this.proxies = this.proxies.filter(proxy => proxy.to === proxyConfig.to);
    console.log(app._router.stack)
  }
  addProxy(proxyConfig: ProxyConfig) {
    this.proxies.push(proxyConfig);
    app.use(proxyConfig.from, createProxyMiddleware({
      target: proxyConfig.to,
      changeOrigin: true,
      pathRewrite: {
        [proxyConfig.from]: '',
      },
    }));

  }
}
