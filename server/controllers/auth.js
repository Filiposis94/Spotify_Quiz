const spotify_client_id = process.env.SPOTIFY_CLIENT_ID
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET
const axios = require('axios');

// Creating expiration Time
Date.prototype.addHours = function(h){
    this.setHours(this.getHours()+h);
    return this;
};


const generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
const getAuthUrl = async(req, res)=>{
    var scope = "streaming user-read-email user-read-private";
    var state = generateRandomString(16);

    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: "https://spotify-quiz-mhri.onrender.com",
        state: state
    })
    res.json('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
};

const getToken = async(req, res)=>{
    var code = req.query.code;
    const formData = `code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent("https://spotify-quiz-mhri.onrender.com")}&grant_type=authorization_code`;
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