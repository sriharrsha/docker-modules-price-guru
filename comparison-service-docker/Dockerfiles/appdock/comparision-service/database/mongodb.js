var mongoose = require('mongoose');
var cachegoose = require('cachegoose');


mongoose.connect(process.env.MONGO_URI+'/compare',  { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);
mongoose.pluralize(null);
var REDIS_IP = process.env.REDIS_IP

cachegoose(mongoose, {
    engine: 'redis',    /* If you don't specify the redis engine,      */
    port: 6379,         /* the query results will be cached in memory. */
    host: REDIS_IP
});

var db = mongoose.connection;

const Schema = mongoose.Schema;

const indexSchema = new Schema({
    productName:  String,
    productUrl: String,
    productImageUrl: String,

});
indexSchema.index({'productName': 'text'});

// assign a function to the "methods" object of our indexSchema
indexSchema.statics.findSimilarProducts = function (productName, cb) {
    return this.findOne({ $text: { $search: productName }, }).cache(60).exec(cb);
};

function connect() {
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // we're connected!
        console.log("DB Connected")
    });
};

//filter indexes except my index and search
function searchSimilar(product) {
     const websites = mongoose.connection.db.listCollections().toArray();
     return websites.then(function(collections) {
         var totalResultsPromises =  collections.filter(collection => collection.name != product.domain).slice(0, 10).map(async restDomain=>{
             var Index = mongoose.model(restDomain.name, indexSchema);
             var productList = await Index.findSimilarProducts(product.productName, function (err, similarProducts) {
                 if (err) {
                     console.log(err);
                     return;
                 }else {
                     return similarProducts;
                 }
             })
             return productList;
         })
         return Promise.all(totalResultsPromises)
     })
}

function insert(product){
    var Index = mongoose.model(product.domain, indexSchema);
    var record = new Index({ productName: product.productName, productUrl: product.productUrl, productImageUrl: product.productImageUrl  });
    record.save();
}

module.exports.connect = connect;
module.exports.searchSimilar = searchSimilar;
module.exports.insert = insert;

