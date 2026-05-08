import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, User, Sparkles, TrendingUp, Zap, Send } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState(() => {
    const saved = localStorage.getItem('nutrihealth_likes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nutrihealth_likes', JSON.stringify(likedPosts));
  }, [likedPosts]);

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPosts(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        } else if (payload.eventType === 'DELETE') {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    if (error) console.error('Error fetching posts:', error);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from('posts')
      .insert([
        { 
          author: 'User_' + Math.floor(Math.random() * 1000), 
          content: newPost, 
          likes_count: 0, 
          comments_count: 0, 
          score: 'A',
          avatar: 'U'
        }
      ]);

    if (!error) {
      setNewPost('');
    } else {
      console.error('Error creating post:', error);
    }
    setIsSubmitting(false);
  };

  const handleLike = async (postId, currentLikes) => {
    if (likedPosts.includes(postId)) return;

    const { error } = await supabase
      .from('posts')
      .update({ likes_count: (currentLikes || 0) + 1 })
      .eq('id', postId);

    if (!error) {
      setLikedPosts(prev => [...prev, postId]);
    } else {
      console.error('Error liking post:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}
    >
      {/* 1. New Post Creation */}
      <motion.div 
        variants={itemVariants}
        style={{ 
          background: 'white',
          borderRadius: '32px',
          padding: '20px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(0,0,0,0.02)'
        }}
      >
        <form onSubmit={handleCreatePost} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: '16px', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--color-primary)', flexShrink: 0 }}>
            U
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              placeholder="What's your fitness score today?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                resize: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                padding: '8px 0',
                outline: 'none',
                minHeight: '60px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting || !newPost.trim()}
                style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  opacity: (isSubmitting || !newPost.trim()) ? 0.6 : 1
                }}
              >
                {isSubmitting ? 'Posting...' : <><Send size={16} /> Post</>}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* 2. Community Highlights (Horizontal Scroller) */}
      <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', overflowX: 'auto', margin: '0 -20px', padding: '0 20px', scrollbarWidth: 'none' }}>
         {[
           { label: 'Weekly Peak', user: 'Alex_V', icon: <TrendingUp size={14} />, color: '#34c759' },
           { label: 'Hypertrophy King', user: 'Jon_Bio', icon: <Zap size={14} />, color: '#ff9500' },
           { label: 'Macro Master', user: 'Elena_F', icon: <Sparkles size={14} />, color: '#5856d6' }
         ].map((card, i) => (
           <div key={i} style={{ minWidth: '160px', background: 'white', padding: '16px', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: card.color, marginBottom: '8px' }}>
                 {card.icon}
                 <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>{card.label}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{card.user}</div>
           </div>
         ))}
      </motion.div>

      {/* 3. Engagement Feed */}
      <AnimatePresence mode="popLayout">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            variants={itemVariants}
            layout
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            style={{ 
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '32px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient Background Gradient for Premium feel */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '16px', background: 'linear-gradient(135deg, var(--color-primary) 0%, #4a90e2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(var(--color-primary-rgb), 0.2)' }}>
                     {post.avatar || (post.author ? post.author[0] : 'U')}
                  </div>
                  <div>
                     <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{post.author || 'Anonymous'}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • NutriScore: <span style={{ color: 'var(--color-primary)', fontWeight: 900 }}>{post.score}</span>
                     </div>
                  </div>
               </div>
               <motion.div whileHover={{ rotate: 90 }} style={{ cursor: 'pointer' }}>
                 <MoreHorizontal size={20} color="var(--color-border)" />
               </motion.div>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: '20px' }}>
              {post.content}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '16px' }}>
               <div style={{ display: 'flex', gap: '20px' }}>
                  <motion.div 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleLike(post.id, post.likes_count)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      color: likedPosts.includes(post.id) ? 'var(--color-primary)' : 'var(--color-text-tertiary)', 
                      fontWeight: 800, 
                      fontSize: '0.85rem', 
                      cursor: likedPosts.includes(post.id) ? 'default' : 'pointer' 
                    }}
                  >
                     <AnimatePresence mode="wait">
                       <motion.div
                         key={likedPosts.includes(post.id) ? 'liked' : 'unliked'}
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.8, opacity: 0 }}
                         transition={{ duration: 0.15 }}
                       >
                         <Heart 
                           size={20} 
                           style={{ 
                             fill: likedPosts.includes(post.id) ? 'var(--color-primary)' : 'none', 
                             stroke: likedPosts.includes(post.id) ? 'var(--color-primary)' : 'currentColor' 
                           }} 
                         />
                       </motion.div>
                     </AnimatePresence>
                     {post.likes_count}
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-tertiary)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
                     <MessageCircle size={20} /> {post.comments_count}
                  </motion.div>
               </div>
               <motion.div whileHover={{ scale: 1.1 }} style={{ cursor: 'pointer' }}>
                 <Share2 size={20} color="var(--color-border)" />
               </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

    </motion.div>
  );
}
