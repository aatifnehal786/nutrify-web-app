require("dotenv").config()
const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const userModel = require('./Models/userModel')
const verifiedToken = require('./verifiedToken')
const foodModel = require('./Models/foodModel')
const trackingModel = require('./Models/trackingModel')
const cors = require('cors')
const PORT = process.env.PORT || 8000



mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("Database connection successful")
})
.catch((err)=>{
    console.log(err)
})

const app = express()
app.use(express.json())
app.use(cors())

app.post("/register",(req,res)=>{

    let user = req.body
    bcrypt.genSalt(10,(err,salt)=>{
        if(!err){
            bcrypt.hash(user.password,salt,async (err,hpass)=>{
                user.password=hpass;
                try{
                    let doc = await userModel.create(user)
                    res.status(201).send({doc,message:"User registered"})
                }
                catch(err){
                    console.log(err)
                    res.status(500).send({message:"Some problem"})
                }
            })
        }
    })

})

app.post("/login",async (req,res)=>{
    let userCred = req.body
    try{
        let user = await userModel.findOne({email:userCred.email})
        console.log(user)
    if(user!==null){
        bcrypt.compare(userCred.password,user.password,(err,result)=>{
            if(result==true){
                jwt.sign({email:userCred.email},"aatifkey",(err,token)=>{
                    if(!err){
                        res.status(201).send({token:token,message:"Login success",userid:user._id,name:user.name})
                    }
                    else{
                        res.status(403).send({message:"Some problem while generating token"})
                    }
                })
                
            }else{
                res.status(401).send({message:"Wrong password"})
            }
        })
    }else{
        res.status(404).send({message:"User not found please login again"})
    }

    }catch(err){
        console.log(err)
        res.status(500).send({message:"Some Problem"})

    }
})

app.get("/foods",verifiedToken,async (req,res)=>{

    let foods = await foodModel.find()
    res.send(foods)

})

app.post("/food/data",verifiedToken,async (req,res)=>{
    let foodItem = req.body
    console.log(foodItem)
    try{

        let newFood = await foodModel.create(foodItem)
        console.log(newFood)
        res.send({newFood,message:"New Food Added"})

    }
    catch(err){
        console.log(err)
        res.send({message:"No data"})

    }
})

app.get("/foods/:name",verifiedToken,async (req,res)=>{
    let foodName = req.params.name
    let searchFood = await foodModel.find({name:{$regex:foodName,$options:'i'}})
    if(searchFood.length!==0){
        res.status(201).send(searchFood)
    }else{
        res.status(404).send({message:"Food Item not Found"})
    }
})

app.post("/track",verifiedToken,async (req,res)=>{

    let trackData = req.body;
    console.log(trackData)
    try{
        let data = await trackingModel.create(trackData)
        console.log(data)
        res.status(201).send({data,message:"Food added"})
    }
    catch(err){
        console.log(err)
        res.send({message:"No data"})


    }


})

// endpoint to fetch all foods eaten by a single person
app.get("/track/:userid/:date",verifiedToken,async (req,res)=>{
    let userid = req.params.userid;
    let date = new Date(req.params.date)
    let strDate = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()
    console.log(strDate)
    try{

        let foods = await trackingModel.find({user:userid,eatendate:strDate}).populate('user').populate('food')
        res.send(foods)

    }
    catch(err){
        res.send({message:"Some problem"})
    }
})

app.listen(PORT,()=>{
    console.log("Server is up and running")
})