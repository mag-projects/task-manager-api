const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const {sendWelcomeEmail, sendCancellationEmail} = require("../emails/account");

// // USERS endpoint || Post or create a new user
router.post("/users", async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch (e) {
        res.status(500).send(e);
    }
});

// Login user
router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        // Will not work with USER (can't work with a collection as a whole) only with specific user
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send(`You are now logged out ${req.user.name}`);
    } catch (e) {
        res.status(500).send();
    }
});

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send(`You are now logged out of every device ${req.user.name}`);

    } catch (e) {
        res.send(500).send();
    }
});

// Retrieves own profile
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

// // Retrieves a specific user by ID
// router.get("/users/:id", async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id);
//         if (!user) return res.status(404).send();
//         res.send(user);
//     } catch (e) {
//         res.status(500).send(e);
//     }
// });

// Update user
router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "age", "email", "password"];
    const isValid = updates.every(update => allowedUpdates.includes(update));
    if (!isValid) res.status(400).send(`${updates.toString().toUpperCase()} cannot be updated!`);

    try {
        // const user = await User.findById(req.params.id);
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        // if (!req.user) res.status(404).send();
        res.send(`${updates.toString().toUpperCase()} updated successfully!`);
    } catch (e) {
        res.status(400).send(e);
    }
});

// // Delete user by ID
router.delete("/users/me", auth, async (req, res) => {
    try {
        // The user is attached to the request through auth so we have access to the _id
        // const user = await User.findByIdAndDelete(req.user._id);
        // if (!user) return res.status(404).send();
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

// const upload = multer({
//     dest: "avatars"
// });
// router.post("/users/me/avatar", upload.single("avatar"), (req, res) => {
//     res.send();
// });

const upload = multer({
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error(`Only JPG, JPEG and PNG files are allowed`));
        }
        return cb(undefined, true);
    }
});

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatars = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});

router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatars = undefined;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatars) throw new Error();
        res.set("Content-Type", "image/png");
        res.send(user.avatars);

    } catch (e) {
        res.status(404).send();
    }
});

// app.post("/users", (req, res) => {
//     const user = new User(req.body);
//
//     user.save()
//         .then(() => res.status(201).send(user))
//         .catch(e => res.status(400).send(e));
// });

module.exports = router;
