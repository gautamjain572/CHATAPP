import React from 'react'
import './Chat.css'
import ChatBox from '../../Components/ChatBox/ChatBox'
import RightSidebar from '../../Components/RightSidebar/RightSidebar'
import LeftSidebar from '../../Components/LeftSidebar/LeftSidebar'

const Chat = () => {
  return (
    <div className='chat'>
      <div className="chat-container">
        <LeftSidebar />
        <ChatBox />
        <RightSidebar />
      </div>
    </div>
  )
}

export default Chat