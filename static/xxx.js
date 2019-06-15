

const network = {
    blockchain:'eos',
    protocol:'http',
    host:'127.0.0.1',
    port: 8888,
    chainId:'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
}

function get_upload_data() {
  return new Promise((resolve, reject) => {
    let file = document.querySelector('input[type=file]').files[0]
    let reader = new FileReader()
    reader.addEventListener('load', () => {
      let buffer = new Uint8Array(reader.result)
      return resolve({file, buffer})
    })
    reader.readAsArrayBuffer(file)
  })
}

async function login() {
  ScatterJS.plugins( new ScatterEOS() )  
  const connected = await ScatterJS.scatter.connect('priveosend')
  if(!connected) {
    throw "Connection to Scatter failed"
  }
  scatter = ScatterJS.scatter
  const requiredFields = { accounts:[network] }
  await scatter.getIdentity(requiredFields)
  const account = scatter.identity.accounts.find(x => x.blockchain === 'eos')
  app.account = account
  console.log("Scatter account: ", account)
  const eosOptions = { expireInSeconds:60 }
  eos = scatter.eos(network, Eos, eosOptions)
}

async function logout() {
  scatter.logout()
}

let angelo
async function do_upload() {
  let { buffer, file } = await get_upload_data()
  let key = Priveos.encryption.generateKey()
  let encrypted = Priveos.encryption.encrypt(buffer, key)
  console.log("encrypted: ", encrypted)
  
  
  let priveos = await get_priveos()
  let hash = eosjs_ecc.sha256(encrypted)
  console.log("hash of encrypted file: ", hash)
  let actions = [{
    account: priveos.config.dappContract,
    name: 'upload',
    authorization: [{
      actor: app.account.name,
      permission: 'active',
    }],
    data: {
      sender: app.account.name,
      filename: file.name,
      hash,
      mime: file.type,
    }
  }]
  await priveos.store(app.account.name, hash, key, {actions})
  let encrypted_file = new Blob([encrypted])
  let formData = new FormData()
  formData.append("upload", encrypted_file, hash)
  let response = await fetch('/upload', {
    method: 'POST',
    body: formData,
  })
  let json = await response.json()
  console.log("json response: ", json)
  let { b58 } = json
  
  app.link = `http://localhost:54321/download/${b58}`
  $('#exampleModalCenter').modal()
}

async function get_priveos() {
  let ephemeralKeyPrivate = await eosjs_ecc.randomKey()
  let ephemeralKeyPublic = eosjs_ecc.privateToPublic(ephemeralKeyPrivate)
  let config = {
    dappContract: 'priveosend12',
    priveosContract: 'priveosrules',
    httpEndpoint: "http://127.0.0.1:8888",
    chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
    brokerUrl: 'http://127.0.0.1:4401',
    contractpays: true,
    ephemeralKeyPrivate,
    ephemeralKeyPublic,
    eos,
  }
  let priveos = new Priveos(config)
  return priveos
}

