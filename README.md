# P2P Distributed Exchange Implementation

This distributed exchange implementation allows clients to take trades whilst placing orders against their own orderbook. On successful addition of orders, the order update is also distributed to and synced across all peers.


## Setup
After Initial bootstrap of grape servers, start the P2P exchange client

```
const P2PExchange = require('./lib/p2p_exchange')

const exchange = new P2PExchange()
exchange.init()

```

To place order to the local client instance
```
curl -H 'Content-Type: application/json' -X POST -d '["r_id", "key", "{\"payload\": {\"action\": \"create-order\", \"data\": {\"size\": 10, \"limit_price\": 100}}}"]' http://localhost:1337/
```


## Features and Components 
#### PeerRPCServer
On init, the exchange initializes a peer rpc server. This server announces itself as "peer-server" on the network.

It listens and reacts to any new order addition request and also any order broadcast request in which case it might need to update it's local version of orderbook 

#### PeerRPCClient

On succesful addition of order, the client looks up for other peers on the network and sends order broadcast request for the others to commit this new order update to their local version of orderbook

#### Matching Engine

Matching engine allows matching of order yielding trade events. An order is matched across levels until the order size is exhausted. In case the entire orderbook liquidity is consumed, the remaining order size is added to the orderbook.

Editing and Deleting orders functionality is not implemented.


## Discussion

Since, each client is working with a local version of orderbook, their can be simultaneous updates to the orderbook across peers which might result in inconsistent orderbook state


The solution intended for this was to have a global order sequence ID. The following protocol was intended

In order to ensure, orderbook is in sync with other peers.
Check new order sequence ID against a global order sequence ID. 
If sequence IDs are consistent, proceed to adding order.
In case the local sequence ID and global sequence ID are out of sync
* Invalidate Current Order
* Retry n times before failure


Updates to this global counter are synchronized via a separate service which allows for setting and fetching of the said counter. This service would be a part of the grape network



## TODO

Currently, the implementation in not at a working state, due to unavailability of time. However, the features discussed above were intended. 

In addition to this, other critical aspects also need to be worked upon
1. Addition of unit tests
2. Error handling


