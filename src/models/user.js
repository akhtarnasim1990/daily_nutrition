const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Meal = require('./meal')

// schema of  user model
const userSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true ,
        trim : true
    } , 
    email : {
        type : String ,
        unique : true ,
        required : true ,
        trim : true ,
        lowercase : true ,
        validate (value) {
            if(!validator.isEmail(value)) {
                throw new Error('Invalid email')
            }
        }
    } , 
    password : {
        type : String ,
        required : true ,
        minlength : 7 ,
        trim : true ,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    } ,
    calorie : {
        type : Number ,
        default : 0 , 
        required : true ,
        validate(value) {
            if(value < 0) {
                throw new Error('Calorie must be a positive number')
            }
        }
    } ,
    tokens : [{
        token : {
            type : String ,
            required : true
        }
    }]
} , {
    timestamps : true
})

// Hashing the plain text before saving password
userSchema.pre('save' , async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password , 8)
    }
    
    next()
})

// Delete the user meals when user is removed
userSchema.pre('remove' , async function (next) {
    const user = this
    await Meal.deleteMany({ owner : user._id})
    next()
})

// Relation between user and meals
userSchema.virtual('meals' , {
    ref : 'Meal' ,
    localField : '_id' ,
    foreignField : 'owner'
})

// Hiding private data
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

// Generating authentication tokens
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id : user._id.toString() } , 'thisismynewcourse')

    user.tokens = user.tokens.concat({ token })
    await user.save()
    
    return token
}

// shignin schema
userSchema.statics.findByCredentials = async (email , password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password , user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Creating user model and accessing userSchema
const User = mongoose.model('User'  , userSchema)

module.exports = User          