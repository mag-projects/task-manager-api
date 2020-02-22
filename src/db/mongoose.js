const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

























// let letters = [];
//
// let word = "racecar";
//
// let rword = "";
//
// for (let i = 0; i < word.length; i++) {
//     letters.push(word[i]);
// }
//
// for (let i = 0; i < word.length; i++) {
//     rword += letters.pop();
// }
//
// if (word === rword) console.log(`${word} is a palindrome`);
// else console.log(`${word} is not a palindrome`);


























