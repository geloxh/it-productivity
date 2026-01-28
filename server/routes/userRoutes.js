const express = require('express');
const {
    getAllUsers,
    getUserById,
    createUser,
    //updateUser,
    // deleteUser
} = require('../controllers/userController');


const router = express.Router();

// Route to /api/v1/users
router.route('/')
    .get(getAllUsers)
    .post(createUser);

router.route('/:id')
    .get(getUserbyId);
    // .patch(updateUser)
    // .delete(deleteUser);

module.exports = router;