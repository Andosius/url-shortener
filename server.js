const express = require('express')
const mongoose = require('mongoose')

const ShortUrl = require('./models/ShortUrl')


// Connect to mongodb database and initialize other environment vars
const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB,
    TITLE,
    PORT
} = process.env;

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(url, options).then(function() {
    console.log('MongoDB successfully connected!')
}).catch(function(e) {
    console.log("Something went wrong!")
    console.log(e)
})


// Initialize Express
const app = express()

// Configure Express
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))


// Route: /
app.get('/', async (req, res) => {
    const data = await ShortUrl.find()

    res.render('index', {
        URLs: data,
        title: TITLE || "URL-Shortener",
        error: req.query.error,
        domain: req.hostname
    })
})


// Route: /create
app.post('/create', async (req, res) => {
    const full = req.body.fullUrl
    const short = req.body.shortUrl

    const data = await ShortUrl.findOne({ full: full, short: short })
    if(data != null) return res.redirect('/?error=used')

    await ShortUrl.create({ full: full, short: short })
    res.redirect('/')
})

app.get('/:url', async (req, res) => {
    const data = await ShortUrl.findOne({
        short: req.params.url
    })
    if(data == null) return res.redirect('/?error=unknown')

    data.clicks++
    data.save()

    res.redirect(data.full)
})


// Launch application
app.listen(PORT || 5050)
