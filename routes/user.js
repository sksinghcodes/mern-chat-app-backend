const router = require('express').Router();
const { 
    signUp,
    signIn,
    signOut,
} = require('../controllers/user');

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/sign-out', signOut);

module.exports = router;