const{Router} = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const router = Router();
require('dotenv').config();

// /api/auth/register
router.post('/register',
    [
       check('email', 'Email is not correct').isEmail(),
       check('password', 'The minimum of password characters is 8 long')
           .isLength({min: 8})
    ],
        async(req, res) => {
try {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
            message: 'Registration data are wrong '
    })
    }
    const  {email, password} = req.body;

    const candidate = await User.findOne({email})
    //   to verify if email already exists..
    if (candidate) {
       return res.status(400).json({message:'This User already exists'})
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    // create new User
    const user = new User ({email, password: hashedPassword})

    await user.save();

    res.status(201).json({message: 'User was created'})


} catch (e) {
    res.status(500).json({message: 'Something is wrong, try again..'})
}
})

// /api/auth/login
router.post('/login',
    [
        check('email', 'Enter the correct email').normalizeEmail().isEmail(),
        check('password', 'Enter the password').exists()
    ],

    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Somethins is wrong'
                })
            }

            const {email, password} = req.body
            //search User
            const user = await User.findOne({email})
            if(!user) {
                return res.status(400).json({message: 'User not found'})
            }
            //if password matches with database
            const isMatch = await bcrypt.compare(password, user.password)

            if(!isMatch) {
                return res.status(400).json({message: 'Password is wrong. Try again'})
            }

            //authorization *npm i jsonwebtoken
            const token = jwt.sign(
                //parameter uebergeben
                {userId: user.id},   //this is an object
                process.env.jwtSecret,
                {expsIn: '1h'}
            )
            res.json({token, userId: user.id})

        } catch (e) {
            res.status(500).json({message: 'Something is wrong, try again..'})
        }
    })

module.exports = router;