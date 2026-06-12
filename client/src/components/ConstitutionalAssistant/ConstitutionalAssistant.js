
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ConstitutionalAssistant.module.css';
import chakraLogo from '../../assets/samvidhan-logo.png';


const STORAGE_KEY = 'samvidhan-ai-chat-history';

const SUGGESTIONS = [
    'What are Fundamental Rights?',
    'Explain Article 21',
    'What is Judicial Review?',
    'Explain the Preamble',
    'What are Fundamental Duties?'
];

export default function ConstitutionalAssistant() {
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLabel, setShowLabel] = useState(true);

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [];
            }
        }

        return [
            {
                role: 'assistant',
                text: `🇮🇳 Welcome to Samvidhan AI

I am your Constitutional Learning Assistant.

I can help you understand:

• Fundamental Rights
• Fundamental Duties
• Constitutional Articles
• Parliament
• Judiciary
• Amendments
• Landmark Cases

Ask any question related to the Constitution of India.`
            }
        ];
    });

    const endRef = useRef(null);

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(messages)
        );
    }, [messages]);

    useEffect(() => {
        endRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [messages, loading]);

    useEffect(() => {
        if (!open) {
          setShowLabel(true);
      
          const timer = setTimeout(() => {
            setShowLabel(false);
          }, 5000);
      
          return () => clearTimeout(timer);
        }
      }, [open]);

    const askQuestion = async (customQuestion = null) => {
        if (loading) return;

        const userQuestion =
            customQuestion || question.trim();

        if (!userQuestion) return;

        const userMessage = {
            role: 'user',
            text: userQuestion
        };

        setMessages(prev => [...prev, userMessage]);

        setQuestion('');
        setLoading(true);

        try {
            const response = await fetch(
                'http://localhost:5000/api/constitutional-assistant',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        question: userQuestion
                    })
                }
            );

            const data = await response.json();

            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    text:
                        data.answer ||
                        'Sorry, I could not generate a response.'
                }
            ]);
        } catch (error) {
            console.error(error);

            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    text:
                        'Unable to connect to Samvidhan AI.'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            askQuestion();
        }
    };

    const clearChat = () => {
        const welcomeMessage = [
            {
                role: 'assistant',
                text: `🇮🇳 Welcome to Samvidhan AI

I am your Constitutional Learning Assistant.

Ask any question related to the Constitution of India.`
            }
        ];

        setMessages(welcomeMessage);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <>
        {!open && showLabel && (
    <div className={styles.chatbotLabel}>
      Ask Samvidhan AI
    </div>
  )}
            <button
                className={`${styles.assistantButton} ${!open ? styles.bounce : ''
                    }`}
                onClick={() => setOpen(!open)}
            >
                <img
                    src={chakraLogo}
                    alt="Samvidhan AI"
                    className={styles.assistantIcon}
                />
            </button>

            {open && (
                <div className={styles.chatContainer}>
                    <div className={styles.header}>
                        <div className={styles.headerInfo}>
                            <img
                                src={chakraLogo}
                                alt="Samvidhan AI"
                                className={styles.headerLogo}
                            />

                            <div>
                                <h3>Samvidhan AI</h3>
                                <span>
                                    Constitution Assistant
                                </span>
                            </div>
                        </div>

                        <div className={styles.headerActions}>
                            <button
                                onClick={clearChat}
                                className={styles.clearButton}
                            >
                                Clear
                            </button>

                            <button
                                className={styles.closeButton}
                                onClick={() => setOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className={styles.messages}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={
                                    msg.role === 'user'
                                        ? styles.userMessage
                                        : styles.aiMessage
                                }
                            >
                                <ReactMarkdown>
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                        ))}

                        {loading && (
                            <div
                                className={`${styles.aiMessage} ${styles.typing}`}
                            >
                                Samvidhan AI is thinking...
                            </div>
                        )}

                        <div ref={endRef} />
                    </div>

                    <div className={styles.suggestions}>
                        <div
                            className={styles.suggestionTitle}
                        >
                            Popular Questions
                        </div>

                        {SUGGESTIONS.map(item => (
                            <button
                                key={item}
                                disabled={loading}
                                className={styles.suggestionChip}
                                onClick={() =>
                                    askQuestion(item)
                                }
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className={styles.inputArea}>
                        <textarea
                            value={question}
                            disabled={loading}
                            onChange={e =>
                                setQuestion(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about Articles, Rights, Duties..."
                            className={styles.input}
                        />

                        <button
                            onClick={() => askQuestion()}
                            disabled={loading}
                            className={styles.sendButton}
                        >
                            Ask
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

