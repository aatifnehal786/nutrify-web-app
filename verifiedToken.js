const jwt = require('jsonwebtoken')
const verifiedToken = (req, res, next) => {
    let token = req.headers.authorization.split(" ")[1]
    try {
        let token = req.headers.authorization.split(" ")[1]
        jwt.verify(token,"aatifkey",(err,result)=>{
            if(!err){
                next()
            }
        })
    }
    catch (err) {
        console.log(err)
        res.send({ message: "Some problem" })
    }
}

module.exports = verifiedToken;