'use strict'
const restify = require('restify')
const fs = require("fs").promises
const formidable = require('formidable')
const util = require('util')
const path = require('path')
const assert = require('assert').strict
const Promise = require('bluebird')
const b58 = require('b58')
const eosjs_ecc = require('eosjs-ecc-priveos')
const upload_dir = './uploads'
const server = restify.createServer()
const bp = restify.plugins.bodyParser()

server.use(function(req, res, next) {
  res.once('header', function () {
    res.setHeader('Cache-Control', 'no-store')
  })
  next()
})

server.listen(54321, "127.0.0.1", function() {
  console.log(`priveosend ${server.name} listening at ${server.url}`)
	if(process.send) {
		process.send('ready')
	}
})

server.get('/', async function(req, res, next) {
  const data = await fs.readFile('./static/index.html')
  res.setHeader('Content-Type', 'text/html')
  res.writeHead(200)
  res.end(data)
  next()
})

server.post('/test', [bp, async function(req, res, next) {
    console.log(`body: ${util.inspect(req.body)}`)
}])

function formidablePromise (req, opts) {
  return new Promise(function (resolve, reject) {
    const form = new formidable.IncomingForm(opts)
    form.parse(req, function (err, fields, files) {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
}

server.get('/static/*', restify.plugins.serveStatic({
  directory: __dirname,
}));

server.post('/upload', async function(req, res, next) {  
	try { 
    const { fields, files } = await formidablePromise(req)
    console.log("file: ", util.inspect(files))
    /* We have received a file */
    const name = files.upload.name.substr(0, 32)
    assert.equal(name, path.normalize(name), `Suspicious filename "${name}"`)
    const dest_path = path.join(upload_dir, name)
    await fs.rename(files.upload.path, dest_path)
    
    const contents = await fs.readFile(dest_path)
    console.log("contents: ", contents)
    const hash2 = eosjs_ecc.sha256(contents)
    console.log("hash2: ", hash2)
    assert.equal(files.upload.name, hash2, "Hashes differ")
    
    res.json({b58: get_link(name)})
  } catch(err) {
		console.error("Error: ", err)
		res.send(500, "Generic Error")
	}
	next()
})

server.get('/download/:hash', async function(req, res, next) {  
  const data = await fs.readFile('./static/download.html')
  res.setHeader('Content-Type', 'text/html')
  res.writeHead(200)
  res.end(data)
  next()
})

server.get('/_download/:hash', async function(req, res, next) {  
  console.log(`hash: ${req.params.hash}`)
  const hex = b58.decode(req.params.hash).toString('hex')
  console.log("hex: ", hex)
  const file_path = path.join(upload_dir, hex)
  const data = await fs.readFile(file_path)
  res.setHeader('Content-Type', 'application/octet-stream')
  res.end(data)
  next()
})

function get_link(hex) {
  const buffer = Buffer.from(hex, 'hex')
  return b58.encode(buffer.slice(0, 16))
}
