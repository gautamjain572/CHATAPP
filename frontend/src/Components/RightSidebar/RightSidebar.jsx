import React, { useContext, useEffect, useState } from 'react'
import './RightSidebar.css'
import assets from '../../assets/assets.js'
import { logout } from '../../config/firebase.js'
import { AppContext } from '../../context/AppContext.jsx'

const RightSidebar = () => {

  const { chatUser ,  messages } = useContext(AppContext);
  const [messageImages,setMessagesImages] = useState([]);

  useEffect(() => {
    let tempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        tempVar.push(msg.image)
      }
    })
    setMessagesImages(tempVar)
  },[messages])

  return chatUser ? (
    <div className='rs'>

      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
        <h3>{chatUser.userData.name}{Date.now() - chatUser.userData.lastSeen <= 50000 ? <img className='dot' src={assets.green_dot} alt="" /> : null}</h3>
        <p>{chatUser.userData.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {messageImages.map((url,index) => (<img onClick={() => window.open(url)} key={index} src={url} alt='' />))}
          {/* <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" />
          <img src={assets.pic4} alt="" />
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" /> */}
        </div>
      </div>
      
      <button onClick={() => logout()}>Logout</button>
      
    </div>
  ) : (
    <div className='rs'>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

export default RightSidebar