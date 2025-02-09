import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WebPlayback(props) {
    const [player, setPlayer] = useState(undefined);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false); 
    
    const [deviceId, setDeviceId] = useState('');

    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
    
        document.body.appendChild(script);
    
        window.onSpotifyWebPlaybackSDKReady = () => {
    
            const player = new window.Spotify.Player({
                name: 'Web player Spotify Quiz',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });
            
            
            setPlayer(player);
    
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
            });
    
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });
                    
            player.addListener('player_state_changed', ( state => {

                if (!state) {
                    return;
                }
                setPaused(state.paused);
            
            
                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });
            
            }));
            
            
            player.connect();
            
        };

    }, [props.token]);
    // MOVE TO APP LEVEL MAYBE
    useEffect(()=>{
        if(deviceId){
            async function transferPlayback(){
                const res = await axios.get(`/api/v1/playback/transfer?device=${deviceId}&token=${props.token}`);
                console.log(res.data.msg);
            };
            
            transferPlayback();
        }
    },[deviceId, props.token])
 
    if (!is_active) { 
        return (
            <div className='webplayback webplayback-off'>
                Instance not active
            </div>                
            )
    } else {

        return (
         
            <div className='webplayback webplayback-on'>
                        Active      
                    <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                        &lt;&lt;
                    </button>

                    <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                        { is_paused ? "PLAY" : "PAUSE" }
                    </button>

                    <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                        &gt;&gt;
                    </button>
            </div>
       
    )    
}
    
    
}

export default WebPlayback