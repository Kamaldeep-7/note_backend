const express = require('express');

// User is a collection in the database under schema in the user file
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
// bcrypt package to make the password more strong
const bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
var otpGenerator  = require('otp-generator')
const {fetchuser} = require('../middleware/fetchuser')
const JWT_SECRET = 'kamalDeep#SECRET';
const nodemailer = require("nodemailer")

//   Route:1
// create a user using: POST"/api/auth/createuser". no login required
router.post("/createuser",


async (req, res) => {

    
    let success = false
    
    
    try {
        

        // check whether the user email already exist or not 

        let user = await User.findOne({ email: req.body.email });
        if (user) {
            // checking the user already exist or not 
            success = false; 
            return res.status(400).json({success ,  error: "Sorry a user with the same email already exist" })
        }

        


        var salt = bcrypt.genSaltSync(10);
        secpass = bcrypt.hashSync(req.body.password, salt);
        // adding salt to the password to make it more strong

        // creating a new user 
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secpass,
        })

        user.save();
        success = true; 

        const transport = nodemailer.createTransport({
            service:'Gmail',
            auth:{
                user:'kamal70.kr@gmail.com',
                pass:'cnev afww lvds wflw'
            },
            port: 0, // Use the first available port
        secure: true // true for SSL/TLS
        });

        const mailoptions = {
            from :'kamal70.kr@gmail.com',
            to:`${req.body.email}`,
            subject:"Registration email",
            html:

            `<div><div style="background-color:#f6f6f6;margin:0">
  <table style="font-family:'akzidenz','helvetica','arial',sans-serif;font-size:14px;color:#5e5e5e;width:98%;max-width:600px;float:none;margin:0 auto" border="0" cellpadding="0" cellspacing="0" valign="top" align="left">
    <tbody>
      <tr bgcolor="#ffffff">
        <td>
          <table bgcolor="#ffffff" style="width:100%;line-height:20px;padding:32px;border:1px solid;border-color:#f0f0f0" cellpadding="0">
            <tbody>
              <tr>
                <td style="color:#3d4f58;font-size:24px;font-weight:bold;line-height:28px">Thanku ${req.body.name} for the registration.</td>
              </tr>
              <tr>
                <td style="padding-top:24px;font-size:16px">You are receiving this email because a request was made for registering with us.</td>
              </tr>
            </tbody>
          </table></td>
      </tr>
      <tr>
        <td align="center" style="font-size:12px;padding:24px 0;color:#999">This message was sent from inotebook</td>
      </tr>
    </tbody>
  </table><div class="yj6qo"></div><div class="adL">
</div></div></div>`
        }


        const sendTheMail = ()=>{

            transport.sendMail(mailoptions, (error, info) => {
                if (error) {
                console.log('Error:', error);
                } else {
                console.log('Email sent:', info.response);
                }
            });
        }

        sendTheMail();
        
        
        res.status(200).json(success);
    } catch (error) {
        
        // if there is some error in the code above 500 status code will be showed
        console.error(error.message );
        res.status(500).json("Internal Server Error");
    }

})


// Route:2
// authenticate a user using: POSTv"/api/auth/login". no login required
router.post("/login", [

    // these isemail , isLength comes under express package
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),

], async (req, res) => {
        
    let success = false; 

    // if there are errors , return the bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        
        let user = await User.findOne({ email })
        // find the user with email provided by the user

        if (!user) {
            // user doesnot exixt with this email so send the status and msg
            success = false;
            return res.status(400).json({ success, error: "Please try to login with correct credentials." })
        }

        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success , error: "Please try to login with correct credentials " })
        }
        

        const data = {
            user: {
                // fetch the user id
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        
        success = true; 
        res.status(200).json({success, authToken });

    } catch (error) {

        // if there is some error in the code above 500 status code will be showed
        console.error(error.message);
        res.status(500).json("Internal Server Error ");

    }


})


// Route :3 
// get logged in details user Details using : Post "api/auth/getuser" login required



