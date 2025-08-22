/* eslint-disable */
/* tslint:disable */

/**
 * Mock Service Worker (2.0.11).
 * @see https://github.com/mswjs/msw
 * - Please do NOT modify this file.
 * - Please do NOT serve this file on production.
 */

const INTEGRITY_CHECKSUM = '3d6b9f06410d179a7f7404d4bf4c3c70'
const IS_MOCKED_RESPONSE = Symbol('isMockedResponse')
const activeClientIds = new Set()

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', async function (event) {
  const clientId = event.source.id

  if (!clientId || !self.clients) {
    return
  }

  const client = await self.clients.get(clientId)

  if (!client) {
    return
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  switch (event.data.type) {
    case 'KEEPALIVE_REQUEST': {
      sendToClient(client, {
        type: 'KEEPALIVE_RESPONSE',
        payload: Date.now(),
      })
      break
    }

    case 'INTEGRITY_CHECK_REQUEST': {
      sendToClient(client, {
        type: 'INTEGRITY_CHECK_RESPONSE',
        payload: INTEGRITY_CHECKSUM,
      })
      break
    }

    case 'MOCK_ACTIVATE': {
      activeClientIds.add(clientId)

      sendToClient(client, {
        type: 'MOCKING_ENABLED',
        payload: true,
      })
      break
    }

    case 'MOCK_DEACTIVATE': {
      activeClientIds.delete(clientId)
      break
    }

    case 'CLIENT_CLOSED': {
      activeClientIds.delete(clientId)

      const remainingClients = allClients.filter((client) => {
        return client.id !== clientId
      })

      // Unregister itself when there are no more clients
      if (remainingClients.length === 0) {
        self.registration.unregister()
      }

      break
    }
  }
})

self.addEventListener('fetch', function (event) {
  const { request } = event
  const accept = request.headers.get('accept') || ''

  // Bypass server-sent events.
  if (accept.includes('text/event-stream')) {
    return
  }

  // Bypass navigation requests.
  if (request.mode === 'navigate') {
    return
  }

  // Opening the DevTools triggers the "only-if-cached" request
  // that cannot be handled by the worker. Bypass such requests.
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return
  }

  // Bypass all requests when there are no active clients.
  // Prevents the self-unregistered worked from handling requests
  // after it's been deleted (still remains active until the next reload).
  if (activeClientIds.size === 0) {
    return
  }

  // Generate unique request ID.
  const requestId = Math.random().toString(16).slice(2)

  event.respondWith(
    handleRequest(event, requestId).catch((error) => {
      if (error.name === 'NetworkError') {
        console.warn(
          'Mock Service Worker caught a network error from a "%s" request to "%s". This is probably a CORS issue or a rejected promise. Resolve the underlying issue to prevent this message from appearing.',
          request.method,
          request.url,
        )
      }

      throw error
    })
  )
})

async function handleRequest(event, requestId) {
  const client = await resolveMainClient(event)
  const response = await getResponse(event, client, requestId)

  // Send back the response clone for the "response:*" life-cycle events.
  // Ensure MSW is active and ready to handle the message, otherwise
  // this message will pend indefinitely.
  if (client && activeClientIds.has(client.id)) {
    ;(async function () {
      const clonedResponse = response.clone()
      sendToClient(client, {
        type: 'RESPONSE',
        payload: {
          requestId,
          type: clonedResponse.type,
          ok: clonedResponse.ok,
          status: clonedResponse.status,
          statusText: clonedResponse.statusText,
          body:
            clonedResponse.body === null ? null : await clonedResponse.text(),
          headers: Object.fromEntries(clonedResponse.headers.entries()),
          redirected: clonedResponse.redirected,
        },
      })
    })()
  }

  return response
}

// Resolve the main client for the given event.
// Client that issues a request doesn't necessarily equal the client
// that registered the worker. It's with the latter the worker should
// communicate with during the response resolution.
async function resolveMainClient(event) {
  const url = new URL(event.request.url)

  // If the worker was registered for a specific client, resolve that client.
  if (url.pathname === '/mockServiceWorker.js') {
    return null
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  return allClients
    .filter((client) => {
      // Get the client ID from the request URL or fallback to
      // the request header value.
      const clientId = getClientId(event.request)

      return client.id === clientId
    })[0]
}

async function getResponse(event, client, requestId) {
  const { request } = event
  const clonedRequest = request.clone()

  function passthrough() {
    // Clone the request because it might've been already used
    // (i.e. its body has been read and sent to the client).
    const headers = Object.fromEntries(clonedRequest.headers.entries())

    // Remove MSW-specific request headers so the bypassed requests
    // comply with the server's CORS preflight check.
    // Operate with the headers as an object because request "Headers"
    // are immutable.
    delete headers['x-msw-bypass']

    return fetch(clonedRequest, { headers })
  }

  // Bypass mocking when the client is not active.
  if (!client) {
    return passthrough()
  }

  // Bypass initial page load requests (i.e. static assets).
  // The absence of the immediate/parent client in the map of the active clients
  // means that MSW hasn't dispatched the "MOCK_ACTIVATE" event yet
  // and is not ready to handle requests.
  if (!activeClientIds.has(client.id)) {
    return passthrough()
  }

  // Bypass requests with the explicit bypass header.
  // Such requests can be issued by "ctx.fetch()".
  if (request.headers.get('x-msw-bypass') === 'true') {
    return passthrough()
  }

  // Notify the client that a request has been intercepted.
  const clientMessage = await sendToClient(
    client,
    {
      type: 'REQUEST',
      payload: {
        id: requestId,
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        cache: request.cache,
        mode: request.mode,
        credentials: request.credentials,
        destination: request.destination,
        integrity: request.integrity,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        body: await request.text(),
        bodyUsed: request.bodyUsed,
        keepalive: request.keepalive,
      },
    },
    1000,
  )

  switch (clientMessage.type) {
    case 'MOCK_RESPONSE': {
      return respondWithMock(clientMessage.data)
    }

    case 'MOCK_NOT_FOUND': {
      return passthrough()
    }

    case 'NETWORK_ERROR': {
      const { name, message } = clientMessage.data
      const networkError = new Error(message)
      networkError.name = name

      // Rejecting a "respondWith" promise is equivalent to
      // throwing during the request, except that it also
      // looks at the produced error and, if it's a network error,
      // will result in a network error being dispatched.
      throw networkError
    }
  }

  return passthrough()
}

function sendToClient(client, message, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        return reject(event.data.error)
      }

      resolve(event.data)
    }

    client.postMessage(
      message,
      [channel.port2]
    )

    setTimeout(() => {
      reject(new Error('timeout'))
    }, timeout)
  })
}

function respondWithMock(response) {
  return new Response(response.body, response)
}

function getClientId(request) {
  return request.headers.get('x-msw-client-id')
}