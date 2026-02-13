import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Result.css";
import { supabase } from "../../SupabaseClient";

// Cache utility to reduce API calls
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiter utility
class RateLimiter {
    constructor(maxRequestsPerMinute = 20) {
        this.maxRequests = maxRequestsPerMinute;
        this.requests = [];
    }

    async waitForSlot() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Clean up old requests
        this.requests = this.requests.filter(time => time > oneMinuteAgo);
        
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = this.requests[0];
            const waitTime = 60000 - (now - oldestRequest);
            console.log(`Rate limit approaching. Waiting ${Math.ceil(waitTime/1000)}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.requests.push(Date.now());
    }
}

const rateLimiter = new RateLimiter(15); // 15 requests per minute (conservative)

const Result = () => {
    const { search } = useParams();
    const navigate = useNavigate();
    const api = "d5VnR35GRJThBRD9ESv1uCpx";
    
    // State management
    const [isDark, setIsDark] = useState(false);
    const [searchTopic, setSearchTopic] = useState(`"${search || 'monochrome ui'}"`);
    const [resultCount, setResultCount] = useState('0');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videos, setVideos] = useState([]);
    const [lines, setLines] = useState("");
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    
    const coverRef = useRef(null);
    const themeBtnRef = useRef(null);

    // Fetch with exponential backoff
    const fetchWithRetry = useCallback(async (searchQuery, retries = 3) => {
        const cacheKey = searchQuery;
        const cached = cache.get(cacheKey);
        
        // Return cached data if valid
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log("Returning cached data for:", searchQuery);
            return cached.data;
        }

        for (let i = 0; i < retries; i++) {
            try {
                // Wait for rate limiter slot
                await rateLimiter.waitForSlot();
                
                const response = await axios.get(`https://www.searchapi.io/api/v1/search`, {
                    params: {
                        api_key: api,
                        engine: 'google',
                        q: searchQuery
                    },
                    timeout: 10000 // 10 second timeout
                });
                
                // Cache the response
                cache.set(cacheKey, {
                    data: response.data,
                    timestamp: Date.now()
                });
                
                return response.data;
            } catch (err) {
                if (err.response?.status === 429 && i < retries - 1) {
                    // Get retry time from header or use exponential backoff
                    const retryAfter = err.response.headers['retry-after'] 
                        ? parseInt(err.response.headers['retry-after']) * 1000 
                        : Math.pow(2, i) * 2000; // Exponential: 2s, 4s, 8s
                    
                    console.log(`Rate limited. Retry ${i + 1}/${retries - 1} in ${retryAfter/1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter));
                    continue;
                }
                throw err;
            }
        }
        throw new Error("Max retries exceeded");
    }, [api]);

    // Fetch data from API
    useEffect(() => {
        let isMounted = true;

        const getData = async () => {
            if (!search) return;
            
            try {
                setLoading(true);
                setError(null);
                
                const data = await fetchWithRetry(search);
                
                if (!isMounted) return;
                
                console.log("API Response:", data);
                
                // Safely set videos
                setVideos(data.inline_videos || []);
                
                // Safely set AI overview
                if (data.ai_overview?.text_blocks?.[0]?.answer) {
                    setLines(data.ai_overview.text_blocks[0].answer);
                }
                
                // Safely set results
                const organicResults = data.organic_results || [];
                setResults(organicResults);
                setResultCount(organicResults.length.toString());
                
                setLoading(false);
            } catch (err) {
                if (!isMounted) return;
                
                console.error(`Error fetching data:`, err);
                
                if (err.response?.status === 429) {
                    setError("Too many requests. Please wait a moment and try again.");
                } else if (err.code === 'ECONNABORTED') {
                    setError("Request timed out. Please check your connection.");
                } else {
                    setError(err.message || "Failed to fetch results");
                }
                
                setLoading(false);
            }
        };

        getData();
        
        return () => {
            isMounted = false;
        };
    }, [search, fetchWithRetry]);

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
            window.open(video.link, '_blank', 'noopener,noreferrer');
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

    // Show error state
    if (error) {
        return (
            <div className={`full-cover ${isDark ? 'theme-dark' : 'theme-light'}`} style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div style={{ textAlign: 'center', maxWidth: '500px', padding: '2rem' }}>
                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#ff6b6b', marginBottom: '1rem' }}></i>
                    <h2>Error Loading Results</h2>
                    <p style={{ marginTop: '1rem', opacity: 0.8 }}>{error}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <button 
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '0.8rem 2rem',
                                borderRadius: '30px',
                                border: '1px solid currentColor',
                                background: 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                        <button 
                            onClick={back}
                            style={{
                                padding: '0.8rem 2rem',
                                borderRadius: '30px',
                                border: '1px solid currentColor',
                                background: 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            Go Back
                        </button>
                    </div>
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
                            <button className="top-btn" id="themeToggleBtn" ref={themeBtnRef} onClick={toggleTheme}>
                                <i className="fas fa-adjust"></i>
                                <span>black & white</span>
                            </button>
                            <button className="top-btn" id="backBtn" onClick={back}>
                                <i className="fas fa-arrow-left"></i>
                                <span>back to Search</span>
                            </button>
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

                    {/* ANSWER PARAGRAPH */}
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
                            <p style={{ fontSize: '1rem', lineHeight: '1.7', opacity: 0.9, margin: 0 }}>
                                {lines}
                            </p>
                        </div>
                    )}

                    {/* VIDEO CONTAINERS */}
                    {videos && videos.length > 0 && (
                        <div className="video-section" style={{ marginBottom: '2.5rem', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                                <i className="fas fa-video" style={{ fontSize: '1.3rem' }}></i>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Video Resources</h3>
                            </div>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {videos.slice(0, 3).map((video, index) => (
                                    <div key={index} className="video-card glass-panel" style={{
                                        padding: '1.2rem',
                                        borderRadius: '20px',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(128,128,128,0.2)'
                                    }} onClick={() => handleVideoClick(video)}>
                                        <div style={{
                                            width: '100%',
                                            height: '160px',
                                            backgroundImage: video.image ? `url(${video.image})` : 'linear-gradient(145deg, #2a2a2a, #3a3a3a)',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            borderRadius: '12px',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '3rem',
                                            color: '#fff'
                                        }}>
                                            <i className="fas fa-play-circle"></i>
                                        </div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                                            {video.title || 'Video Title'}
                                        </h4>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                            {video.source || 'YouTube'} · {video.length || '10'} min
                                        </p>
                                    </div>
                                ))}
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
                                        onClick={(e) => handleResultClick(e, result.link)}
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