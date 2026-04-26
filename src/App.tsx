import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './components/ChatMessage';
import ChatForm from './components/ChatForm';
import './App.css';

export interface Message {
  id: number;
  userId: string;
  content: string;
}

const API_URL = 'http://localhost:7070/messages';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [lastMessageId, setLastMessageId] = useState<number>(0);

  // Ref для автоскролла вниз
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Инициализация userId
  useEffect(() => {
    let savedUserId = localStorage.getItem('chatUserId');
    if (!savedUserId) {
      savedUserId = uuidv4();
      localStorage.setItem('chatUserId', savedUserId);
    }
    setUserId(savedUserId);
  }, []);

  // Функция для получения сообщений
  const fetchMessages = async (fromId: number) => {
    try {
      const response = await fetch(`${API_URL}?from=${fromId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const newMessages: Message[] = await response.json();

      if (newMessages.length > 0) {
        setMessages(prev => {
          // Защита от дублей (на всякий случай)
          const combined = [...prev, ...newMessages];
          const uniqueIds = new Set();
          return combined.filter(msg => {
            if (!uniqueIds.has(msg.id)) {
              uniqueIds.add(msg.id);
              return true;
            }
            return false;
          });
        });

        // Обновляем последний ID
        const highestId = Math.max(...newMessages.map(m => m.id));
        setLastMessageId(highestId);
      }
    } catch (error) {
      console.error('Ошибка получения сообщений:', error);
    }
  };

  // 2. Периодический опрос сервера (Polling)
  useEffect(() => {
    // Делаем немедленный запрос при загрузке
    fetchMessages(lastMessageId);

    const interval = setInterval(() => {
      fetchMessages(lastMessageId);
    }, 3000); // Опрос каждые 3 секунды

    return () => clearInterval(interval);
  }, [lastMessageId]); // Перезапускаем эффект, когда меняется lastMessageId

  // Автоскролл вниз при добавлении новых сообщений (Advanced фича)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Отправка сообщения
  const handleSendMessage = async (content: string) => {
    if (!userId) return;

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 0, userId, content }),
      });
      // После успешной отправки можно сразу дергнуть сервер, чтобы не ждать 3 секунды
      fetchMessages(lastMessageId);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Anonymous Chat</h2>
        <span className="user-badge">ID: {userId.slice(0, 5)}...</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">Нет сообщений. Напишите первым!</div>
        ) : (
          messages.map(msg => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isOwn={msg.userId === userId}
            />
          ))
        )}
        {/* Пустой div для автоскролла */}
        <div ref={messagesEndRef} />
      </div>

      <ChatForm onSend={handleSendMessage} />
    </div>
  );
}