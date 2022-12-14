const User = require('../models/user');
const jwt = require('jsonwebtoken');

const getToken = userId => {
    return jwt.sign(
        {userId: userId}, 
        process.env.JWT_SECRET_KEY, 
        { expiresIn: '1h' }
    );
} 

exports.signUp = (req, res) => {
    const newUser = new User(req.body);
    newUser.save()
        .then(user => {
            const token = getToken(user._id)
            res.cookie('jwt-token', token, {
                httpOnly: true,   // accessible only by web server
                secure: true,     //https
                sameSite: 'None', // cross site cookie
                maxAge: 1000 * 60 * 60 * 24,
            })
            res.json({
                success: true,
                message: 'Sign up successful',
            });
        })
        .catch(err => {
            res.json({
                success: false,
                error: err,
            });
        });
}

exports.signIn = (req, res) => {
    const { username, password } = req.body;
    
    User.findOne({$or: [{username}, {email: username}]})
        .then(user => {
            user.authenticate(password)
                .then(result => {
                    if(result) {
                        const token = getToken(user._id)
                        res.cookie('jwt-token', token, {
                            httpOnly: true,   // accessible only by web server
                            secure: true,     // https
                            sameSite: 'None', // cross site cookie
                            maxAge: 1000 * 60 * 60 * 24,
                        })
                        res.json({
                            success: true,
                            message: 'Login Successful',
                        });
                    } else {
                        res.json({
                            success: false,
                            error: {
                                message: 'Wrong credentials'
                            },
                        });
                    }
                })
        })
        .catch(error => res.json(error));
}

exports.signOut = (req, res) => {
    res.clearCookie('jwt-token');
    res.json({
        success: true,
        message: "User sign out was successful"
    });
}

exports.isAuthenticated = (req, res, next) => {
    const token = req.cookies['jwt-token'];
    jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decoded) {
        if(err) {
            res.json({
                success: false,
                error: err,
            })
        } else {
            req.userId = decoded.userId;
            next();
        }
    });
}