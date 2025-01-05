import React from "react";

function Menu(props){
    return(
        <div>
            <h1>Spotify Quiz Game</h1>
            <p>Hello {props.user.name ? props.user.name : 'Stranger' }</p>
            {!props.token && <div>
                <a className="btn btn-main" href={props.authUrl}>Login to Spotify</a>
                <p>You need and account with premium.</p>
            </div>}
            {props.token && <button className="btn btn-main" onClick={props.handleNewGame}>New Game</button>}
        </div>
    );
};

export default Menu;