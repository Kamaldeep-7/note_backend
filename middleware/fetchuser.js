var jwt = require('jsonwebtoken');

const JWT_SECRET = 'kamalDeep#SECRET';

const fetchuser = (req, res, next) => {

    // get the user from the jwt token and add id to the req
    // object
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "please authenticate using a valid token in the start" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next()
    } catch (error) {
        res.status(401).send({ error: "please authenticate using a valid token in the end" })
    }

}

const localVariables = (req, res, next)=>{

    req.app.locals = {
        email:null,
        OTP:null,
        resetsession:false,
    }
    next();
}

module.exports = {
    fetchuser,
    localVariables,
}

// module.exports.fetchuser = fetchuser;