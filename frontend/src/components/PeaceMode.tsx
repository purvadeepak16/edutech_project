import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Music, Sparkles, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PeaceModeProps {
  onClose: () => void;
}

const affirmations = [
  "You are capable of amazing things 💪",
  "Take it one step at a time 🌟",
  "Your effort matters more than perfection ✨",
  "You're doing better than you think 🌈",
  "Rest is productive too 😌",
  "You deserve this break 🌸",
  "Progress, not perfection 🎯",
  "You've got this! 💫",
  "Believe in yourself 🌺",
  "Every small step counts 🦋",
  "You are enough 💖",
  "Breathe. You're going to be okay 🌿",
];

const breathingPatterns = [
  { name: "Box Breathing", phases: [4, 4, 4, 4], labels: ["Breathe In", "Hold", "Breathe Out", "Hold"] },
  { name: "4-7-8 Technique", phases: [4, 7, 8, 0], labels: ["Breathe In", "Hold", "Breathe Out", ""] },
  { name: "Calm Breathing", phases: [4, 2, 6, 2], labels: ["Breathe In", "Hold", "Breathe Out", "Pause"] },
];

// Using reliable audio sources from freesound.org and other CDNs
const sounds = [
  { 
    id: 'rain', 
    name: 'Rain', 
    emoji: '🌧️', 
    color: 'from-blue-500/20 to-cyan-500/20',
    // Multiple fallback URLs
    urls: [
      'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3',
      'https://cdn.pixabay.com/audio/2022/05/13/audio_2985d280d4.mp3'
    ]
  },
  { 
    id: 'ocean', 
    name: 'Ocean Waves', 
    emoji: '🌊', 
    color: 'from-teal-500/20 to-blue-500/20',
    urls: [
      'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3',
      'https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3'
    ]
  },
  { 
    id: 'wind', 
    name: 'Wind', 
    emoji: '🍃', 
    color: 'from-green-500/20 to-emerald-500/20',
    urls: [
      'https://assets.mixkit.co/active_storage/sfx/2389/2389-preview.mp3'
    ]
  },
  { 
    id: 'birds', 
    name: 'Birds', 
    emoji: '🐦', 
    color: 'from-yellow-500/20 to-orange-500/20',
    urls: [
      'https://assets.mixkit.co/active_storage/sfx/2387/2387-preview.mp3'
    ]
  },
  { 
    id: 'fire', 
    name: 'Fireplace', 
    emoji: '🔥', 
    color: 'from-orange-500/20 to-red-500/20',
    urls: [
      'https://assets.mixkit.co/active_storage/sfx/2391/2391-preview.mp3'
    ]
  },
  { 
    id: 'nature', 
    name: 'Nature', 
    emoji: '🌿', 
    color: 'from-purple-500/20 to-pink-500/20',
    urls: [
      'https://assets.mixkit.co/active_storage/sfx/2392/2392-preview.mp3'
    ]
  },
];

