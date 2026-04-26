import React from 'react';
import { Message } from '../App';

interface ChatMessageProps {
    message: Message;
    isOwn: boolean;
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
    return (
        <div className={`message-wrapper ${isOwn ? 'own-message' : 'other-message'}`}>
            {!isOwn && <div className="message-sender">User {message.userId.slice(0, 5)}</div>}
            <div className="message-bubble">
                {message.content}
            </div>
        </div>
    );
}