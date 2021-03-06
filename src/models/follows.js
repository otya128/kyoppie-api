module.exports = function(mongoose) {
    var schema = new mongoose.Schema({
        fromUser:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
        toUser:{type:mongoose.Schema.Types.ObjectId,ref:"users"}
    },{
        timestamps:true
    })
    schema.methods.toResponseObject = function(){
        var obj = this.toObject();
        obj.id = this._id;
        obj._id = undefined;
        obj.__v = undefined;
        if(this.fromUser.toResponseObject) obj.fromUser=this.user.toResponseObject();
        if(this.toUser.toResponseObject) obj.toUser=this.user.toResponseObject();
        return obj;
    }
    return mongoose.model("follows",schema)
};
