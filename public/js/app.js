String.prototype.hexEncodeUTF8 = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += hex;
    }

    return result
}

String.prototype.hexDecodeUTF8 = function(){
    var j;
    var hexes = this.match(/.{1,2}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

String.prototype.hexEncodeUTF32 = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

String.prototype.hexEncodeUTF32 = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

String.prototype.isHex = function() {
    for (const c of this.toString()) {
        if ("0123456789ABCDEFabcdef".indexOf(c) === -1) {
            return false;
        }
    }
    return true;
}

function getRandomHex(length) {
    var randomChars = 'abcdef0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

// simple solution to decrypt:
var JsonFormatter = {
    stringify: function(cipherParams) {
      // create json object with ciphertext
      var jsonObj = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };
      // optionally add iv or salt
      if (cipherParams.iv) {
        jsonObj.iv = cipherParams.iv.toString();
      }
      if (cipherParams.salt) {
        jsonObj.s = cipherParams.salt.toString();
      }
      // stringify json object
      return JSON.stringify(jsonObj);
    },
    parse: function(jsonStr) {
      // parse json string
      var jsonObj = JSON.parse(jsonStr);
      // extract ciphertext from json object, and create cipher params object
      var cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
      });
      // optionally extract iv or salt
      if (jsonObj.iv) {
        cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
      }
      if (jsonObj.s) {
        cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
      }
      return cipherParams;
    }
};


const ctext = document.querySelector('#ctext');
const cSecretKey = document.querySelector('#secret-key');
const cSecretKeyVerify = document.querySelector('#secret-key-verify');
const btnEncrypt = document.querySelector('#encrypt');
const btnDecrypt = document.querySelector('#decrypt');

const textToEncrypt = document.querySelector('#text-input-read');
const textSecretKey = document.querySelector('#text-secret-key-read');
const textBase64 = document.querySelector('#encrypted-base64');
const textHex = document.querySelector('#encrypted-hex');
// for creating qr code images
const qrcodeContainer = document.getElementById("qrcode");

const textIv = document.querySelector('#iv');
const textSalt = document.querySelector('#salt');
const textSecretKeyUsed = document.querySelector('#secret-key-used');


btnEncrypt.addEventListener('click', function(event){
    event.preventDefault();
    // console.log('btnEncrypt clicked!');
    
    var ciphertext = ctext.value.trim();
    // print read text for user to check
    textToEncrypt.value = ciphertext;

    var secretKey = cSecretKey.value.trim();
    var secretKeyVerify = cSecretKeyVerify.value.trim();

    if(secretKey !== secretKeyVerify){
        alert('Secret Key invalid, make sure both values are the same!');
    }else{    
        // print read secret key for user to check
        textSecretKey.value = secretKey;

        var encrypted = CryptoJS.AES.encrypt(ciphertext, secretKey);
        textBase64.value = encrypted;
        textHex.value = encrypted.toString().hexEncodeUTF8();
        qrcodeContainer.innerHTML = "";
        new QRious({
          element: qrcodeContainer,
          size:448,
          value: textHex.value
        });
        document.getElementById("qrcode-container").style.display = "block";
        // Infos:
        textIv.innerHTML = `Initial Vector (IV): ${encrypted.iv}`;
        textSalt.innerHTML = `Salt: ${encrypted.salt}`;
        textSecretKeyUsed.innerHTML = `Secret Key Used: ${encrypted.key}`;
    }
});

btnDecrypt.addEventListener('click', function(event){
    event.preventDefault();
    // console.log('btnDecrypt clicked!');
    var ciphertext = ctext.value.trim();
    // print read text for user to check
    textToEncrypt.value = ciphertext;

    var secretKey = cSecretKey.value.trim();
    var secretKeyVerify = cSecretKeyVerify.value.trim();

    if(secretKey !== secretKeyVerify){
        alert('Secret Key invalid, make sure both values are the same!');
    }else{    
        // print read secret key for user to check
        textSecretKey.value = secretKey;

        var decrypted = CryptoJS.AES.decrypt( 
            ciphertext.isHex() ? ciphertext.hexDecodeUTF8() : ciphertext, 
            secretKey
        );
        
        try {
            ctext.value = `${decrypted.toString(CryptoJS.enc.Utf8)}\n`;
        
        }catch(err){
            alert(err);
        }
    }
});
