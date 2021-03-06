var models = require("../../models")
module.exports = function(screenName,password){
    // validate
    if(!screenName && typeof screenName !== "string") return reject("require-screenName")
    if(!password && typeof password !== "string") return reject("require-password")
    return models.users.findOne({screenNameLower:screenName.toLowerCase()}).then(function(res){
        if(res) return Promise.reject("duplicate-screenName")
        var user = new models.users()
        user.screenName = screenName;
        user.screenNameLower = screenName.toLowerCase();
        user.setPassword(password);
        return user.save();
    })
}