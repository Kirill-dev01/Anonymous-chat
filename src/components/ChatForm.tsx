import React, { useState } from 'react';

interface ChatFormProps {
    onSend: (content: string) => void;
}

export default function ChatForm({ onSend }: ChatFormProps) {
    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSending(true);
        await onSend(text);
        setText(''); // Очищаем после успешной отправки
        setIsSending(false);
    };

    return (
        <form className="chat-form" onSubmit={handleSubmit}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Введите сообщение..."
                disabled={isSending}
                autoComplete="off"
            />
            <button type="submit" disabled={isSending || !text.trim()}>
                {isSending ? '...' : '➤'}
            </button>
        </form>
    );
}