import React, { useState, useContext, useEffect } from 'react'
import './Chatbox.css'
import assets from '../../assets/assets.js'
import { AppContext } from '../../context/AppContext.jsx';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { toast } from 'react-toastify';
import upload from '../../lib/upload.js';

const ChatBox = () => {

  const { userData, messages, messeagesId, chatUser, setMessages , chatVisible, setChatVisible } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messeagesId) {
        await updateDoc(doc(db, 'messages', messeagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date()
          })
        })
        const userIds = [chatUser.rId, userData.id];
        userIds.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messeagesId);
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData
            })
          }
        })
      }
    } catch (error) {
      toast.error(error.message)
    }
    setInput("")
  }

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messeagesId) {
        await updateDoc(doc(db, 'messages', messeagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date()
          })
        })
        const userIds = [chatUser.rId, userData.id];
        userIds.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messeagesId);
            userChatData.chatsData[chatIndex].lastMessage = "Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData
            })
          }
        })
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const covertTimeStamp = (timeStamp) => {
    let date = timeStamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minute + "PM";
    }
    else {
      return hour + ":" + minute + "AM";
    }
  }

  useEffect(() => {
    if (messeagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messeagesId), (res) => {
        setMessages(res.data().messages.reverse())
      })
      return () => {
        unSub();
      }
    }
  }, [messeagesId])

  return chatUser ? (
    <div className={`chat-box ${chatVisible?"":"hidden"}`}>

      <div className="chat-user">
      <img onClick={() => setChatVisible(false)} src={assets.arrow_icon} className='arrow' alt="" />
        <img className='img2' src={chatUser.userData.avatar} alt="" />
        <p>{chatUser.userData.name}{Date.now() - chatUser.userData.lastSeen <= 50000 ? <img className='dot' src={assets.green_dot} alt="" /> : null}</p>
        <img src={assets.help_icon} alt="" />  
      </div>

      <div className="chat-msg">

        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg["image"]
              ? <img className='msg-img' src={msg.image} alt="" />
              : <p className={msg.sId === userData.id ? "msg" : "msg2"}>{msg.text}</p>
            }
            <div>
              <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
              <p>{covertTimeStamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}

        {/* <div className="s-msg">
          <img className='msg-img' src={assets.pic1} alt="" />
          <div>
            <img src={assets.profile_img} alt="" />
            <p>2:30 PM</p>
          </div>
        </div>

        <div className="r-msg">
          <p className='msg'>hello , hi this is me one two ka four ..... used in</p>
          <div>
            <img src={assets.profile_img} alt="" />
            <p>2:30 PM</p>
          </div>
        </div> */}

      </div>

      <div className="chat-input">
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Send a message' />
        <input onChange={sendImage} type="file" id='image' accept='image/png, image/jpeg, image/jpg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  )
    : <div className={`chat-welcome ${chatVisible?"":"hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime , anywhere</p>
    </div>
}

export default ChatBox