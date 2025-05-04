const spotify_client_id = process.env.SPOTIFY_CLIENT_ID
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET
const axios = require('axios');
const crypto = require('crypto');

const redirectUri = "https://spotify-quiz-mhri.onrender.com";
// const redirectUri = "http://localhost:3000/";

// Creating expiration Time
Date.prototype.addHours = function(h){
    this.setHours(this.getHours()+h);
    return this;
};


const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes).map(byte => possible[byte % possible.length]).join('');
};
const sha256 = (plain) => {
    return crypto.createHash('sha256')
                 .update(plain)
                 .digest(); // Returns a Buffer containing the hash
  };
  const base64encode = (buffer) => {
    return buffer.toString('base64') // Base64 encode
                  .replace(/\+/g, '-') // Replace '+' with '-'
                  .replace(/\//g, '_') // Replace '/' with '_'
                  .replace(/=+$/, ''); // Remove '=' padding
  };
const codeVerifier  = generateRandomString(64);
const getAuthUrl = async(req, res)=>{
    const scope = "streaming user-read-email user-read-private";
    const state = generateRandomString(16);
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed);

    const auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
        state: state
    })
    res.json('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
};

const getToken = async(req, res)=>{
    var code = req.query.code;
    const formData = `client_id=${spotify_client_id}&code_verifier=${codeVerifier}&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code`;
    var authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: formData,
        headers: {
        'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
        'Content-Type' : 'application/x-www-form-urlencoded'
        },
        json: true
    };
    const spotifyRes = await axios(authOptions);
    const expirationTime = new Date().addHours(1);
    res.json({...spotifyRes.data,expirationTime});
};

const refreshToken = async (req, res)=> {
    const {refreshToken} = req.query;
    const formData = `grant_type=${encodeURIComponent('refresh_token')}&refresh_token=${encodeURIComponent(refreshToken)}`;
    const authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers:{
            'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        data: formData,
        json: true
    };
    const spotifyRes = await axios(authOptions);
    const expirationTime = new Date().addHours(1);
    if(spotifyRes.data.refresh_token){
        res.json({...spotifyRes.data,expirationTime});
        return
    } else {
        res.json({...spotifyRes.data,expirationTime, refresh_token:refreshToken});
        return
    };
};


module.exports = {
    getAuthUrl,
    getToken,
    refreshToken
};