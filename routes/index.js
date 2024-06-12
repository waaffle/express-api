const express = require('express');
const router = express.Router();
const multer = require('multer');

const uploadDestination = 'uploads';

const storage = multer.diskStorage({
    destination: uploadDestination,
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
})

const uploads = multer({storage: storage});

router.get('/register', (request, response) => {
    response.send('register')
})

console.log(module);

module.exports = router;