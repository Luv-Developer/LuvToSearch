import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Result.css";
import { supabase } from "../../SupabaseClient";

const Result = () => {
    const { search } = useParams();
    const navigate = useNavigate();
    const api = "d5VnR35GRJThBRD9ESv1uCpx";
    
    // State management
    const [isDark, setIsDark] = useState(false);
    const [searchTopic, setSearchTopic] = useState(`"${search || 'monochrome ui'}"`);
    const [resultCount, setResultCount] = useState('128');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState("");
    const [videos, setVideos] = useState([]);
    const [lines, setLines] = useState("");
    
    const coverRef = useRef(null);
    const themeBtnRef = useRef(null);

    // Fetch data from API
    useEffect(() => {
        const getData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/v1/search?api_key=${api}&engine=google&q=${search}`);
                console.log(response.data);
                

                setVideos(response.data.inline_videos || []);
                
                if (response.data.ai_overview?.text_blocks?.[0]?.answer) {
                    setLines(response.data.ai_overview.text_blocks[0].answer);
                }
                
                // Safely set results
                setResults(response.data.organic_results || []);
                
                // Generate a summary answer based on search results
                if (response.data.organic_results && response.data.organic_results.length > 0) {
                    generateAnswerFromResults(response.data.organic_results);
                }
            
                setLoading(false);
            } catch (err) {
                console.log(`Error: ${err}`);
                setLoading(false);
            }
        };
        getData();
    }, [search]);

    // Generate answer from results
    const generateAnswerFromResults = (results) => {
        // This is a simplified version - in production, you might use an AI API
        const firstResult = results[0];
        const summary = `Based on your search for "${search}", we found that ${firstResult.snippet || firstResult.description || 'this topic has several interesting aspects'}. 
        According to ${firstResult.source || firstResult.link}, the key points include: ${firstResult.title}. 
        For more detailed information, explore the results below.`;
        setAnswer(summary);
    };

    const signOut = async() => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const back = () => {
        navigate("/search");
    };

    // Toggle theme
    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    // Handle result link click
    const handleResultClick = (e, url) => {
        e.preventDefault();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Handle video click with safety check
    const handleVideoClick = (video) => {
        if (video?.link) {
            window.location.href = video.link;
        }
    };

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

    // Update result count when results change
    useEffect(() => {
        if (results.length > 0) {
            setResultCount(results.length.toString());
        }
    }, [results]);

    // Show loading state
    if (loading) {
        return (
            <div className={`full-cover ${isDark ? 'theme-dark' : 'theme-light'}`} style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                    <p>Loading results for "{search}"...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`full-cover ${isDark ? 'theme-dark' : 'theme-light'}`} id="coverRoot" ref={coverRef}>
                <div className="blob blob-left"></div>
                <div className="blob blob-right"></div>
                <div className="blob blob-center"></div>

                <div className="content-wrap">
                    {/* TOP BAR */}
                    <div className="top-bar">
                        <div className="logo-area">
                            <i className="fas fa-heart brand-icon"></i>
                            <span className="brand-name">Luv<span>ToSearch</span></span>
                        </div>
                        <div className="button-group">
                            {/* 1. THEME BUTTON */}
                            <button className="top-btn" id="themeToggleBtn" ref={themeBtnRef} onClick={toggleTheme}>
                                <i className="fas fa-adjust"></i>
                                <span>black & white</span>
                            </button>
                            {/* 2. BACK BUTTON */}
                            <button className="top-btn" id="backBtn" onClick={back}>
                                <i className="fas fa-arrow-left"></i>
                                <span>back to Search</span>
                            </button>
                            {/* 3. SIGN OUT BUTTON */}
                            <button className="top-btn" id="signOutBtn" onClick={signOut}>
                                <i className="fas fa-sign-out-alt"></i>
                                <span>sign out</span>
                            </button>
                        </div>
                    </div>

                    {/* RESULTS HEADER */}
                    <div className="results-header">
                        <div className="searched-for">
                            <span>Searched for</span>
                            <span className="searched-topic" id="searchTopic">{searchTopic}</span>
                            <span className="result-stats" id="resultStats">· {resultCount} results</span>
                        </div>

                        <div style={{ marginTop: '0.4rem', opacity: 0.7, fontSize: '0.95rem' }}>
                            <i className="fas fa-sparkle" style={{ marginRight: '6px' }}></i> results crafted with intention
                        </div>
                    </div>

                    {/* ANSWER PARAGRAPH - Only show if lines exists */}
                    {lines && (
                        <div className="answer-section" style={{ 
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            borderRadius: '20px',
                            background: 'rgba(128,128,128,0.05)',
                            border: '1px solid rgba(128,128,128,0.2)',
                            backdropFilter: 'blur(8px)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                                <i className="fas fa-robot" style={{ fontSize: '1.3rem', opacity: 0.8 }}></i>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>AI Summary</h3>
                            </div>
                            <p style={{ 
                                fontSize: '1rem', 
                                lineHeight: '1.7',
                                opacity: 0.9,
                                margin: 0
                            }}>
                                {lines}
                            </p>
                        </div>
                    )}

                    {/* VIDEO CONTAINERS - Only show if videos exist */}
                    {videos && videos.length > 0 && (
                        <div className="video-section" style={{ 
                            marginBottom: '2.5rem',
                            width: '100%'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                marginBottom: '1.2rem' 
                            }}>
                                <i className="fas fa-video" style={{ fontSize: '1.3rem' }}></i>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Video Resources</h3>
                            </div>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {/* Video Card 1 - with safety check */}
                                {videos[0] && (
                                    <div className="video-card glass-panel" style={{
                                        padding: '1.2rem',
                                        borderRadius: '20px',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(128,128,128,0.2)'
                                    }} onClick={()=>{
                                        window.location.href = videos[0].link
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            height: '160px',
                                            backgroundImage: videos[0].image ? `url(${videos[0].image})` : 'linear-gradient(145deg, #2a2a2a, #3a3a3a)',
                                            borderRadius: '12px',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '3rem'
                                        }}>
                                            <i className="fas fa-play-circle"></i>
                                        </div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                                            {videos[0].title || 'Video Title'}
                                        </h4>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                            {videos[0].source || 'YouTube'} · {videos[0].length || '10'} min
                                        </p>
                                    </div>
                                )}

                                {/* Video Card 2 - with safety check */}
                                {videos[1] && (
                                    <div className="video-card glass-panel" style={{
                                        padding: '1.2rem',
                                        borderRadius: '20px',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(128,128,128,0.2)'
                                    }} onClick={()=>{
                                        window.location.href = videos[1].link
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            height: '160px',
                                            backgroundImage: videos[1].image ? `url(${videos[1].image})` : 'linear-gradient(145deg, #2a2a2a, #3a3a3a)',
                                            borderRadius: '12px',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: '3rem'
                                        }}>
                                            <i className="fas fa-play-circle"></i>
                                        </div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                                            {videos[1].title || 'Video Title'}
                                        </h4>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                            {'YouTube'} · {videos[1].length || '10'} min
                                        </p>
                                    </div>
                                )}

                                {/* Video Card 3 - with safety check */}
                                {videos[2] && (
                                    <div className="video-card glass-panel" style={{
                                        padding: '1.2rem',
                                        borderRadius: '20px',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(128,128,128,0.2)'
                                    }} onClick={()=>{
                                        window.location.href = videos[2].link
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            height: '160px',
                                            backgroundImage: videos[2].image ? `url(${videos[2].image})` : 'linear-gradient(145deg, #2a2a2a, #3a3a3a)',
                                            borderRadius: '12px',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: '3rem'
                                        }}>
                                            <i className="fas fa-play-circle"></i>
                                        </div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                                            {videos[2].title || 'Video Title'}
                                        </h4>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                            {'YouTube'} · {videos[2].length || '10'} min
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* RESULTS GRID */}
                    <div className="results-grid" id="resultsGrid">
                        {results.length > 0 ? (
                            results.map((result, index) => (
                                <div className="result-card glass-panel" key={result.id || index}>
                                    <a 
                                        className="result-link" 
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {result.title}
                                    </a>
                                    <div className="result-desc">
                                        {result.snippet}
                                    </div>
                                    <div className="result-meta">
                                        <i className="fas fa-link" style={{ marginRight: '5px' }}></i>
                                        <a href={result.link} target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px' }}>
                                            Visit
                                        </a>
                                        <i className="fas fa-globe" style={{ marginRight: '5px' }}></i>
                                        <span>{result.source || (result.link ? new URL(result.link).hostname : 'Unknown source')}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
                                <p>No results found for "{search}". Try a different search term.</p>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="footer">
                        <span>🖤 LuvToSearch · results are echoes</span>
                        <span><i className="far fa-heart"></i> refine your query</span>
                        <span><i className="fas fa-magnifying-glass"></i> {resultCount} results</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Result;