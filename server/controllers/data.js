const axios = require('axios');

const getUser = async (req, res) =>{
    const token = req.query.token;
    const resSpot = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    });
    const {id, display_name} = resSpot.data;

    res.json({
        id:id,
        name:display_name
    });
}
const getUsersPlaylists = async (req, res) =>{
    const {token, userId} = req.query;
    const resSpot = await axios.get(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    });
    const playlists = resSpot.data.items;
    const playlistsInfo = playlists.map(playlist => {
        return {
            id:playlist.id,
            img: playlist.images[0].url,
            name: playlist.name
        };
    });
    res.json({playlistsInfo})
}
const getTracks = async (req, res) =>{
    const {token, playlistId} = req.query;
    let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=CZ`;
    let tracksInfo = [];

    do {
        const resSpot = await axios.get(url, {
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        });
        const tracks = resSpot.data.items;
        
        for(let i=0; i<tracks.length; i++){
            const trackName = tracks[i].track.name;
            const replacedStrings = [
                ' - Radio Edit',
                ' - Radio Version',
                ' - Edit',
                ' - Original Version',
                ' - Single Version',
                ' - Single Remix',
                ' - Special Mix',
                ' - Basic Radio',
                /(\s*-\s*.*?From.*$|\s*\(.*?From.*?\))/i,
                 /(\s*-\s*.*?Remaster.*$|\s*\(.*?Remaster.*?\))/i,
            ];
            let filteredTrackName = trackName
            for(let i=0; i<replacedStrings.length; i++){
                filteredTrackName = filteredTrackName.replace(replacedStrings[i],"");
            };
            if(tracks[i].track.is_playable){
                tracksInfo.push({
                    uri: tracks[i].track.uri,
                    artists: tracks[i].track.artists[0].name,
                    duration: tracks[i].track.duration_ms,
                    name:filteredTrackName
                });
            };
        };
        url = resSpot.data.next;
    } while (url)
    
    res.json({tracksInfo});
};

const getFeaturedPlaylists = async (req, res)=>{
    const {token} = req.query;
    
    const resSpot = await axios.get(`https://api.spotify.com/v1/browse/featured-playlists?limit=5`, {
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    });

    const playlists = resSpot.data.playlists.items;
    const playlistsInfo = playlists.map(playlist => {
        return {
            id:playlist.id,
            img: playlist.images[0].url,
            name: playlist.name
        }
    });
    res.json({playlistsInfo});

}

module.exports = {
    getUser,
    getUsersPlaylists,
    getTracks,
    getFeaturedPlaylists
};