import React from "react"

function Nav() {
    return(
    <div class = "header">
        <div class="Logo">
            <label>CueMEIn</label>
        </div>
        <div class="menu">
            <label class="menu-item">Username</label>
            <input class="menu-item" type="text"></input>
            <label class="menu-item">Password</label>
            <input class="menu-item" type="text"></input>
        </div>
    </div>
    )
}


export default Nav