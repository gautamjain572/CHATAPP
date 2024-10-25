import React, { useContext, useEffect, useState } from 'react'
import './ProfileUpdate.css'
import assets from '../../assets/assets.js'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../lib/upload.js';
import { AppContext } from '../../context/AppContext.jsx';
// import {progress} from '../../lib/upload.js'

const ProfileUpdate = () => {

  const navigate = useNavigate();

  const [image,setImage] = useState(false);
  const [name,setName] = useState("");
  const [bio,setBio] = useState("");
  const [uid,setUid] = useState("");
  const [prevImage,setPrevImage] = useState("")
  const { setUserData } = useContext(AppContext)

  // const [loading,setLoading] = useState(true)

  const profileUpdate = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("Upload Profile Picture")
      }
      const docRef = doc(db,'users',uid);
      if (image) {
        const imgurl = await upload(image);
        setPrevImage(imgurl);
        await updateDoc(docRef,{
          avatar:imgurl,
          bio:bio,
          name:name
        })
      }
      else{
        await updateDoc(docRef,{
          bio:bio,
          name:name
        })
      }
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate('/chat')
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth,async (user) => {
      if (user) {
        setUid(user.uid)
        const docRef = doc(db,"users",user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.data().name) {
          setName(docSnap.data().name)
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio)
        }
        if (docSnap.data().avatar) {
          setPrevImage(docSnap.data().avatar)
        }
      }
      else{
        navigate('/')
      }
    })
  },[])

  

  // useEffect(() => {
  //   if (progress) {
  //     setLoading(false);
  //   }
  // },[progress])

  return (
    <div className='profile'>

      <div className="profile-container">

        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor='avatar'>
            <input onChange={(e) => setImage(e.target.files[0]) } type="file" id='avatar' accept='.png, .jpeg, .jpg' hidden/>
            <img src={image? URL.createObjectURL(image) : prevImage? prevImage : assets.avatar_icon} alt="" />
            Upload Profile image
          </label>
          <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='Your Name' required/>
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder='Write Profile bio' required></textarea>
          <button type='submit'>Save</button>
          {/* {loading 
          ? <p>{`Upload is ${progress}% done`}</p>
          : <p></p>
          } */}
        </form>

        <img className='profile-pic' src={image? URL.createObjectURL(image) : prevImage? prevImage : assets.logo_icon} alt="" />

      </div>

    </div>
  )
}

export default ProfileUpdate