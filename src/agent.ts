import { fork } from 'node:child_process'
import * as path from 'node:path'
import * as rpc from 'vscode-jsonrpc/node'

const child = fork(
  path.join(__dirname, '../dist/agent.js'),
  [
    // '--node-ipc', '--stdio' or '--socket={number}'
    '--stdio',
  ],
  {
    stdio: 'pipe',
    execArgv: [],
  },
)

const connection = rpc.createMessageConnection(
  new rpc.StreamMessageReader(child.stdout!),
  new rpc.StreamMessageWriter(child.stdin!),
)
connection.listen()

connection.onRequest('LogMessage', params => {
  console.log('LogMessage: ', params)
})
connection.onRequest('featureFlagsNotification', params => {
  console.log('featureFlagsNotification: ', params)
})
connection.onRequest('statusNotification', params => {
  console.log('statusNotification: ', params)
})

class CopilotAgent {
  constructor() {
      this.advancedConfig = new CopilotAdvancedConfig();
      this.setupRequestInterceptor();
  }

  setupRequestInterceptor() {
      const originalFetch = global.fetch;
      global.fetch = async (url, options) => {
          const config = this.advancedConfig.getConfig();
          // 添加认证提供者信息
          if (config.authProvider) {
              options.headers = options.headers || {};
              options.headers['X-Copilot-Auth-Provider'] = config.authProvider;
          }

          return originalFetch(url, options);
      };
  }
}


export { connection }
