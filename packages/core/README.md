# Void (Core library)

This is the official/reference library for connecting to the Void network.
As it is P2P network, every instance is both a client and a server.
As such the library needs to run in the background continuously to function
correctly.

As can be seen in the reference app this is best achieved with library code
running in separate (service) process and communicating with it asynchronously.

The library is built around Hypercore 10 (alpha) and Hyperswarm 5 (alpha).
The switch to Hyperswarm 6 will happen as soon as libudx bindings are complete
for the mobile ecosystem. The library uses libsodium for additional crypto
not provided by hyper-libraries. This is to keep dependencies minimal as
hyper-libraries also depend on libsodium.

Currently only chat (1-to-1 and group) is implemented. True to it's P2P nature,
group chat is actually more reliable, as even peers that are offline can propagate
updates as long as at least 1 online peer has seen those updates.

As I work out the design of the network, I will eventually post a DESIGN doc
here specifying how peers interact with the network and each other. This is
far from finished and I'm actively working on it, so it will take some time.
