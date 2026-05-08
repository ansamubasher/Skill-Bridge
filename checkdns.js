const dns = require('dns');
dns.resolveSrv('_mongodb._tcp.cluster0.o5xuys6.mongodb.net', function(e, a) {
  if (e) console.log('SRV BLOCKED:', e.code, e.message);
  else console.log('SRV OK:', JSON.stringify(a));
});
dns.resolve4('cluster0-shard-00-00.o5xuys6.mongodb.net', function(e, a) {
  if (e) console.log('Direct A-record BLOCKED:', e.code);
  else console.log('Direct A-record OK:', a);
});
