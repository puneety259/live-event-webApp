const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // Added missing import
const cors = require('cors');
const cookieParser = require('cookie-parser');


// Import the User model (make sure the path is correct)
const User = require('./models/user');
const userRouter = require('./routes/user')
const eventRouter = require('./routes/eventRoute')
// Import your existing admin routes and controllers
const adminRouter = require('./routes/adminRoute');

const app = express();
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log('HTTP Method: ' + req.method + ' URL: ' + req.url);
    next();
});

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());

// Configure the Local Strategy
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });

            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }

            // Replace this with your actual password comparison logic
            if (password !== user.password) {
                return done(null, false, { message: 'Incorrect password.' });
            }
    
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Use the routes
app.use('/users', userRouter);
app.use('/events', eventRouter);

// Use your admin routes
app.use('/admin', adminRouter);

app.get('/', (req, res) => {
    res.send('hello');
});

let port = 3000;

mongoose.connect('mongodb+srv://realpuneet:ronaldinho10@cluster0.zhrgsdp.mongodb.net/live-web-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        app.listen(port, () => {
            console.log(`Listening on port: ${port}`);
        });
    })
    .catch((err) => {
        console.error(err);
    });
