import React from "react"
import { useState,useEffect, useRef } from "react"
import { supabase } from "../../SupabaseClient"
import { data, useNavigate } from "react-router-dom"
import "./Search.css"

const Search = () => {
    const navigate = useNavigate()
    const [search,setsearch] = useState("")
    const [picture,setpicture] = useState("")
    const [email,setemail] = useState("")

    useEffect(()=>{
        const checkSession = async() => {
            let {data: {session} } = await supabase.auth.getSession()
            if(session?.user?.user_metadata?.picture){
                setpicture(session.user.user_metadata.picture)
            }
            if(session?.user?.email){
                setemail(session.user.email)
            }
        }
        checkSession()
    })

    const signOut = async() => {
        await supabase.auth.signOut()
        navigate("/")
    }
    
    
    const getData = () => {
        navigate(`/result/${search}`)
    }




  const [isDark, setIsDark] = useState(false);
  const [placeholder, setPlaceholder] = useState('✨ minimal architecture');
  const [hintText, setHintText] = useState('today: "brutalist ui"');
  const [userEmail, setUserEmail] = useState('ray.aesthetic@luv.co');
  const [avatar, setAvatar] = useState('🌿');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [link,setlink] = useState([])
  
  const coverRef = useRef(null);
  const themeBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  const profilePhotoRef = useRef(null);

  const placeholderPool = [
    "◽ brutalist web design",
    "◾ how to focus deeply",
    "▫️ monochrome palette",
    "▪️ minimal portfolio 2026",
    "◽ japanese aesthetics",
    "◾ user interview tips",
    "▫️ lofi work music",
    "▪️ search with intention",
    "◽ black & white ui",
    "◾ meaning of silence"
  ];

  // Toggle theme
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Toggle dropdown
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  // Handle sign out
  const handleSignOut = () => {
    alert('◾ you signed out · (demo) — LuvToSearch awaits');
    setDropdownOpen(false);
    setAvatar('👤');
    setUserEmail('guest@luv.co');
  };

  // Random placeholder
  const setRandomPlaceholder = () => {
    const rand = Math.floor(Math.random() * placeholderPool.length);
    const phrase = placeholderPool[rand];
    setPlaceholder(phrase);
    const clean = phrase.replace(/[◽◾▫️▪️]/g, '').trim();
    setHintText(`today: "${clean}"`);
  };

  // Handle search
  const handleSearch = () => {
    const input = document.getElementById('searchInput');
    const query = input?.value.trim() || placeholder;
    alert(`🖤 searching for "${query}" — aesthetic results (demo)`);
  };

  // Handle web app click
  const handleWebAppClick = (app, e) => {
    e.preventDefault();
        if(app == "DreamCanvas"){
      window.location.href = "https://dreamcanvas.fun/"
    }
    if(app == "Mindful"){
      window.location.href = "https://www.mindful.org/what-is-mindfulness/"
    }    
    if(app == "VizLab"){
      window.location.href = "https://vizlab.in/"
    }
    if(app == "Lofi.cafe"){
      window.location.href = "https://www.lofi.cafe/"
    }
    if(app == "PixaPlay"){
      window.location.href = "https://pixabay.com/"
    }
    if(app == "Botanic"){
      window.location.href = "https://www.botanichealthcare.net/"
    }
    if(app == "Bettercv"){
      window.location.href = "https://bettercv.com/lp/cv-maker?utm_source=bing&utm_medium=cpc&utm_campaign=487423822&utm_term=read.cv&utm_content=1235852406697898&utm_network=o&msclkid=364b50de60211ba3b4203953b783b45a"
    }
    if(app == "Are.na"){
      window.location.href = "https://www.are.na/"
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) && 
          profilePhotoRef.current && 
          !profilePhotoRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Theme effect
  useEffect(() => {
    if (coverRef.current) {
      if (isDark) {
        coverRef.current.classList.remove('theme-light');
        coverRef.current.classList.add('theme-dark');
        if (themeBtnRef.current) {
          themeBtnRef.current.innerHTML = '<i class="fas fa-adjust"></i><span>light mode</span>';
        }
      } else {
        coverRef.current.classList.remove('theme-dark');
        coverRef.current.classList.add('theme-light');
        if (themeBtnRef.current) {
          themeBtnRef.current.innerHTML = '<i class="fas fa-adjust"></i><span>black & white</span>';
        }
      }
    }
  }, [isDark]);

  // Random placeholder interval
  useEffect(() => {
    setRandomPlaceholder();
    const interval = setInterval(setRandomPlaceholder, 3500);
    return () => clearInterval(interval);
  }, []);



    return(
        <>
    <div className={`full-cover ${isDark ? 'theme-dark' : 'theme-light'}`} id="coverRoot" ref={coverRef}>
      {/* Monochrome blobs */}
      <div className="blob-monochrome blob1"></div>
      <div className="blob-monochrome blob2"></div>
      <div className="blob-monochrome blob3"></div>

      <div className="content-wrap">
        {/* TOP BAR */}
        <div className="top-bar">
          <div className="logo-group">
            <i className="fas fa-heart brand-icon"></i>
            <span className="brand-name">Luv<span>ToSearch</span></span>
          </div>
          
          {/* FIXED: style prop with object, not string */}
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            {/* Theme Toggle Button */}
            <button className="theme-toggle-bw" id="themeToggleBtn" ref={themeBtnRef} onClick={toggleTheme}>
              <i className="fas fa-adjust"></i>
              <span>black & white</span>
            </button>

            {/* User Controls */}
            <div className="user-controls">
              <button className="signout-pill" id="topSignOutBtn" onClick={signOut}>
                <i className="fas fa-sign-out-alt"></i> Sign Out
              </button>
              
              {/* Profile Container */}
              <div className="profile-container" id="profileContainer">
                <div 
                  className="profile-photo" 
                  id="profilePhoto" 
                  ref={profilePhotoRef}
                  onClick={toggleDropdown}
                >
                  <img id = "profilepic" src = {picture}/>
                </div>
                
                {/* Dropdown Card */}
                <div 
                  className={`dropdown-card ${dropdownOpen ? 'show' : ''}`} 
                  id="profileDropdown" 
                  ref={dropdownRef}
                >
                  <div className="user-email">
                    {/* FIXED: style prop with object, not string */}
                    <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i> 
                    {email}
                  </div>
                  <button className="dropdown-signout" id="dropdownSignOutBtn" onClick={signOut}>
                    <i className="fas fa-sign-out-alt"></i> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HERO SEARCH SECTION */}
        <div className="hero-search">
          <div className="hero-title">
            <i className="fas fa-magnifying-glass"></i>
            <span>search in monochrome</span>
          </div>

          {/* Search Bar */}
          <div className="search-housing">
            <div className="input-group-love glass-card">
              <input value = {search}
              onChange={(e)=>{
                setsearch(e.target.value)
              }}
                type="text" 
                id="searchInput" 
                placeholder={placeholder} 
                defaultValue="" 
              />
              <button id="searchBtn" onClick={getData}>
                <i className="fas fa-arrow-right"></i> 
                <span>find</span>
              </button>
            </div>
          </div>

          {/* Placeholder Hint */}
          <div className="placeholder-hint" id="placeholderHint">
            <i className="fas fa-sparkles"></i>
            <span id="hintText">{hintText}</span>
          </div>
        </div>

        {/* WEB APPS GRID */}
        <div className="app-grid-section">
          <div className="section-header">
            <i className="fas fa-compass"></i>
            <span>creative web atlas</span>
          </div>
          
          <div className="grid-web" id="webAppGrid">
            {[
              'DreamCanvas', 'Mindful', 'VizLab', 'Lofi.cafe', 
              'PixaPlay', 'Are.na', 'Bettercv', 'Botanic'
            ].map((app, index) => {
              const icons = [
                'fa-palette', 'fa-cloud-moon', 'fa-chart-simple', 'fa-music',
                'fa-camera-retro', 'fa-link', 'fa-book-open', 'fa-leaf'
              ];
              return (
                <a 
                  href="#" 
                  className="web-card-mini" 
                  key={index}
                  data-app={app}
                  onClick={(e) => handleWebAppClick(app, e)}
                >
                  <i className={`fas ${icons[index]}`}></i> {app}
                </a>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer-lite">
          <span>🖤 LuvToSearch · monochrome drift</span>
          {/* FIXED: style prop with object, not string */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <i className="far fa-heart"></i> ask without echo
          </span>
        </div>
      </div>
    </div>
        </>
    )
}

export default Search