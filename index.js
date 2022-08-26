const fs = require('fs');
const express = require("express")
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const qrimg = require('qr-image');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
app.set('view engine', 'ejs');

app.use(cors({
    origin: ['http://hofficelocal','https://hofficedemo4.ondemandcrm.co'],
    methods: ["GET", "POST"],
    allowedHeaders: ['*']
}));

const client = new Client();
const server = "@c.us"

let status = "not ready"

client.on('qr', qr => {
    //  qrcode.generate(qr, {small: true});
    fs.writeFileSync('qr.txt', qr)

});

client.on('ready', () => {
    console.log('Client is ready!');
    status = "ready"
});
client.on('disconnected', (reason) => {
    // Destroy and reinitialize the client when disconnected
    client.destroy();
    client.initialize();
  });
// client.on('message', message => {
//     console.log(message);
// });


client.initialize();

app.get('/', (req, res) => {
    let file = fs.readFileSync('qr.txt')
    var qr_svg = qrimg.image(file.toString(), { type: 'svg', size: '100px' });
    qr_svg.pipe(require('fs').createWriteStream('barcode.svg'));
    var svg_string = qrimg.imageSync(file.toString(), { type: 'svg' });
    res.render('barcode', { qr: svg_string, status: status })
})

app.post('/send', cors(), async (req, res) => {
    let num = req.query.num;
    let msg = req.query.msg //encode url
    if (msg) {
        client.sendMessage(num + server, msg)
        res.send("message sent")
    } else {
        res.send("message cannot be send")
    }

})

app.post('/media', async (req, res) => {
    let num = req.query.num;
    let url = req.query.url //encode url
    let captions = req.query.captions //encode url
    const media = await MessageMedia.fromUrl(url);
    if (media) {
        if (captions) {
            client.sendMessage(num + server, media, { caption: captions })
        } else {
            client.sendMessage(num + server, media)
        }

        res.send("message sent")
    } else {
        res.send("message cannot be send")
    }

})

app.get('/end', (req, res) => {

    client.logout();
    // res.send("logout")
    status = "not ready"
    res.redirect('/')
})

app.listen(port,()=>{ console.log("listening on"+port) })

