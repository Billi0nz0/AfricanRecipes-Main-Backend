const NodeCache = require("node-cache");

// Cache for 5 minutes
module.exports = new NodeCache({
    stdTTL: 300,
    checkperiod: 60,
    useClones: false
});