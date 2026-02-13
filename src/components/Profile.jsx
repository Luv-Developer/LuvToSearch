import React from "react"
import { useState , useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../SupabaseClient"

const Profile = () => {
    const navigate = useNavigate()
    const [email,setemail] = useState("")
    const [username,setusername] = useState("")
    const [picture,setpicture] = useState("")

    const SignOut = async() => {
        await supabase.auth.signOut()
        navigate("/")
    }

    const Search = () => {
        navigate("/search")
    }


    useEffect(()=>{
        const checkSession = async() => {
            let {data: {session} } = await supabase.auth.getSession()
            if(!session){
                navigate("/")
            }
            if(session?.user?.email){
                setemail(session.user.email)
            }
            if(session?.user?.user_metadata?.name){
                setusername(session.user.user_metadata.name)
            }
            if(session?.user?.user_metadata?.picture){
                setpicture(session?.user?.user_metadata?.picture)
            }
        }
        checkSession()
    })

    return(
        <>
        <img src = {picture} alt="profilepic"/>
        <h1>Welcome {username}</h1>
        <h3>Email is {email}</h3>
        <button onClick={SignOut}>Sign Out</button>
        <button onClick={Search}>Lets Search</button>
        </>
    )
}

export default Profile