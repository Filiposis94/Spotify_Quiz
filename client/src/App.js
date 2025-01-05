import React from 'react';
import axios from 'axios';

import Menu from './Menu';
import Game from './Game';
import WebPlayback from './Weplayback';

function App() {
  const [authUrl, setAuthUrl] = React.useState('');
  const [token, setToken] = React.useState('');
  const [user, setUser] = React.useState({});
  const [screen, setScreen] = React.useState('menu');

  const [userPlaylists, setUserPlaylists] = React.useState([]);
  
  const handleNewGame= ()=>{
    setScreen('game');
  };
  const handleMenu = ()=>{
    setScreen('menu');
  };
  // Token GET SET STORAGE, REFRESH, GET USER INFO
  // Refresh token and set token
  const intervalRef = React.useRef(null);
  React.useEffect(()=>{
      async function refreshToken(){
        try {
          const res = await axios.get(`api/v1/auth/token-refresh?refreshToken=${token.refresh_token}`);
          setToken(res.data);
          console.log('token refreshed'); 
        } catch (error) {
          console.log(error);
        };
    };
    // Initializing token on first render from Local
    const token = JSON.parse(localStorage.getItem('token'));
    if(token){
      if(new Date(token.expirationTime) > new Date()){
        setToken(token);
      } else {
        refreshToken();
      };
    };
    // Autorefreshtoken after 1h
    intervalRef.current = setInterval(()=>{
      console.log('interval');
      refreshToken();
    },3600000)
   
    return ()=>{
      if(intervalRef.current){
          clearInterval(intervalRef.current);
          intervalRef.current = null;
      };
    };
  },[]);

  // GETTING INFO ABOUT USER and SAVING TOKEN to local
  React.useEffect(()=>{
    async function getUser(){
      try {
        if(token){
          const res = await axios.get(`/api/v1/data/user?token=${token.access_token}`);
          if(res.data){
            setUser(res.data);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };    
    localStorage.setItem('token', JSON.stringify(token));
    getUser();
  },[token]);
  // Getting users playlists
  React.useEffect(()=>{
    async function getUsersPlaylists(){
      try {     
        const res = await axios.get(`/api/v1/data/users-playlists?token=${token.access_token}&userId=${user.id}`);
        if(res.data){
          setUserPlaylists(res.data.playlistsInfo);
        };
      } catch (error) {
        console.log(error);
      };
    };
    if(user.id){    
      getUsersPlaylists();
    }
  },[user, token]);
  // AUTHORIZATION
  // Getting auth url
  React.useEffect(() => {
    async function getAuthUrl(){
      try {
        const res = await axios.get('/api/v1/auth/url');
        if(res.data){
          setAuthUrl(res.data);
        }
      } catch (error) {
        console.log(error);
      };
    };
    getAuthUrl();
  },[]);
  // Getting TOKEN and Setting TOKEN
  React.useEffect(()=>{
    async function sendCode(){
    if(window.location.href.indexOf('code')>0){
            try {
              const code = window.location.href.split('&')[0].split('=')[1]
              const response = await axios.get(`api/v1/auth/token?code=${code}`);
              setToken(response.data);
              window.location.replace('/');  
            } catch (error) {
              console.log(error);
            };
        };
    };
    sendCode();
},[])  

  // ELEMENTS
  let screenComponent;
  switch (screen){
    case 'menu': screenComponent = <Menu token={token} authUrl={authUrl} user={user} handleNewGame={handleNewGame}/>; 
    break;
    case  'game': screenComponent = <Game token={token} userPlaylists={userPlaylists} handleMenu={handleMenu}/>;
    break;
    default: screenComponent = "";
  };

  return (
    <div className='container'>
      {screenComponent}
      {token && <WebPlayback token={token.access_token} />}
    </div>
  );
};

export default App;
