const axios = require('axios');

const transferPlayback = async(req, res)=>{
    const deviceId = req.query.device;
    const token = req.query.token;
    
    const transferOptions = {
        method: 'put',
        url:'https://api.spotify.com/v1/me/player',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type' : 'application/json'
        },
        data: {
            device_ids: [deviceId]
        }
    }
    const resSpot = await axios(transferOptions);
    
    res.json({msg:'playback transfered'});
};
const startPlayback = async(req, res)=>{
    const {token, track, start} = req.query;
        
    const startOptions = {
        method: 'put',
        url:'https://api.spotify.com/v1/me/player/play',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type' : 'application/json'
        },
        data: {
            uris: [track],
            position_ms:start
        }
    }
    const resSpot = await axios(startOptions);

    res.json({msg:'playback started'});
}
const pausePlayback = async(req, res)=>{
    const {token} = req.query;
    
    const pauseOptions = {
        method: 'put',
        url:'https://api.spotify.com/v1/me/player/pause',
        headers: {
            'Authorization': 'Bearer ' + token
        },
    };

    const resSpot = await axios(pauseOptions);

    res.json({msg:'playback paused'});
}

module.exports = {
    transferPlayback,
    startPlayback,
    pausePlayback
};