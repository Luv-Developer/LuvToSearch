import React from "react"
import {supabase} from "../../SupabaseClient"
import { useState,useEffect,useRef } from "react"
import "./Home.css"

const Home = () => {

    const SignIn = async() => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/search`,
        queryParams: {
          prompt: 'select_account', 
          response_mode: 'query',
        },
      },
    });
    }

 const [isDark, setIsDark] = useState(false);
  
  // State for answer and query
  const [answerText, setAnswerText] = useState('✨ choose a question from the left or explore web apps below.');
  const [queryPreview, setQueryPreview] = useState('waiting ...');
  
  // Refs for elements that need direct DOM access
  const coverRef = useRef(null);
  const themeBtnRef = useRef(null);
  const googleBtnRef = useRef(null);
  const answerTextRef = useRef(null);
  const queryPreviewRef = useRef(null);

  // Answer library
  const answerLibrary = [
    "LuvToSearch reflects: '{query}' — try the 'Are.na' web app for collecting ideas.",
    "for '{query}', the monochrome whispers: check 'Mindful' or a quiet notebook.",
    "you asked '{query}' — answer lies in constraints. explore VizLab or Read.cv.",
    "concerning '{query}': the web says 'less is infinite'. Botanic garden of code.",
    "ah, '{query}'. DreamCanvas might hold your answer. also: Lofi.cafe for focus.",
    "'{query}' — luv that. PixaPlay or minimalist museums. keep questioning.",
    "oracle: '{query}' resonates with glitch.com and superhi. wander further."
  ];

  // Generate answer based on question
  const generateAnswer = (question) => {
    if (!question || question.trim() === '') question = 'silence';
    let hash = 0;
    for (let i = 0; i < question.length; i++) {
      hash = ((hash << 5) - hash) + question.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const idx = absHash % answerLibrary.length;
    let answer = answerLibrary[idx].replace(/\{query\}/g, question);
    return answer + ' ✦';
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Handle question card click
  const handleQuestionClick = (question) => {
    setQueryPreview(question.length > 35 ? question.substring(0, 32) + '…' : question);
    const answer = generateAnswer(question);
    setAnswerText(`💬 LuvToSearch · ${answer}`);
  };

  // Handle web app card click
  const handleWebAppClick = (appName, e) => {
    e.preventDefault();
    setAnswerText(`🧭 launching · you visited ${appName}. (demo) — imagine full web app.`);
    if(appName == "DreamCanvas"){
      window.location.href = "https://dreamcanvas.fun/"
    }
    if(appName == "Mindful"){
      window.location.href = "https://www.mindful.org/what-is-mindfulness/"
    }    
    if(appName == "VizLab"){
      window.location.href = "https://vizlab.in/"
    }
    if(appName == "Lofi.cafe"){
      window.location.href = "https://www.lofi.cafe/"
    }
    if(appName == "PixaPlay"){
      window.location.href = "https://pixabay.com/"
    }
    if(appName == "Botanic"){
      window.location.href = "https://www.botanichealthcare.net/"
    }
    if(appName == "Bettercv"){
      window.location.href = "https://bettercv.com/lp/cv-maker?utm_source=bing&utm_medium=cpc&utm_campaign=487423822&utm_term=read.cv&utm_content=1235852406697898&utm_network=o&msclkid=364b50de60211ba3b4203953b783b45a"
    }
    if(appName == "Are.na"){
      window.location.href = "https://www.are.na/"
    }
  };

  // Effect for theme changes
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

  // Effect for initial load
  useEffect(() => {
    // Set first card answer on load
    const firstCardQuestion = document.querySelector('.card-question')?.getAttribute('data-question');
    if (firstCardQuestion) {
      setTimeout(() => {
        setQueryPreview(firstCardQuestion);
        setAnswerText(`💬 LuvToSearch · ${generateAnswer(firstCardQuestion)}`);
      }, 120);
    }
  }, []);

  return(
    <>
    <div className={`full-cover ${isDark ? 'theme-dark' : 'theme-light'}`} ref={coverRef} id="coverRoot">
      {/* TOP BAR with THEME TOGGLE + SIGN IN WITH GOOGLE */}
      <div className="top-bar">
        <div className="logo-area">
          <i className="fas fa-heart heart-icon"></i>
          <h1 className="app-name">Luv<span>ToSearch</span></h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* BLACK & WHITE THEME BUTTON */}
          <button 
            className="theme-toggle" 
            id="themeToggleBtn" 
            ref={themeBtnRef}
            onClick={toggleTheme}
          >
            <i className="fas fa-adjust"></i>
            <span>black & white</span>
          </button>
          
          {/* SIGN IN WITH GOOGLE */}
          <button 
            className="btn-google" 
            id="googleSignInBtn" 
            ref={googleBtnRef}
            onClick={SignIn}
          >
            <i className="fab fa-google"></i> 
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>

      {/* MAIN FULL SCREEN CONTENT */}
      <div className="main-grid">
        <div className="quest-remark">
          <i className="fas fa-infinity"></i>
          <span>ask with intention — receive clarity</span>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="functionality-dash">
          {/* LEFT: question cards */}
          <div className="question-bank">
            <div className="section-label">
              <i className="fas fa-message"></i>
              <span>what do you seek?</span>
            </div>
            <div className="card-grid" id="questionCardGrid">
              {/* Question Cards */}
              {[
                { icon: 'fa-feather', text: 'meaning of life', data: 'meaning of life' },
                { icon: 'fa-pencil', text: 'best creative tools', data: 'best creative tools 2026' },
                { icon: 'fa-brain', text: 'how to stay focused', data: 'how to stay focused' },
                { icon: 'fa-brush', text: 'minimalist web design', data: 'minimalist web design' },
                { icon: 'fa-robot', text: 'future of ai', data: 'future of ai' },
                { icon: 'fa-droplet', text: 'aesthetic palettes', data: 'aesthetic color palettes' }
              ].map((card, index) => (
                <div 
                  key={index}
                  className="card-question" 
                  data-question={card.data}
                  onClick={() => handleQuestionClick(card.data)}
                >
                  <i className={`fas ${card.icon}`}></i>
                  <span>{card.text}</span>
                </div>
              ))}
            </div>
            <p style={{ opacity: '0.7', marginTop: '0.6rem', fontStyle: 'italic' }}>
              <i className="fas fa-mouse-pointer"></i> tap a card — get answers
            </p>
          </div>

          {/* RIGHT: answer display + websites grid */}
          <div className="right-stack">
            {/* answer console */}
            <div className="answer-console glass-panel">
              <div className="mini-header">
                <i className="fas fa-sparkle"></i>
                <span>LuvToSearch · oracle</span>
              </div>
              <div id="answerText" ref={answerTextRef}>
                {answerText}
              </div>
              <div className="dynamic-query" id="queryPreview" ref={queryPreviewRef}>
                {queryPreview}
              </div>
            </div>

            {/* WEB APPLICATIONS GRID */}
            <div className="web-gateways">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '530' }}>
                <i className="fas fa-compass"></i>
                <span>web atlas · apps</span>
              </div>
              <div className="web-grid" id="webAppGrid">
                {[
                  { icon: 'fa-palette', name: 'DreamCanvas' },
                  { icon: 'fa-cloud-moon', name: 'Mindful' },
                  { icon: 'fa-chart-simple', name: 'VizLab' },
                  { icon: 'fa-music', name: 'Lofi.cafe' },
                  { icon: 'fa-camera-retro', name: 'PixaPlay' },
                  { icon: 'fa-leaf', name: 'Botanic' },
                  { icon: 'fa-book-open', name: 'BetterCv' },
                  { icon: 'fa-link', name: 'Are.na' }
                ].map((app, index) => (
                  <a 
                    href="#" 
                    key={index}
                    className="web-card" 
                    data-app={app.name}
                    onClick={(e) => handleWebAppClick(app.name, e)}
                  >
                    <i className={`fas ${app.icon}`}></i>
                    <span>{app.name}</span>
                  </a>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="cosmic-footer">
          <span>🖤 LuvToSearch · answer is a new question</span>
          <span><i className="far fa-heart"></i> ask without search bar</span>
        </div>
      </div>
    </div>
    </>
  )
}

export default Home