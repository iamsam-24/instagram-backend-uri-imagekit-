import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Search,
  Compass,
  MessageCircle,
  Heart,
  PlusSquare,
  User,
  MoreHorizontal,
  Bookmark,
  Send,
  Smile,
  UploadCloud,
  X,
  Grid,
  Tv,
  Bookmark as BookmarkIcon,
  UserCheck,
  Sparkles,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);


  const [postLikes, setPostLikes] = useState({});
  const [postComments, setPostComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});
  const [doubleClickedHeart, setDoubleClickedHeart] = useState({});


  const [suggestions, setSuggestions] = useState([
    { id: 1, username: 'cyber_traveler', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', relation: 'New to Instagram', following: false },
    { id: 2, username: 'neo_classicist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', relation: 'Followed by pixel_artisan', following: false },
    { id: 3, username: 'retro_coder', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', relation: 'Popular', following: false },
    { id: 4, username: 'solitude_seeker', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', relation: 'Follows you', following: false }
  ]);


  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/posts');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();


      const fetchedPosts = data.posts || [];
      setPosts(fetchedPosts);


      const initialLikes = { ...postLikes };
      const initialComments = { ...postComments };

      fetchedPosts.forEach(post => {
        if (!initialLikes[post._id]) {
          initialLikes[post._id] = {
            count: Math.floor(Math.random() * 450) + 12,
            liked: false
          };
        }
        if (!initialComments[post._id]) {
          initialComments[post._id] = [
            { username: 'design_geek', text: 'This looks incredibly aesthetic!' },
            { username: 'wanderlust_99', text: 'Stunning vibes here.' }
          ];
        }
      });

      setPostLikes(initialLikes);
      setPostComments(initialComments);
    } catch (err) {
      console.error(err);
      showToast('Could not load posts. Make sure backend is running on port 3000.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);


  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };


  const handleLike = (postId) => {
    setPostLikes(prev => {
      const current = prev[postId] || { count: 0, liked: false };
      return {
        ...prev,
        [postId]: {
          count: current.liked ? current.count - 1 : current.count + 1,
          liked: !current.liked
        }
      };
    });
  };


  const handleImageDoubleClick = (postId) => {

    setDoubleClickedHeart(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setDoubleClickedHeart(prev => ({ ...prev, [postId]: false }));
    }, 800);


    setPostLikes(prev => {
      const current = prev[postId] || { count: 0, liked: false };
      if (!current.liked) {
        return {
          ...prev,
          [postId]: { count: current.count + 1, liked: true }
        };
      }
      return prev;
    });
  };


  const handleBookmark = (postId) => {
    setBookmarkedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    showToast(bookmarkedPosts[postId] ? 'Post removed from saved collection' : 'Post saved to collection', 'success');
  };


  const handleCommentSubmit = (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPostComments(prev => ({
      ...prev,
      [postId]: [
        ...(prev[postId] || []),
        { username: 'you', text }
      ]
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };


  const toggleFollowSuggestion = (id) => {
    setSuggestions(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.following;
        showToast(nextState ? `Followed @${s.username}` : `Unfollowed @${s.username}`, 'success');
        return { ...s, following: nextState };
      }
      return s;
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        showToast('Please select a valid image file', 'error');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };


  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select or drag an image first!', 'error');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('caption', caption);

    try {
      const res = await fetch('/create-post', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error creating post');
      }

      const data = await res.json();
      showToast('Successfully published your post!', 'success');


      setIsCreateModalOpen(false);
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);


      fetchPosts();


      setCurrentTab('home');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Could not connect to database.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      { }
      <aside className="sidebar">
        <div className="logo-container">
          <span className="logo-text">Lumixogram</span>
        </div>
        <nav className="nav-links">
          <button
            className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentTab('home')}
          >
            <Home size={22} />
            <span>Home</span>
          </button>

          <button className="nav-link" onClick={() => showToast('Search functionality is simulated', 'success')}>
            <Search size={22} />
            <span>Search</span>
          </button>

          <button className="nav-link" onClick={() => showToast('Explore page is simulated', 'success')}>
            <Compass size={22} />
            <span>Explore</span>
          </button>

          <button className="nav-link" onClick={() => showToast('Direct Messages are simulated', 'success')}>
            <MessageCircle size={22} />
            <span>Messages</span>
          </button>

          <button className="nav-link" onClick={() => showToast('Notifications are simulated', 'success')}>
            <Heart size={22} />
            <span>Notifications</span>
          </button>

          <button
            className="nav-link"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusSquare size={22} />
            <span>Create</span>
          </button>

          <button
            className={`nav-link ${currentTab === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentTab('profile')}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              className="nav-profile-pic"
              alt="Profile"
            />
            <span>Profile</span>
          </button>
        </nav>
      </aside>

      { }
      <nav className="mobile-nav">
        <button className={`nav-link ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>
          <Home size={22} />
        </button>
        <button className="nav-link" onClick={() => showToast('Search simulated', 'success')}>
          <Search size={22} />
        </button>
        <button className="nav-link" onClick={() => setIsCreateModalOpen(true)}>
          <PlusSquare size={22} />
        </button>
        <button className="nav-link" onClick={() => showToast('Explore simulated', 'success')}>
          <Compass size={22} />
        </button>
        <button className={`nav-link ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setCurrentTab('profile')}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            className="nav-profile-pic"
            alt="Profile"
          />
        </button>
      </nav>

      { }
      <main className="main-content">
        {currentTab === 'home' ? (
          <div className="content-wrapper">
            { }
            <div className="feed-container">
              { }
              <div className="stories-container">
                <div className="story-item" onClick={() => showToast('Viewing story of your_profile', 'success')}>
                  <div className="story-avatar-wrapper">
                    <img className="story-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="" />
                  </div>
                  <span className="story-username">your_story</span>
                </div>
                <div className="story-item" onClick={() => showToast('Viewing story of cyber_traveler', 'success')}>
                  <div className="story-avatar-wrapper">
                    <img className="story-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="" />
                  </div>
                  <span className="story-username">neo_classicist</span>
                </div>
                <div className="story-item" onClick={() => showToast('Viewing story of sol_coder', 'success')}>
                  <div className="story-avatar-wrapper">
                    <img className="story-avatar" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="" />
                  </div>
                  <span className="story-username">retro_coder</span>
                </div>
                <div className="story-item" onClick={() => showToast('Viewing story of design_hub', 'success')}>
                  <div className="story-avatar-wrapper">
                    <img className="story-avatar" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" alt="" />
                  </div>
                  <span className="story-username">design_geek</span>
                </div>
              </div>

              { }
              {loading ? (
                <div className="loader-container">
                  <div className="spinner"></div>
                  <p className="loading-text">Loading fresh posts from database...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="empty-state">
                  <Camera size={44} className="drag-drop-icon" style={{ color: 'var(--accent-purple)' }} />
                  <h3 className="empty-state-title">No Posts Yet</h3>
                  <p className="empty-state-subtitle">Be the first to share an image and start the trend!</p>
                  <button className="empty-state-btn" onClick={() => setIsCreateModalOpen(true)}>
                    Create First Post
                  </button>
                </div>
              ) : (

                [...posts].reverse().map((post) => {
                  const postLikeData = postLikes[post._id] || { count: 0, liked: false };
                  const comments = postComments[post._id] || [];
                  const isBookmarked = !!bookmarkedPosts[post._id];
                  const hasHeartPop = !!doubleClickedHeart[post._id];

                  return (
                    <article key={post._id} className="post-card">
                      { }
                      <header className="post-header">
                        <div className="post-user-info">
                          <img
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                            className="user-avatar"
                            alt="User"
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="post-username">halley_user</span>
                            <span className="post-time">Active recently</span>
                          </div>
                        </div>
                        <button className="action-btn" onClick={() => showToast('Actions panel is simulated', 'success')}>
                          <MoreHorizontal size={18} />
                        </button>
                      </header>

                      { }
                      <div
                        className="post-image-container"
                        onDoubleClick={() => handleImageDoubleClick(post._id)}
                      >
                        <img
                          src={post.image}
                          className="post-image"
                          alt="Post Content"
                          loading="lazy"
                        />
                        { }
                        <div className={`double-click-heart ${hasHeartPop ? 'animate' : ''}`}>
                          <Heart fill="currentColor" size={72} style={{ color: 'var(--accent-red)' }} />
                        </div>
                      </div>

                      { }
                      <div className="post-actions">
                        <div className="action-buttons-left">
                          <button
                            className={`action-btn ${postLikeData.liked ? 'liked' : ''}`}
                            onClick={() => handleLike(post._id)}
                          >
                            <Heart size={24} fill={postLikeData.liked ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => showToast('Focusing comment field...', 'success')}
                          >
                            <MessageCircle size={24} />
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => showToast('Direct sharing is simulated', 'success')}
                          >
                            <Send size={24} />
                          </button>
                        </div>
                        <button
                          className={`action-btn ${isBookmarked ? 'bookmarked' : ''}`}
                          onClick={() => handleBookmark(post._id)}
                        >
                          <Bookmark size={24} fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      { }
                      <div className="post-likes">
                        {postLikeData.count.toLocaleString()} likes
                      </div>

                      { }
                      <div className="post-caption-section">
                        <span className="post-caption-username">halley_user</span>
                        <span className="post-caption-text">{post.caption}</span>
                      </div>

                      { }
                      {comments.length > 0 && (
                        <div className="post-comments-list">
                          {comments.map((comment, index) => (
                            <div key={index} className="comment-item">
                              <span className="comment-user">{comment.username}</span>
                              <span className="comment-text">{comment.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      { }
                      <form
                        className="comment-input-form"
                        onSubmit={(e) => handleCommentSubmit(e, post._id)}
                      >
                        <Smile size={20} className="action-btn" style={{ color: 'var(--text-secondary)' }} />
                        <input
                          type="text"
                          className="comment-field"
                          placeholder="Add a comment..."
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                        />
                        <button
                          type="submit"
                          className="comment-submit-btn"
                          disabled={!commentInputs[post._id]?.trim()}
                        >
                          Post
                        </button>
                      </form>
                    </article>
                  );
                })
              )}
            </div>

            { }
            <aside className="right-sidebar">
              <div className="current-user-card">
                <div className="current-user-info">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    className="user-avatar"
                    style={{ width: '44px', height: '44px' }}
                    alt="Active User"
                  />
                  <div className="current-user-names">
                    <span className="current-user-username">your_profile</span>
                    <span className="current-user-fullname">Instagram Creator</span>
                  </div>
                </div>
                <button className="switch-btn" onClick={() => setCurrentTab('profile')}>View</button>
              </div>

              <div className="suggestions-header">
                <span className="suggestions-title">Suggestions for you</span>
                <button className="see-all-btn" onClick={() => showToast('Showing all suggested users', 'success')}>See All</button>
              </div>

              <div className="suggestions-list">
                {suggestions.map((s) => (
                  <div key={s.id} className="suggestion-item">
                    <div className="suggestion-user">
                      <img className="suggestion-avatar" src={s.avatar} alt={s.username} />
                      <div className="suggestion-names">
                        <span className="suggestion-username">{s.username}</span>
                        <span className="suggestion-relation">{s.relation}</span>
                      </div>
                    </div>
                    <button
                      className={`follow-btn ${s.following ? 'following' : ''}`}
                      onClick={() => toggleFollowSuggestion(s.id)}
                    >
                      {s.following ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>

              <footer className="footer-links">
                <p>About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language</p>
                <p style={{ marginTop: '12px' }}>© 2026 INSTAGRAM CLONE BY ANTIGRAVITY</p>
              </footer>
            </aside>
          </div>
        ) : (

          <div className="profile-container">
            { }
            <header className="profile-header">
              <div className="profile-avatar-container">
                <img
                  className="profile-avatar"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  alt="Profile"
                />
              </div>
              <div className="profile-info">
                <div className="profile-username-row">
                  <h2 className="profile-username">your_profile</h2>
                  <button className="edit-profile-btn" onClick={() => setIsCreateModalOpen(true)}>Create Post</button>
                  <button className="edit-profile-btn" onClick={() => showToast('Profile editing is simulated', 'success')}>Edit Profile</button>
                </div>

                <div className="profile-stats-row">
                  <div className="stat-item">
                    <span className="stat-number">{posts.length}</span> posts
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">1,482</span> followers
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">621</span> following
                  </div>
                </div>

                <div className="profile-bio-row">
                  <span className="profile-fullname">Instagram Creator</span>
                  <p className="profile-bio">
                    ✨ Pixel Architect | Designing premium modern spaces <br />
                    🚀 Building with React, Vite & Node.js backend. <br />
                    🔗 portfolio.io/your_profile
                  </p>
                </div>
              </div>
            </header>

            { }
            <div className="profile-tabs">
              <button className="profile-tab active">
                <Grid size={14} />
                <span>Posts</span>
              </button>
              <button className="profile-tab" onClick={() => showToast('Reels section is simulated', 'success')}>
                <Tv size={14} />
                <span>Reels</span>
              </button>
              <button className="profile-tab" onClick={() => showToast('Saved items are simulated', 'success')}>
                <BookmarkIcon size={14} />
                <span>Saved</span>
              </button>
            </div>

            { }
            {loading ? (
              <div className="loader-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading posts grid...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state" style={{ marginTop: '20px' }}>
                <Camera size={40} style={{ color: 'var(--text-muted)' }} />
                <h3 className="empty-state-title">No Posts Yet</h3>
                <p className="empty-state-subtitle">Photos you share will appear here on your profile grid.</p>
                <button className="empty-state-btn" onClick={() => setIsCreateModalOpen(true)}>
                  Upload Photo
                </button>
              </div>
            ) : (
              <div className="profile-grid">
                {[...posts].reverse().map((post) => {
                  const likes = postLikes[post._id]?.count || 12;
                  const commentCount = postComments[post._id]?.length || 2;
                  return (
                    <div
                      key={post._id}
                      className="grid-item"
                      onClick={() => {

                        setCurrentTab('home');
                        showToast('Viewing full post in your Feed', 'success');
                      }}
                    >
                      <img src={post.image} className="grid-img" alt={post.caption} loading="lazy" />
                      <div className="grid-item-overlay">
                        <div className="overlay-stat">
                          <Heart size={18} fill="currentColor" />
                          <span>{likes}</span>
                        </div>
                        <div className="overlay-stat">
                          <MessageCircle size={18} fill="currentColor" />
                          <span>{commentCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      { }
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <button className="close-btn" onClick={() => setIsCreateModalOpen(false)}>
                <X size={20} />
              </button>
              <h2 className="modal-title">Create new post</h2>
              <button
                type="submit"
                form="createPostForm"
                className="comment-submit-btn"
                style={{ fontSize: '0.95rem' }}
                disabled={submitting || !selectedFile}
              >
                Share
              </button>
            </header>

            <div className="modal-body">
              <form id="createPostForm" onSubmit={handleCreatePost}>
                {!previewUrl ? (

                  <div
                    className={`drag-drop-area ${isDragging ? 'drag-active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <UploadCloud size={48} className="drag-drop-icon" />
                    <p className="drag-drop-text">Drag photos and videos here</p>
                    <p className="drag-drop-subtext">or click to browse from computer</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="file-input-hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (

                  <div className="preview-container">
                    <div className="preview-wrapper">
                      <img src={previewUrl} className="preview-img" alt="Preview Upload" />
                      <button
                        type="button"
                        className="remove-img-btn"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                { }
                <div className="form-fields-container">
                  <textarea
                    className="caption-textarea"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={1000}
                    disabled={submitting}
                  />

                  <button
                    type="submit"
                    className="submit-post-btn"
                    disabled={submitting || !selectedFile}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                        <span>Uploading post...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Publish Post</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      { }
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle size={20} style={{ color: 'var(--accent-green)' }} />
          ) : (
            <AlertCircle size={20} style={{ color: 'var(--accent-red)' }} />
          )}
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
