import { useCallback, useEffect, useRef, useState } from 'react';

export function useSermonPlayer(sermonPath) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    stop();
  }, [sermonPath, stop]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !sermonPath) return;

    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [sermonPath]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !sermonPath) return;

    try {
      setIsLoading(true);
      await audio.play();
    } catch {
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [sermonPath]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return {
    audioRef,
    hasSermon: Boolean(sermonPath),
    isPlaying,
    isLoading,
    play,
    pause,
    stop,
    togglePlayPause,
  };
}
