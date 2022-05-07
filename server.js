const express = require('express')
const mongoose = require('mongoose')

const dotenv = require('dotenv')

const ShortUrl = require('./models/ShortUrl')


// Load environment information
dotenv.config()

// Connect to mongoose database
mongoose.connect(process.env.MONGOOSE_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })


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
        title: process.env.TITLE || "URL-Shortener",
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
app.listen(process.env.PORT || 5050)
