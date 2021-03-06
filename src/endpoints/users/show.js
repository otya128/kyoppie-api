var models = require("../../models")
module.exports = function* (screenName,id){
    if(!screenName && !id) return Promise.reject("screenName-or-id-require")
    var user
    if(screenName) {
        user = yield models.users.findOne({screenNameLower:screenName.toLowerCase()})
    } else {
        user = yield models.users.findOne({_id:models.mongoose.Types.ObjectId(id)})
    }
    if(!user) return Promise.reject("user-not-found")
    if(user.isSuspended) return Promise.reject("this-user-is-suspended");
    return user;
}
