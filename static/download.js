
let rofl
async function download() {
  let hash = location.pathname.split('/')[2]
  let response = await fetch(`/_download/${hash}`)
  let arrayBuffer = await response.arrayBuffer()
  let data = new Uint8Array(arrayBuffer)
  const priveos = await get_priveos()
  let full_hash =  eosjs_ecc.sha256(data)
  console.log(`hash: ${full_hash}`)
  let txid = await priveos.accessgrant(app.account.name, full_hash)
  let key = await priveos.read(app.account.name, full_hash, txid)
  console.log("got key: ", key)
  const decrypted = Priveos.encryption.decrypt(data, key)
  createFile(decrypted, "file.pdf")
}

function createFile(data, filename) {
    var file = new Blob([data]);
    if (window.navigator.msSaveOrOpenBlob){
        window.navigator.msSaveOrOpenBlob(file, filename);
    } else {
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}