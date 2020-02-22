const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema({
    avatars: {
      type: Buffer
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error("Email is invalid");
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error("Age must be a positive number");
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes("password")) throw new Error(`Please don't use "password"`);
        },
        trim: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

userSchema.virtual("tasks", {
    ref: "Task",
    // localField uses the users ._id to create a relationship with Task owner field
    localField: "_id",
    foreignField: "owner"
});

// Express behind the scenes stringify's an object and when the object gets stringified it calls toJSON
// toJSON allows us to manipulate the data
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatars;

    return userObject;
};

// userSchema.methods.getPublicProfile = function () {
//     const user = this;
//     const userObject = user.toObject();
//
//     delete userObject.password;
//     delete userObject.tokens;
//
//     return userObject;
// };

// Function used to generate a JSON WEB TOKEN
// Methods is mainly used on an instance in this case a specific user
userSchema.methods.generateAuthToken = async function () {
    // This refers to the specific user
    const user = this;
    // Convert the users id into a string
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);
    // Adds the tokens to the tokens array
    user.tokens = user.tokens.concat({token});
    await user.save();

    return token;
};

// Creates method that allows us to validate login info
// Static methods is mainly accessible in our models USER
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if (!user) throw new Error("Unable to login");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Unable to login");

    return user;
};

// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Delete user tasks when user is removed (middleware)
userSchema.pre("remove", async function (next) {
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
