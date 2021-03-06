var models = require("../../models")
var newRequestToken = require("../../utils/newRequestToken")
var crypto = require("crypto");
module.exports = function* (appKey,appSecretHash,sigKey,pinCode,requestToken){
    // 必須パラメータがあるかどうか
    if(!appKey) return Promise.reject("appKey-is-require");
    if(!appSecretHash) return Promise.reject("appSecret-is-is-require")
    if(!sigKey) return Promise.reject("sigKey-is-require")
    if(!pinCode) return Promise.reject("pinCode-is-require")
    if(!requestToken) return Promise.reject("requestToken-is-require")
    // request_tokenなどが存在するかどうかを確認
    var app = yield models.apps.findOne({appKey})
    var sig = yield models.signatures.findOne({sigKey})
    var request_token = yield models.request_tokens.findOne({token:requestToken})
    if(!app) return Promise.reject("app-not-found")
    if(!sig || sig.app != app.id) return Promise.reject("signature-not-found")
    if(!request_token || request_token.app != app.id) return Promise.reject("requestToken-not-found")
    // 実際に署名して、appSecretが正しいかどうか確認する
    var secretHash = crypto.createHash("sha256").update(app.appSecret+sig.sigHash).digest("hex")
    if(secretHash !== appSecretHash) return Promise.reject("invalid-appSecret")
    yield sig.remove() // 署名が正しいことが確認できたので、署名を無効化
    // pinCodeを探す
    var pin_code = yield models.pin_codes.findOne({code:pinCode})
    if(!pin_code) return Promise.reject("pinCode-not-found")
    if(pin_code.request_token != request_token.id) return Promise.reject("pinCode-not-found")
    // pinCodeがあった
    // request_tokenを無効化
    yield models.request_tokens.findOne({token:requestToken}).remove()
    var access_token = yield models.access_tokens.findOne({user:pin_code.user,app:app.id})
    // access_tokenがすでにあるならそれを使う
    if(access_token){
        yield models.pin_codes.findOne({id:pin_code.id}).remove()
        return access_token
    }
    // ないなら作る
    access_token = new models.access_tokens()
    access_token.user = pin_code.user
    access_token.app = pin_code.app
    access_token.secret = crypto.createHash("sha256").update(app.appKey+access_token.token+app.appSecret).digest("hex")
    yield access_token.save()
    yield models.pin_codes.findOne({id:pin_code.id}).remove()
    return access_token
}