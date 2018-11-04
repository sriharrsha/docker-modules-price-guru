var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'https://elastic:IAqTiOjNZ8ENh3nskZ2zwQZf@a0abacf5a780498fbefcd6adaca25f2d.us-central1.gcp.cloud.es.io:9243',
    log: 'trace'
});

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});

client.indices.create({
    index: 'products'
}, function(err, resp, status) {
    if (err) {
        console.log(err);
    } else {
        console.log("create", resp);
    }
});

//filter indexes except my index and search
function searchSimilar(product) {
    return client.search({
        index: 'products',
        type: 'urls',
        body: {
            query: {
                match: {
                    "productName": product.productName
                }
            }
        }
    });
}

function insert(product){
    client.index({
        index: 'products',
        type: 'urls',
        body: { "productName": product.productName, "productUrl": product.productUrl, "productImageUrl": product.productImageUrl  }
    }, function(err, resp, status) {
        console.log(resp);
    });
}

module.exports.searchSimilar = searchSimilar;
module.exports.insert = insert;

