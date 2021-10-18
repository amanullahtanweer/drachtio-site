# SIP Proxy

Building a SIP proxy with drachtio is pretty darn simple.
```js
srf.invite((req, res) => {
  srf.proxyRequest(req, 'sip.example1.com')
    .then((results) => console.log(JSON.stringify(results)) );
});
```
In the example above, we receive an INVITE and then proxy it onwards to the server at 'sip.example1.com'.

> Note: as with other methods, a callback variant is also available.

[Srf#proxyRequest](/docs/api#Srf+proxyRequest) returns a Promise that resolves when the proxy transaction is complete -- i.e. final responses and ACKs have been transmitted, and the call is either connected or has resulted in a final non-success response. The `results` value that the Promise resolves provides a complete description of the results.

There are a bunch of options that we can utilize when proxying a call, but before we take a look at those let's consider the two fundamentally different proxy scenarios that we might encounter:
1. The incoming INVITE has a Request-URI of the dractio server, and we want to proxy it on towards a next sip uri that we supply in the calll to [Srf#proxyRequest](/docs/api#Srf+proxyRequest).  An example of this use case occurs when we have a drachtio server acting as a load balancer in front of an array of application or media servers.
2. The incoming INVITE has a Request-URI of a remote endpoint, and we want to proxy it on towards that endpoint.  An example of this use case occurs when we have a drachtio server acting as an outbound SIP proxy.

How we handle these two scenarios is governed by whether we supply a sip uri in the call to [Srf#proxyRequest](/docs/api#Srf+proxyRequest).  In the first example above, we supplied a sip uri in the method call and as a result the drachtio server will do the following:
* If the incoming INVITE had a Request-URI that matches a local address that the drachtio server is listening on, then it will replace the Request-URI in the outbound INVITE to that specified in the method call *and* will forward the INVITE to that address.
* Otherwise, the outbound INVITE will leave the Request-URI unchanged while forwarding the INVITE to the sip uri specified in the method call. 

An implication of this is that we can call [Srf#proxyRequest](/docs/api#Srf+proxyRequest) without specifying a sip uri at all; in this case, drachtio acts as an outbound proxy and forwards the INVITE towards the Request-URI of the incoming INVITE.

### SIP proxy acting as a load balancer
```js
srf.invite((req, res) => {
  srf.proxyRequest(req, ['sip.example1.com','sip2.example1.com]')
    .then((results) => console.log(JSON.stringify(result)) );
});
```
The above example illustrates that we can provide either a string or an Array of strings as the sip uri to proxy an INVITE to.  In the latter case, if the INVITE fails on the first sip server it will then be attempted on the second, and so on until a successful response is received or the list is exhausted.

### SIP outbound proxy
```js
srf.invite((req, res) => {
  srf.proxyRequest(req)
    .then((results) => console.log(JSON.stringify(result)) );
});
```
In the above example there is no need to supply a sip uri if the drachtio server is acting as a simple outbound proxy.

### SIP Proxy options
```js
srf.invite((req, res) => {
  srf.proxyRequest(req, ['sip.example1.com','sip2.example1.com]', {
    recordRoute: true,
    followRedirects: true,
    forking: true,
    provisionalTimeout: '2s',
    finalTimeout: '18s'
  })
    .then((results) => console.log(JSON.stringify(result)) );
});
```
See [Srf#proxyRequest](/docs/api#Srf+proxyRequest) for a detailed explanation of these options.
