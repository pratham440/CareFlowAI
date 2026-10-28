import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  CalendarPlus,
  PhoneCall,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { CLINIC_INFO } from '../data/mockData';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    action: 'appointment' | 'callback';
  };
}

export const AiAssistantView: React.FC = () => {
  const { setIsNewAppointmentOpen, setIsNewFollowUpOpen } = useClinic();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am CareFlow's Administrative Assistant. I can assist you with clinic hours, contact details, booking appointment requests, and scheduling callbacks.\n\nPlease note: I am an administrative assistant only and cannot provide medical diagnosis, clinical evaluation, or emergency medical advice.`,
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'What are your clinic hours?',
    'How do I request an appointment?',
    'Can someone call me back?',
    'How do I contact the clinic?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate realistic typing response
    setTimeout(() => {
      const response = generateAdministrativeResponse(query);
      const botMsg: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: response.actionButton,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const generateAdministrativeResponse = (
    query: string
  ): { text: string; actionButton?: { label: string; action: 'appointment' | 'callback' } } => {
    const q = query.toLowerCase();

    // 1. Clinic hours
    if (q.includes('hour') || q.includes('time') || q.includes('open') || q.includes('closed')) {
      return {
        text: `Our clinic operating hours are:\n• Monday to Friday: 8:00 AM – 6:00 PM\n• Saturday: 9:00 AM – 2:00 PM\n• Sunday: Closed\n\nFor urgent care after hours, please visit our partnered regional urgent care center or dial 911 for emergencies.`,
      };
    }

    // 2. Request an appointment
    if (q.includes('appointment') || q.includes('book') || q.includes('schedule') || q.includes('visit') || q.includes('doctor')) {
      return {
        text: `You can submit an appointment request directly through this system. Once submitted, our front-desk coordinators review your preferred date, time, and department, then confirm availability.\n\nClick the button below to complete the official appointment request form now:`,
        actionButton: {
          label: 'Open Appointment Booking Form',
          action: 'appointment',
        },
      };
    }

    // 3. Callback request
    if (q.includes('call') || q.includes('callback') || q.includes('phone me') || q.includes('ring')) {
      return {
        text: `Our clinic staff can gladly give you a phone callback during operating hours. Callbacks are typically fulfilled within 1 business day for routine matters.\n\nClick below to log your callback request directly into our staff follow-up queue:`,
        actionButton: {
          label: 'Schedule Patient Callback',
          action: 'callback',
        },
      };
    }

    // 4. Contact info
    if (q.includes('contact') || q.includes('phone') || q.includes('address') || q.includes('location') || q.includes('email') || q.includes('reach')) {
      return {
        text: `Here is our official clinic contact information:\n\n• Phone: ${CLINIC_INFO.phone}\n• Address: ${CLINIC_INFO.address}\n• Front Desk Email: frontdesk@careflowhealth.org\n• Patient Portal: mycare.careflowhealth.org\n\nReception is on the 3rd floor with validated parking available in the West Garage.`,
      };
    }

    // 5. Medical symptoms / diagnosis boundary check
    if (
      q.includes('hurt') ||
      q.includes('pain') ||
      q.includes('symptom') ||
      q.includes('chest') ||
      q.includes('fever') ||
      q.includes('cough') ||
      q.includes('diagnos') ||
      q.includes('medicine') ||
      q.includes('prescription')
    ) {
      return {
        text: `Important Clinical Boundary: CareFlow AI is strictly an administrative assistant and cannot evaluate clinical symptoms or provide medical diagnoses.\n\nIf you have a life-threatening symptom or severe distress, please call 911 immediately. For non-urgent inquiries, please book a consultation with our licensed clinical providers:`,
        actionButton: {
          label: 'Book Consultation with Physician',
          action: 'appointment',
        },
      };
    }

    // Default polite administrative fallback
    return {
      text: `Thank you for your message. As an administrative assistant, I can assist you with appointment bookings, callback requests, clinic operating hours, and general front-desk logistics.\n\nWould you like to schedule an appointment or have our receptionist call you back?`,
      actionButton: {
        label: 'Open Appointment Form',
        action: 'appointment',
      },
    };
  };

  const handleAction = (action: 'appointment' | 'callback') => {
    if (action === 'appointment') {
      setIsNewAppointmentOpen(true);
    } else {
      setIsNewFollowUpOpen(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Banner Notice */}
      <div className="flex items-center justify-between p-4 bg-sky-50/70 rounded-xl border border-sky-200/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-100 text-sky-800">
            <Sparkles className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Administrative AI Concierge (Demo Version)
            </h2>
            <p className="text-xs text-slate-600">
              Interactive visitor assistant for clinic inquiries, hours, and booking requests
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-teal-800 font-medium px-2.5 py-1 bg-teal-50 border border-teal-200/80 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Non-Clinical / Administrative</span>
        </div>
      </div>

      {/* Suggested Questions Strip */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2.5">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Frequently Asked Inquiries</span>
          <span className="text-xs text-slate-500">· Click any to try</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300 border border-slate-200 rounded-lg transition-colors cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Sender label and timestamp */}
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">
                  {msg.sender === 'user' ? 'You (Visitor)' : 'CareFlow Concierge'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-sky-700 text-white rounded-tr-xs'
                    : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {msg.text}

                {/* Clearly labeled demo response footer on assistant messages */}
                {msg.sender === 'assistant' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/70 text-[10px] text-slate-600 flex items-center justify-between">
                    <span>Administrative Assistant · Demo Response</span>
                  </div>
                )}
              </div>

              {/* Functional Action Button if provided */}
              {msg.actionButton && (
                <div className="mt-2 ml-1">
                  <button
                    type="button"
                    onClick={() => handleAction(msg.actionButton!.action)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    {msg.actionButton.action === 'appointment' ? (
                      <CalendarPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                    ) : (
                      <PhoneCall className="w-3.5 h-3.5 stroke-[2.2]" />
                    )}
                    <span>{msg.actionButton.label}</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col items-start">
              <span className="text-[11px] text-slate-600 mb-1 px-1">CareFlow Concierge is typing...</span>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 text-sm text-slate-500 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-slate-50/70 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type an administrative question (e.g. 'How do I request an appointment?')..."
              className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400 shadow-2xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-4 py-2.5 text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="mt-1.5 text-center text-[11px] text-slate-600">
            CareFlow AI answers administrative questions and routes requests to clinic staff.
          </div>
        </div>
      </div>
    </div>
  );
};
