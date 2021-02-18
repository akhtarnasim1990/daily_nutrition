const mongoose = require('mongoose')

const mealSchema = new mongoose.Schema({
    mealType : {
        type : String ,
        trim : true
    } ,
    mealName : {
        type : String ,
        trim : true
    } ,
    description : {
        type : String ,
        required : true ,
        trim : true 
    } , 
    calorie : {
        type : Number ,
        required : true

    } , 
    owner : {
        type : mongoose.Schema.Types.ObjectId ,
        required : true ,
        ref : 'User'
    }
} ,  {
    timestamps : true
})

const Meal = mongoose.model('Meal'  , mealSchema)

module.exports = Meal