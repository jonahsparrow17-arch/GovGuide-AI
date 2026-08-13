import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import { ChatResponse, GovernmentService } from '../types';
import { Bot, User, Send, Sparkles, ExternalLink, RefreshCw, Copy, Check, ShieldAlert, BookOpen } from 'lucide-react';

interface AIChatPageProps {
  initialServiceSlug?: string;
  initialMessage?: string;
  availableServices?: GovernmentService[];
  onSelectService?: (slug: string) => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  service?: string;
  source?: string;
  suggestedQuestions?: string[];
  timestamp: Date;
}

export const AIChatPage: React.FC<AIChatPageProps> = ({
  initialServiceSlug,
  initialMessage,
  availableServices = [],
  onSelectService
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your **GovGuide AI Assistant**.\n\nAsk me any question about government service procedures, required documents, eligibility, or application steps for **Passport**, **Aadhaar**, **PAN Card**, **Driving Licence**, or **Voter ID**.',
      suggestedQuestions: [
        'What documents do I need for a fresh passport?',
        'How do I apply for a free Instant e-PAN card?',
        'What is the procedure for a driving licence test?',
        'How to update address in Aadhaar card?'
      ],
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>(initialServiceSlug || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle initial trigger
  useEffect(() => {
    if (initialMessage) {
      handleSend(initialMessage);
    }
  }, [initialMessage]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsgId = 'user-' + Date.now();
    const newMsg: MessageItem = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await sendChatMessage({
        message: query,
        serviceSlug: selectedServiceSlug || undefined
      });

      const aiMsg: MessageItem = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: response.answer,
        service: response.service,
        source: response.source,
        suggestedQuestions: response.suggestedQuestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          text: 'I encountered an error reaching the guidance engine. Please check your connection or select a service from the menu.',
          source: 'https://india.gov.in',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedText = (text: string) => {
    // Simple markdown renderer for bold, lists, and headers
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;

      // Header h3 or h4
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-bold text-slate-900 text-base mt-3 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-bold text-slate-900 text-lg mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }

      // Bullet lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const listText = line.replace(/^[-*]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-slate-800 text-xs sm:text-sm my-0.5 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(listText) }} />
          </li>
        );
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const numText = line.replace(/^\d+\.\s/, '');
        return (
          <p key={idx} className="ml-2 text-slate-800 text-xs sm:text-sm my-1 leading-relaxed font-medium">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          </p>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-slate-800 text-xs sm:text-sm leading-relaxed my-1">
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
        </p>
      );
    });
  };

  const formatInlineMarkdown = (str: string) => {
    // Convert **bold** and [link](url)
    let formatted = str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-indigo-600 underline font-medium">$1</a>');
    return formatted;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-bold">GovGuide AI Citizen Assistant</h1>
            </div>
            <p className="text-xs text-slate-300">
              Ask questions about eligibility, documents, step-by-step procedures, or common errors.
            </p>
          </div>

          {/* Service Filter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 whitespace-nowrap">Context:</span>
            <select
              value={selectedServiceSlug}
              onChange={(e) => setSelectedServiceSlug(e.target.value)}
              className="bg-slate-800 text-white text-xs border border-slate-700 rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Services (General)</option>
              {availableServices.map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
        {/* Chat scroll area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-900'
                }`}
              >
                {/* Header info for AI messages */}
                {msg.sender === 'ai' && msg.service && (
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-200/60">
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {msg.service}
                    </span>
                    <span className="text-[10px] text-slate-500">Database Context Applied</span>
                  </div>
                )}

                {/* Body Content */}
                <div className={msg.sender === 'user' ? 'text-white text-xs sm:text-sm leading-relaxed' : ''}>
                  {msg.sender === 'user' ? msg.text : renderFormattedText(msg.text)}
                </div>

                {/* Source attribution and actions for AI */}
                {msg.sender === 'ai' && (
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    {msg.source && (
                      <a
                        href={msg.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Official Source Portal</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy Answer'}</span>
                    </button>
                  </div>
                )}

                {/* Suggested Follow-ups */}
                {msg.sender === 'ai' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                      Suggested Next Questions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q)}
                          className="text-[11px] bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 px-2.5 py-1 rounded-lg transition-colors text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Consulting verified government service procedures...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question (e.g. What documents are needed for passport renewal?)"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-indigo-400" />
            <span>GovGuide AI provides educational information. Verify official details on government portals.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
