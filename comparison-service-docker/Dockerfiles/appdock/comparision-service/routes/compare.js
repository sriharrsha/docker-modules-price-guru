var express = require('express');
var router = express.Router();
const mongodb = require('../database/mongodb')
const parseDomain = require("parse-domain");
const elasticsearch = require('../database/elasticsearch')

/* GET Top Results By Domain . */
router.get('/', async function(req, res, next) {
    mongodb.connect();
    let results = []
    // console.log(await mongodb.searchSimilar({
    //     productName: req.params.productName,
    //     productUrl : req.params.productUrl,
    //     domain : parseDomain(req.params.productUrl).domain+'_'+parseDomain(req.params.productUrl).tld
    // }).then(array=>array.filter(function (el) {
    //     return el != null;
    // })));
    // console.log(decodeURI(req.query.productName))
    // console.log(decodeURI(req.query.productUrl))
    // console.log(parseDomain(decodeURI(req.query.productUrl)).domain+'_'+parseDomain(decodeURI(req.query.productUrl)).tld)
    elasticsearch.searchSimilar({
        productName: decodeURI(req.query.productName),
        productUrl : decodeURI(req.query.productUrl)
    }).then((result)=>{
       console.log(result.hits.hits);
        for (const hit of result.hits.hits) {
            results.push(hit._source)
        }
        console.log(results);
        res.json(results);
    });

    // res.json(await mongodb.searchSimilar({
    //     productName: decodeURI(req.query.productName),
    //     productUrl : decodeURI(req.query.productUrl),
    //     domain : parseDomain(decodeURI(req.query.productUrl)).domain+'_'+parseDomain(decodeURI(req.query.productUrl)).tld
    // }).then(array=>array.filter(function (el) {
    //     return el != null;
    // })));
});

/* POST A product to save in the database . */
router.post('/', function(req, res, next) {
    mongodb.insert({
        productName: req.body.productName,
        productUrl : req.body.productUrl,
        productImageUrl : req.body.productImageUrl,
        domain : parseDomain(req.body.productUrl).domain+'_'+parseDomain(req.body.productUrl).tld
    });

    elasticsearch.insert({
        productName: req.body.productName,
        productUrl : req.body.productUrl,
        productImageUrl : req.body.productImageUrl,
    });

    res.json(req.body);
});

module.exports = router;
