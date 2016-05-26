var qiniu = require('qiniu');
var config = require('../config.js');

qiniu.conf.ACCESS_KEY = config.qiniu_ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu_SECRET_KEY;
var uptoken = new qiniu.rs.PutPolicy(config.qiniu_Bucket_Name);

// 注册URL
exports.bindurl=function(app){
    app.get('/uptoken', function(req, res, next) {
        var token = uptoken.token();
        res.header("Cache-Control", "max-age=0, private, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        if (token) {
            res.json({
                uptoken: token
            });
        }
    });

    app.post('/downtoken', function(req, res) {

        var key = req.body.key,
            domain = req.body.domain;

        //trim 'http://'
        if (domain.indexOf('http://') != -1) {
            domain = domain.substr(7);
        }
        //trim 'https://'
        if (domain.indexOf('https://') != -1) {
            domain = domain.substr(8);
        }
        //trim '/' if the domain's last char is '/'
        if (domain.lastIndexOf('/') === domain.length - 1) {
            domain = domain.substr(0, domain.length - 1);
        }

        var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
        var deadline = 3600 + Math.floor(Date.now() / 1000);

        baseUrl += '?e=' + deadline;
        var signature = qiniu.util.hmacSha1(baseUrl, config.SECRET_KEY);
        var encodedSign = qiniu.util.base64ToUrlSafe(signature);
        var downloadToken = config.ACCESS_KEY + ':' + encodedSign;

        if (downloadToken) {
            res.json({
                downtoken: downloadToken,
                url: baseUrl + '&token=' + downloadToken
            })
        }
    });
}




