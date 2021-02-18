const express = require('express')
const Meal = require('../models/meal')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/meals' , auth , async (req , res) => {
    // const meal = new Meal(req.body)
    const meal = new Meal({
        ...req.body ,
        owner : req.user._id
    })

    try {
        await meal.save()
        res.status(201).send(meal)
    } catch (err) {
        res.status(400).send(err)
    }
    
})

// GET /meals?sortBy=calorie:desc or timestamps
router.get('/meals' , auth , async (req , res) => {
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
   }

    try {
        await req.user.populate({
            path : 'meals' , 
            // match ,
            options : {
                limit : parseInt(req.query.limit) ,
                skip : parseInt(req.query.skip),
                sort 
            }
        }).execPopulate()
        res.send(req.user.meals)
    } catch (err) {
        res.status(500).send()
    }
    
})

router.get('/meals/:id' , auth , async (req ,res) => {
    const _id = req.params.id

    try {
        const meal = await Meal.findOne({ _id , owner : req.user._id})

        if (!meal) {
            return res.status(404).send()
        }
        res.send(meal)
    } catch (err) {
        res.status(500).send()
    }

})

router.patch('/meals/:id' , auth , async (req , res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [ 'mealType' , 'mealName' ,'description' , 'calorie']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error : 'Invalid updates!'})
    }
    try {
        const meal = await Meal.findOne({ _id : req.params.id , owner : req.user._id })
        

        if (!meal) {
            return res.status(400).send()
        }
        updates.forEach((update) => meal[update] = req.body[update])
        await meal.save()
        res.send(meal)
    } catch (err) {
        res.status(400).send(err)
    }
})

router.delete('/meals/:id' , auth ,  async (req , res) => {
    try {
        const meal = await Meal.findOneAndDelete({ _id : req.params.id , owner : req.user._id})
        if (!meal) {
            return res.status(404).send()
        }
        res.send(meal)
    } catch (err) {
        res.status(500).send()
    }
})

module.exports = router