router.post("/getuser", 


// this ia a middleware functoin
fetchuser

, async (req, res) => {
    try {
        user = req.user.id;
        const user = await User.findById(user).select("-password")
        return res.send(user);
    } catch (error) {

        // if there is some error in the code above 500 status code will be showed
        console.error(error.message);
        res.status(500).send("Internal Server Error ");

    }
})



router.get("/otpgenerate", async(req, res)=>{
    try {
        
        const{email} = req.query;
        const user = await User.findOne({email});
        if(user){
            res.app.locals.email = email;
            res.app.locals.OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
            console.log(res.app.locals.OTP)
            
            // send the mail if otp generated



            const transport = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:'kamal70.kr@gmail.com',
                    pass:'dnnrfhcyibaqlyda'
                },
                port: 0, // Use the first available port
                secure: true // true for SSL/TLS
            });

            const mailoptions = {
                from :'kamal70.kr@gmail.com',
                to:`${email}`,
                subject:"OTP for the verification purpose",
                html:


                `<div><div style="background-color:#f6f6f6;margin:0">
  <table style="font-family:'akzidenz','helvetica','arial',sans-serif;font-size:14px;color:#5e5e5e;width:98%;max-width:600px;float:none;margin:0 auto" border="0" cellpadding="0" cellspacing="0" valign="top" align="left">
    <tbody>
      <tr bgcolor="#ffffff">
        <td>
          <table bgcolor="#ffffff" style="width:100%;line-height:20px;padding:32px;border:1px solid;border-color:#f0f0f0" cellpadding="0">
            <tbody>
              <tr>
                <td style="color:#3d4f58;font-size:24px;font-weight:bold;line-height:28px">Action Required: One-Time Verification Code</td>
              </tr>
              <tr>
                <td style="padding-top:24px;font-size:16px">You are receiving this email because a request was made for a one-time code that can be used for authentication.</td>
              </tr>
              <tr>
                <td style="padding-top:24px;font-size:16px">Please enter the following code for verification:</td>
              </tr>
              <tr>
                <td style="padding-top:24px;font-size:16px" align="center"><span id="m_-3683876995154112957verification-code" style="font-size:18px">${req.app.locals.OTP}</span></td>
              </tr>
            </tbody>
          </table></td>
      </tr>
      <tr>
        <td align="center" style="font-size:12px;padding:24px 0;color:#999">This message was sent from inotebook</td>
      </tr>
    </tbody>
  </table><div class="yj6qo"></div><div class="adL">
</div></div></div>`
            }


            const sendTheMail = ()=>{

                transport.sendMail(mailoptions, (error, info) => {
                    if (error) {
                    console.log('Error:', error);
                    } else {
                    console.log('Email sent:', info.response);
                    }
                });
            }

            sendTheMail();
            return res.status(200).json({otp : res.app.locals.OTP,msg:`OTP sended at ${email} successfully `})
        } else {
            return res.status(404).json({msg:"Invalid user"})
        }

        // then a request for the mail will get strike.

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({msg:"Internal server error"});
    }
})

router.get("/otpverify", async(req, res)=>{
   
    try {
        const otp = req.query.otp;
        if(parseInt(req.app.locals.OTP) == parseInt(otp)) {
            req.app.locals.otp = null;
            res.app.locals.resetsession = true;
            return res.status(200).json({msg:"OTP verified successfully"})
        } else {
            return res.status(400).json({otp:otp, msg:"Invalid OTP"})
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({msg:"Internal server error"});
    }
})    


router.post("/resetpassword", async(req, res)=>{
   
    
    try {
    
    if(req.app.locals.resetsession === false){
            return res.status(400).json({msg:"Session expire, again request for the OTP"})
        }

        const{email} = req.body;
        if(req.app.locals.email != email) {
            return res.status(400).json({msg:"Invalid user"})
        }
        const user = await User.findOne({email});
        if(user){
            res.app.locals.email = "";
            var salt = bcrypt.genSaltSync(10);
            secpass = bcrypt.hashSync(req.body.password, salt);
            await User.updateOne({email:email},{password:secpass});
            req.app.locals.resetsession = false;
            return res.status(200).json({msg:"Password updated"})
        } else {
            return res.status(400).json({msg:"Invalid user"})
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({msg:"Internal server error"});
}
})    




module.exports = router
