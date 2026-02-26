import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/chatService';
import { useSession } from '../../hooks/useSession';
import type { Message } from '../../types/game';
import styles from './ChatPanel.module.scss';

export const ChatPanel: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { currentPlayer } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sub = chatService.subscribeToMessages(roomId, (payload) => {
      if (payload.new) {
        setMessages((prev) => [...prev, payload.new as Message]);
      }
    });
    return () => { sub.unsubscribe(); };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentPlayer) return;
    await chatService.sendMessage(roomId, currentPlayer.id, input.trim());
    setInput('');
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageList} ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={m.player_id === currentPlayer?.id ? styles.myMsg : styles.otherMsg}>
            <span className={styles.sender}>
              {m.player_id === currentPlayer?.id ? 'You' : 'Player'}
            </span>
            <p className={styles.text}>{m.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={send} className={styles.form}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Send a message..." 
        />
        <button type="submit" disabled={!input.trim()}>Send</button>
      </form>
    </div>
  );
};