const PeaceMode: React.FC<PeaceModeProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'breathe' | 'affirmation' | 'sounds'>('breathe');
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [affirmation, setAffirmation] = useState(affirmations[0]);
  const [soundPlaying, setSoundPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pattern = breathingPatterns[selectedPattern];
  const currentPhase = pattern.phases[breathPhase];
  const currentLabel = pattern.labels[breathPhase];

  useEffect(() => {
    if (breathing && currentPhase > 0) {
      const timer = setTimeout(() => {
        const nextPhase = (breathPhase + 1) % pattern.phases.length;
        setBreathPhase(nextPhase);
        if (nextPhase === 0) setBreathCount(prev => prev + 1);
      }, currentPhase * 1000);
      return () => clearTimeout(timer);
    }
  }, [breathing, breathPhase, currentPhase, pattern.phases.length]);

  // Update audio volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startBreathing = () => {
    setBreathing(true);
    setBreathPhase(0);
    setBreathCount(0);
  };

  const stopBreathing = () => {
    setBreathing(false);
    setBreathPhase(0);
  };

  const getNewAffirmation = () => {
    const newAff = affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(newAff);
  };

  const tryAudioUrl = async (urls: string[], index: number = 0): Promise<HTMLAudioElement> => {
    if (index >= urls.length) {
      throw new Error('All audio URLs failed to load');
    }

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      audio.src = urls[index];
      audio.volume = volume;
      audio.loop = true;

      const handleCanPlay = () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        resolve(audio);
      };

      const handleError = async () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        
        console.log(`Audio URL ${index + 1} failed, trying next...`);
        
        // Try next URL
        try {
          const nextAudio = await tryAudioUrl(urls, index + 1);
          resolve(nextAudio);
        } catch (err) {
          reject(err);
        }
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);
      
      audio.load();
    });
  };

  const toggleSound = async (sound: typeof sounds[0]) => {
    if (soundPlaying === sound.id) {
      // Stop current sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setSoundPlaying(null);
      setIsLoading(false);
    } else {
      // Stop previous sound if any
      if (audioRef.current) {
        audioRef.current.pause();
      }

      try {
        setIsLoading(true);
        
        // Try to load audio with fallbacks
        const audio = await tryAudioUrl(sound.urls);
        
        // Play the audio
        await audio.play();
        audioRef.current = audio;
        setSoundPlaying(sound.id);
        setIsLoading(false);
        
        toast({
          title: "🎵 Sound Playing",
          description: `Now playing: ${sound.name}`,
        });
      } catch (error) {
        console.error('Error playing sound:', error);
        setIsLoading(false);
        setSoundPlaying(null);
        
        toast({
          title: "Audio Error",
          description: `Unable to play ${sound.name}. This sound may not be available.`,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-950/90 via-indigo-950/90 to-blue-950/90 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-purple-500/30"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Peace Mode</h2>
              <p className="text-sm text-purple-300">Take a mindful break</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 bg-black/20">
          <button
            onClick={() => setActiveTab('breathe')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'breathe'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-purple-300 hover:bg-white/20'
            }`}
          >
            <Wind className="w-5 h-5 mx-auto mb-1" />
            Breathe
          </button>
          <button
            onClick={() => setActiveTab('affirmation')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'affirmation'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-purple-300 hover:bg-white/20'
            }`}
          >
            Affirm
          </button>
          <button
            onClick={() => setActiveTab('sounds')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'sounds'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-purple-300 hover:bg-white/20'
            }`}
          >
            <Music className="w-5 h-5 mx-auto mb-1" />
            Sounds
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {/* Breathing Tab */}
            {activeTab === 'breathe' && (
              <motion.div
                key="breathe"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Pattern Selection */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {breathingPatterns.map((pat, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPattern(idx);
                        stopBreathing();
                      }}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        selectedPattern === idx
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-purple-300 hover:bg-white/20'
                      }`}
                    >
                      {pat.name}
                    </button>
                  ))}
                </div>

                {/* Breathing Circle */}
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{
                      scale: breathing ? [1, 1.5, 1.5, 1] : 1,
                      opacity: breathing ? [0.6, 1, 1, 0.6] : 0.8,
                    }}
                    transition={{
                      duration: pattern.phases.reduce((a, b) => a + b, 0),
                      repeat: breathing ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-2xl"
                  >
                    <div className="text-center text-white">
                      <p className="text-2xl font-bold mb-2">
                        {breathing ? currentLabel : 'Ready'}
                      </p>
                      {breathing && (
                        <p className="text-4xl font-black">{currentPhase}s</p>
                      )}
                    </div>
                  </motion.div>

                  {breathing && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 text-purple-300 text-lg"
                    >
                      Cycle {breathCount + 1}
                    </motion.p>
                  )}
                </div>

                {/* Control Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={breathing ? stopBreathing : startBreathing}
                    className={`px-8 py-6 text-lg font-bold rounded-2xl transition-all ${
                      breathing
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    }`}
                  >
                    {breathing ? 'Stop' : 'Start Breathing'}
                  </Button>
                </div>

                <p className="text-center text-purple-300 text-sm mt-4">
                  {pattern.name} helps reduce stress and anxiety
                </p>
              </motion.div>
            )}

            {/* Affirmation Tab */}
            {activeTab === 'affirmation' && (
              <motion.div
                key="affirmation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 p-12">
                  <motion.p
                    key={affirmation}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-center text-white leading-relaxed"
                  >
                    {affirmation}
                  </motion.p>
                </Card>

                <div className="flex justify-center">
                  <Button
                    onClick={getNewAffirmation}
                    className="px-8 py-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    New Affirmation
                  </Button>
                </div>

                <p className="text-center text-purple-300 text-sm">
                  Positive affirmations can boost confidence and reduce stress
                </p>
              </motion.div>
            )}

            {/* Sounds Tab */}
            {activeTab === 'sounds' && (
              <motion.div
                key="sounds"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {sounds.map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => toggleSound(sound)}
                      disabled={isLoading && soundPlaying !== sound.id}
                      className={`p-6 rounded-2xl transition-all ${
                        soundPlaying === sound.id
                          ? `bg-gradient-to-br ${sound.color} border-2 border-white/50 scale-105`
                          : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
                      } ${isLoading && soundPlaying !== sound.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-5xl mb-2">{sound.emoji}</div>
                      <p className="text-white font-medium">{sound.name}</p>
                      {soundPlaying === sound.id && !isLoading && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-2"
                        >
                          <Volume2 className="w-5 h-5 mx-auto text-white animate-pulse" />
                        </motion.div>
                      )}
                      {isLoading && soundPlaying === sound.id && (
                        <div className="mt-2">
                          <Loader2 className="w-5 h-5 mx-auto text-white animate-spin" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {soundPlaying && (
                  <Card className="bg-white/10 border-white/20 p-4">
                    <div className="flex items-center gap-3">
                      {volume > 0 ? (
                        <Volume2 className="w-5 h-5 text-white" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-white" />
                      )}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume * 100}
                        onChange={(e) => setVolume(Number(e.target.value) / 100)}
                        className="flex-1 accent-purple-500"
                      />
                      <span className="text-white text-sm w-12 text-right">{Math.round(volume * 100)}%</span>
                    </div>
                  </Card>
                )}

                <p className="text-center text-purple-300 text-sm">
                  {soundPlaying 
                    ? 'Click the playing sound to stop it' 
                    : 'Click any sound to start playing calming audio'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PeaceMode;